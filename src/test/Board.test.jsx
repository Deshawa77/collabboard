import { render, screen } from "@testing-library/react";
import Board from "../components/Board/Board";

describe("Board", () => {
  const tasks = [
    {
      _id: "1",
      title: "Todo task",
      description: "Test todo",
      status: "todo",
      priority: "high",
      assignee: "Alice",
    },
    {
      _id: "2",
      title: "Doing task",
      description: "Test doing",
      status: "doing",
      priority: "medium",
      assignee: "Bob",
    },
    {
      _id: "3",
      title: "Done task",
      description: "Test done",
      status: "done",
      priority: "low",
      assignee: "Charlie",
    },
  ];

  test("renders all three board columns", () => {
    render(
      <Board
        tasks={tasks}
        onUpdateTask={() => {}}
        onDeleteTask={() => {}}
      />
    );

    expect(
      screen.getByRole("heading", { name: "To Do" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Doing" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Done" })
    ).toBeInTheDocument();
  });

  test("places tasks in the correct columns", () => {
    render(
      <Board
        tasks={tasks}
        onUpdateTask={() => {}}
        onDeleteTask={() => {}}
      />
    );

    expect(screen.getByText("Todo task")).toBeInTheDocument();
    expect(screen.getByText("Doing task")).toBeInTheDocument();
    expect(screen.getByText("Done task")).toBeInTheDocument();
  });
});
