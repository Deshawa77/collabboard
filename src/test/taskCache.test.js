import { beforeEach, describe, expect, test } from "vitest";
import {
  getCachedTasks,
  saveCachedTasks,
  clearCachedTasks,
} from "../api/taskCache";

describe("taskCache", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("saves and retrieves tasks for a specific user", () => {
    const userId = "user-123";

    const tasks = [
      {
        _id: "task-1",
        title: "Test task",
        status: "todo",
      },
    ];

    saveCachedTasks(userId, tasks);

    expect(getCachedTasks(userId)).toEqual(tasks);
  });

  test("keeps cached tasks separate between users", () => {
    const userA = "user-a";
    const userB = "user-b";

    const tasksA = [
      {
        _id: "task-a",
        title: "User A task",
        status: "todo",
      },
    ];

    const tasksB = [
      {
        _id: "task-b",
        title: "User B task",
        status: "done",
      },
    ];

    saveCachedTasks(userA, tasksA);
    saveCachedTasks(userB, tasksB);

    expect(getCachedTasks(userA)).toEqual(tasksA);
    expect(getCachedTasks(userB)).toEqual(tasksB);
  });

  test("returns an empty array when no cache exists", () => {
    expect(getCachedTasks("unknown-user")).toEqual([]);
  });

  test("clears only the specified user's cache", () => {
    const userA = "user-a";
    const userB = "user-b";

    const tasksA = [
      {
        _id: "task-a",
        title: "User A task",
      },
    ];

    const tasksB = [
      {
        _id: "task-b",
        title: "User B task",
      },
    ];

    saveCachedTasks(userA, tasksA);
    saveCachedTasks(userB, tasksB);

    clearCachedTasks(userA);

    expect(getCachedTasks(userA)).toEqual([]);
    expect(getCachedTasks(userB)).toEqual(tasksB);
  });
});
