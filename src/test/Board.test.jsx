import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Board from "../components/Board/Board";

describe("Board", () => {
  test("renders all three Kanban columns", () => {
    render(<Board tasks={[]} />);

    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("Doing")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  test("places tasks in the correct columns", () => {
    const tasks = [
      {
        id: 1,
        title: "Task in To Do",
        description: "Test task",
        status: "todo",
        priority: "high",
        assignee: "Deshawa",
      },
      {
        id: 2,
        title: "Task in Doing",
        description: "Test task",
        status: "doing",
        priority: "medium",
        assignee: "Deshawa",
      },
      {
        id: 3,
        title: "Task in Done",
        description: "Test task",
        status: "done",
        priority: "low",
        assignee: "Deshawa",
      },
    ];

    render(<Board tasks={tasks} />);

    expect(screen.getByText("Task in To Do")).toBeInTheDocument();
    expect(screen.getByText("Task in Doing")).toBeInTheDocument();
    expect(screen.getByText("Task in Done")).toBeInTheDocument();
  });
});