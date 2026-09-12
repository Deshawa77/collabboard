import mockTasks from "../data/mockTasks";

describe("mockTasks", () => {
  test("contains required task fields", () => {
    mockTasks.forEach((task) => {
      expect(task).toHaveProperty("id");
      expect(task).toHaveProperty("title");
      expect(task).toHaveProperty("description");
      expect(task).toHaveProperty("status");
      expect(task).toHaveProperty("priority");
      expect(task).toHaveProperty("assignee");
    });
  });

  test("contains only valid task statuses", () => {
    const validStatuses = ["todo", "doing", "done"];

    mockTasks.forEach((task) => {
      expect(validStatuses).toContain(task.status);
    });
  });

  test("contains only valid task priorities", () => {
    const validPriorities = ["low", "medium", "high"];

    mockTasks.forEach((task) => {
      expect(validPriorities).toContain(task.priority);
    });
  });

  test("contains unique task IDs", () => {
    const ids = mockTasks.map((task) => task.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
