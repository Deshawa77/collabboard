import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "../components/Auth/Login";
import { loginUser } from "../api/api";

jest.mock("../api/api", () => ({
  loginUser: jest.fn(),
}));

describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login form", () => {
    render(
      <Login
        onLogin={() => {}}
        onSwitchToRegister={() => {}}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Welcome back" })
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Sign In" })
    ).toBeInTheDocument();
  });

  test("submits login credentials", async () => {
    const onLogin = jest.fn();

    loginUser.mockResolvedValue({
      token: "test-token",
      user: {
        name: "Test User",
        email: "test@example.com",
      },
    });

    render(
      <Login
        onLogin={onLogin}
        onSwitchToRegister={() => {}}
      />
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Sign In" })
    );

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(onLogin).toHaveBeenCalled();
  });

  test("displays an API error when login fails", async () => {
    loginUser.mockRejectedValue(
      new Error("Invalid email or password")
    );

    render(
      <Login
        onLogin={() => {}}
        onSwitchToRegister={() => {}}
      />
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "wrong@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Sign In" })
    );

    expect(
      await screen.findByText("Invalid email or password")
    ).toBeInTheDocument();
  });
});
