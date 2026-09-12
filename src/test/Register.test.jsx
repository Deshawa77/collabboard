import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Register from "../components/Auth/Register";
import { registerUser } from "../api/api";

jest.mock("../api/api", () => ({
  registerUser: jest.fn(),
}));

describe("Register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders registration form", () => {
    render(
      <Register
        onRegister={() => {}}
        onSwitchToLogin={() => {}}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Create your account" })
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Confirm password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Create Account" })
    ).toBeInTheDocument();
  });

  test("rejects mismatched passwords before calling the API", async () => {
    const onRegister = jest.fn();

    render(
      <Register
        onRegister={onRegister}
        onSwitchToLogin={() => {}}
      />
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test User" },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "differentpassword" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(
      await screen.findByText("Passwords do not match.")
    ).toBeInTheDocument();

    expect(registerUser).not.toHaveBeenCalled();
    expect(onRegister).not.toHaveBeenCalled();
  });

  test("submits valid registration data", async () => {
    const onRegister = jest.fn();

    registerUser.mockResolvedValue({
      token: "test-token",
      user: {
        name: "Test User",
        email: "test@example.com",
      },
    });

    render(
      <Register
        onRegister={onRegister}
        onSwitchToLogin={() => {}}
      />
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test User" },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "password123" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(onRegister).toHaveBeenCalled();
  });
});
