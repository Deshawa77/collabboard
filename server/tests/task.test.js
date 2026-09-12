import request from "supertest";
import app from "../src/app.js";

const registerUser = async (name, email) => {
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
  test("POST /api/tasks creates a task", async () => {
    const token = await registerUser(
      "Task User",
      "task@example.com"
    );

    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Complete testing",
        description: "Write integration tests",
        status: "todo",
        priority: "high",
        assignee: "Task User",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Complete testing");
    expect(response.body.description).toBe(
      "Write integration tests"
    );
    expect(response.body.status).toBe("todo");
    expect(response.body.priority).toBe("high");
    expect(response.body.assignee).toBe("Task User");
    expect(response.body.createdBy).toBeDefined();
  });

  test("GET /api/tasks returns tasks belonging to the authenticated user", async () => {
    const token = await registerUser(
      "Task User",
      "tasks@example.com"
    );

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "First task",
        status: "todo",
        priority: "medium",
      });

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Second task",
        status: "doing",
        priority: "high",
      });

    const response = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBeDefined();
    expect(response.body[1].title).toBeDefined();
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
        status: "todo",
        priority: "low",
      });

    const taskId = createResponse.body._id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated task",
        status: "done",
        priority: "high",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Updated task");
    expect(response.body.status).toBe("done");
    expect(response.body.priority).toBe("high");
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
        title: "Task to delete",
        status: "todo",
        priority: "medium",
      });

    const taskId = createResponse.body._id;

    const deleteResponse = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);

    const getResponse = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.statusCode).toBe(404);
  });

  test("Task routes reject requests without authentication", async () => {
    const response = await request(app)
      .get("/api/tasks");

    expect(response.statusCode).toBe(401);
  });

  test("POST /api/tasks rejects an invalid status", async () => {
    const token = await registerUser(
      "Validation User",
      "validation@example.com"
    );

    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Invalid task",
        status: "invalid-status",
        priority: "medium",
      });

    expect(response.statusCode).toBe(400);
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

  test("Users cannot access another user's tasks", async () => {
    const firstUserToken = await registerUser(
      "First User",
      "first@example.com"
    );

    const secondUserToken = await registerUser(
      "Second User",
      "second@example.com"
    );

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${firstUserToken}`)
      .send({
        title: "Private task",
        status: "todo",
        priority: "high",
      });

    const taskId = createResponse.body._id;

    const response = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${secondUserToken}`);

    expect(response.statusCode).toBe(404);
  });
});