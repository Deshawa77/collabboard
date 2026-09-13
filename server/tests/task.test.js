import request from "supertest";
import app from "../src/app.js";
import Task from "../src/models/Task.js";

const registerUser = async (
  name = "Test User",
  email = "test@example.com"
) => {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name,
      email,
      password: "password123",
    });

  return response.body.token;
};

describe("Task API", () => {
  test("GET /api/tasks returns the authenticated user's tasks", async () => {
    const token = await registerUser(
      "Task User",
      "tasks@example.com"
    );

    await Task.create({
      title: "Test task",
      description: "Test description",
      status: "todo",
      priority: "medium",
      assignee: "Test User",
      createdBy: (
        await request(app)
          .get("/api/auth/me")
          .set("Authorization", `Bearer ${token}`)
      ).body.user.id,
    });

    const response = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("Test task");
  });

  test("POST /api/tasks creates a task", async () => {
    const token = await registerUser(
      "Create User",
      "create@example.com"
    );

    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "New task",
        description: "New description",
        status: "todo",
        priority: "high",
        assignee: "Create User",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("New task");
    expect(response.body.description).toBe(
      "New description"
    );
    expect(response.body.status).toBe("todo");
    expect(response.body.priority).toBe("high");
    expect(response.body.assignee).toBe("Create User");

    // M5 concurrency control starts new tasks at version 0.
    expect(response.body.version).toBe(0);
  });

  test("POST /api/tasks rejects a missing title", async () => {
    const token = await registerUser(
      "Missing Title User",
      "missing-title@example.com"
    );

    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "Task without title",
        status: "todo",
        priority: "medium",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Task title must be a string"
    );
  });

  test("POST /api/tasks rejects a non-string title with 400", async () => {
    const token = await registerUser(
      "Malformed User",
      "malformed@example.com"
    );

    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: 123,
        description: "Invalid title type",
        status: "todo",
        priority: "medium",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Task title must be a string"
    );
  });

  test("POST /api/tasks rejects an invalid status", async () => {
    const token = await registerUser(
      "Status User",
      "status@example.com"
    );

    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Invalid status task",
        description: "Invalid status",
        status: "invalid",
        priority: "medium",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Invalid task status"
    );
  });

  test("POST /api/tasks rejects an invalid priority", async () => {
    const token = await registerUser(
      "Priority User",
      "priority@example.com"
    );

    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Invalid priority task",
        description: "Invalid priority",
        status: "todo",
        priority: "invalid",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Invalid task priority"
    );
  });

  test("GET /api/tasks/:id returns a task", async () => {
    const token = await registerUser(
      "Get User",
      "get@example.com"
    );

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Get task",
        description: "Get description",
        status: "todo",
        priority: "medium",
      });

    const taskId = createResponse.body._id;

    const response = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(taskId);
    expect(response.body.title).toBe("Get task");
  });

  test("GET /api/tasks/:id returns 404 for a missing task", async () => {
    const token = await registerUser(
      "Missing User",
      "missing@example.com"
    );

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Temporary task",
        status: "todo",
        priority: "medium",
      });

    const taskId = createResponse.body._id;

    await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe(
      "Task not found"
    );
  });

  test("PUT /api/tasks/:id updates a task", async () => {
    const token = await registerUser(
      "Update User",
      "update@example.com"
    );

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Original task",
        description: "Original description",
        status: "todo",
        priority: "medium",
      });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body._id;

    // M5 concurrency control:
    // use the version returned by the server.
    const expectedVersion =
      createResponse.body.version;

    expect(expectedVersion).toBe(0);

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated task",
        status: "done",
        priority: "high",
        expectedVersion,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Updated task");
    expect(response.body.status).toBe("done");
    expect(response.body.priority).toBe("high");

    // Successful update increments the version.
    expect(response.body.version).toBe(1);
  });

  test("PUT /api/tasks/:id rejects a stale version with 409", async () => {
    const token = await registerUser(
      "Conflict User",
      "conflict@example.com"
    );

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Concurrent task",
        description: "Concurrency test",
        status: "todo",
        priority: "medium",
      });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body._id;
    const originalVersion =
      createResponse.body.version;

    expect(originalVersion).toBe(0);

    // First update succeeds and moves the version to 1.
    const firstUpdate = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "doing",
        expectedVersion: originalVersion,
      });

    expect(firstUpdate.statusCode).toBe(200);
    expect(firstUpdate.body.version).toBe(1);

    // Second update is still using version 0.
    // It must be rejected rather than silently overwriting
    // the first update.
    const staleUpdate = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Stale update",
        expectedVersion: originalVersion,
      });

    expect(staleUpdate.statusCode).toBe(409);
    expect(staleUpdate.body.conflict).toBe(true);
    expect(staleUpdate.body.message).toContain(
      "updated by another user"
    );
    expect(staleUpdate.body.task.version).toBe(1);
    expect(staleUpdate.body.task.status).toBe("doing");
  });

  test("PUT /api/tasks/:id requires expectedVersion", async () => {
    const token = await registerUser(
      "Version User",
      "version@example.com"
    );

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Version task",
        status: "todo",
        priority: "medium",
      });

    const taskId = createResponse.body._id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated without version",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "A valid expectedVersion is required"
    );
  });

  test("PUT /api/tasks/:id rejects a non-string title", async () => {
    const token = await registerUser(
      "Update Validation User",
      "update-validation@example.com"
    );

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Valid task",
        status: "todo",
        priority: "medium",
      });

    const taskId = createResponse.body._id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: 123,
        expectedVersion: createResponse.body.version,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Task title must be a string"
    );
  });

  test("PUT /api/tasks/:id rejects an invalid status", async () => {
    const token = await registerUser(
      "Update Status User",
      "update-status@example.com"
    );

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Valid task",
        status: "todo",
        priority: "medium",
      });

    const taskId = createResponse.body._id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "invalid",
        expectedVersion: createResponse.body.version,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Invalid task status"
    );
  });

  test("DELETE /api/tasks/:id deletes a task", async () => {
    const token = await registerUser(
      "Delete User",
      "delete@example.com"
    );

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Delete task",
        status: "todo",
        priority: "medium",
      });

    const taskId = createResponse.body._id;

    const response = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "Task deleted successfully"
    );
    expect(response.body.task._id).toBe(taskId);
  });

  test("DELETE /api/tasks/:id returns 404 for a missing task", async () => {
    const token = await registerUser(
      "Delete Missing User",
      "delete-missing@example.com"
    );

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Delete missing task",
        status: "todo",
        priority: "medium",
      });

    const taskId = createResponse.body._id;

    await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe(
      "Task not found"
    );
  });
});