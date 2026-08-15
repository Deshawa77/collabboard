import { describe, expect, test } from "vitest";
import mockTasks from "../data/mockTasks";

describe("mockTasks", () => {
  test("contains tasks with the required fields", () => {
    expect(mockTasks.length).toBeGreaterThan(0);

    mockTasks.forEach((task) => {
      expect(task).toHaveProperty("id");
      expect(task).toHaveProperty("title");
      expect(task).toHaveProperty("description");
      expect(task).toHaveProperty("status");
      expect(task).toHaveProperty("priority");
      expect(task).toHaveProperty("assignee");
    });
  });

  test("uses valid task statuses", () => {
    const validStatuses = ["todo", "doing", "done"];

    mockTasks.forEach((task) => {
      expect(validStatuses).toContain(task.status);
    });
  });

  test("uses valid priority levels", () => {
    const validPriorities = ["low", "medium", "high"];

    mockTasks.forEach((task) => {
      expect(validPriorities).toContain(task.priority);
    });
  });

  test("has unique task IDs", () => {
    const ids = mockTasks.map((task) => task.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });
});