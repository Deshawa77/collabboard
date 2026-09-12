import { fireEvent, render, screen } from "@testing-library/react";
import TaskCard from "../components/TaskCard/TaskCard";

describe("TaskCard", () => {
  const task = {
    _id: "507f1f77bcf86cd799439011",
    title: "Complete testing",
    description: "Write client tests",
    status: "todo",
    priority: "high",
    assignee: "Test User",
  };

  test("renders task information", () => {
    render(
      <TaskCard
        task={task}
        onUpdateTask={() => {}}
        onDeleteTask={() => {}}
      />
    );

    expect(
      screen.getByText("Complete testing")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Write client tests")
    ).toBeInTheDocument();

    expect(
      screen.getByText("high")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Test User")
    ).toBeInTheDocument();

    expect(
      screen.getByText("#439011")
    ).toBeInTheDocument();
  });

  test("calls onUpdateTask when moving a task", () => {
    const onUpdateTask = jest.fn();

    render(
      <TaskCard
        task={task}
        onUpdateTask={onUpdateTask}
        onDeleteTask={() => {}}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Doing" })
    );

    expect(onUpdateTask).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      {
        status: "doing",
      }
    );
  });

  test("calls onDeleteTask after confirming deletion", () => {
    const onDeleteTask = jest.fn();

    window.confirm = jest.fn(() => true);

    render(
      <TaskCard
        task={task}
        onUpdateTask={() => {}}
        onDeleteTask={onDeleteTask}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Delete" })
    );

    expect(window.confirm).toHaveBeenCalledWith(
      'Delete "Complete testing"?'
    );

    expect(onDeleteTask).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011"
    );
  });
});
