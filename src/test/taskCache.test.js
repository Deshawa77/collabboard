import {
  getCachedTasks,
  saveCachedTasks,
  clearCachedTasks,
} from "../api/taskCache";

describe("taskCache", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("saves and retrieves tasks for a user", () => {
    const tasks = [
      { id: "1", title: "Task 1" },
      { id: "2", title: "Task 2" },
    ];

    saveCachedTasks("user1", tasks);

    expect(getCachedTasks("user1")).toEqual(tasks);
  });

  test("keeps cached tasks separate between users", () => {
    const user1Tasks = [{ id: "1", title: "User 1 task" }];
    const user2Tasks = [{ id: "2", title: "User 2 task" }];

    saveCachedTasks("user1", user1Tasks);
    saveCachedTasks("user2", user2Tasks);

    expect(getCachedTasks("user1")).toEqual(user1Tasks);
    expect(getCachedTasks("user2")).toEqual(user2Tasks);
  });

  test("returns an empty array when no cache exists", () => {
    expect(getCachedTasks("unknown-user")).toEqual([]);
  });

  test("clears only the specified user's cache", () => {
    const user1Tasks = [{ id: "1", title: "User 1 task" }];
    const user2Tasks = [{ id: "2", title: "User 2 task" }];

    saveCachedTasks("user1", user1Tasks);
    saveCachedTasks("user2", user2Tasks);

    clearCachedTasks("user1");

    expect(getCachedTasks("user1")).toEqual([]);
    expect(getCachedTasks("user2")).toEqual(user2Tasks);
  });
});
