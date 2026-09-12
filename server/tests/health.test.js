import request from "supertest";
import app from "../src/app.js";

describe("Health API", () => {
  test("GET /api/health returns API status", async () => {
    const response = await request(app)
      .get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.message).toBe(
      "CollabBoard API is running"
    );
  });
});
