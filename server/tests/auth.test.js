import request from "supertest";
import app from "../src/app.js";

describe("Authentication API", () => {
test("POST /api/auth/register creates a new user", async () => {
const response = await request(app)
.post("/api/auth/register")
.send({
name: "Test User",
email: "test@example.com",
password: "password123",
});

expect(response.statusCode).toBe(201);
expect(response.body.token).toBeDefined();
expect(response.body.user.email).toBe("test@example.com");
expect(response.body.user.name).toBe("Test User");
expect(response.body.user.password).toBeUndefined();

});

test("POST /api/auth/register rejects duplicate email", async () => {
await request(app)
.post("/api/auth/register")
.send({
name: "Test User",
email: "duplicate@example.com",
password: "password123",
});

const response = await request(app)
  .post("/api/auth/register")
  .send({
    name: "Another User",
    email: "duplicate@example.com",
    password: "password456",
  });

expect(response.statusCode).toBe(409);
expect(response.body.message).toBe(
  "User with this email already exists"
);

});

test("POST /api/auth/login authenticates a valid user", async () => {
await request(app)
.post("/api/auth/register")
.send({
name: "Login User",
email: "login@example.com",
password: "password123",
});

const response = await request(app)
  .post("/api/auth/login")
  .send({
    email: "login@example.com",
    password: "password123",
  });

expect(response.statusCode).toBe(200);
expect(response.body.token).toBeDefined();
expect(response.body.user.email).toBe("login@example.com");

});

test("POST /api/auth/login rejects an invalid password", async () => {
await request(app)
.post("/api/auth/register")
.send({
name: "Invalid Password User",
email: "invalid@example.com",
password: "password123",
});

const response = await request(app)
  .post("/api/auth/login")
  .send({
    email: "invalid@example.com",
    password: "wrongpassword",
  });

expect(response.statusCode).toBe(401);
expect(response.body.message).toBe("Invalid email or password");

});

test("GET /api/auth/me rejects requests without a token", async () => {
const response = await request(app)
.get("/api/auth/me");

expect(response.statusCode).toBe(401);

});

test("GET /api/auth/me returns the authenticated user", async () => {
const registerResponse = await request(app)
.post("/api/auth/register")
.send({
name: "Authenticated User",
email: "auth@example.com",
password: "password123",
});

const response = await request(app)
  .get("/api/auth/me")
  .set(
    "Authorization",
    `Bearer ${registerResponse.body.token}`
  );

expect(response.statusCode).toBe(200);
expect(response.body.user.email).toBe("auth@example.com");
expect(response.body.user.name).toBe("Authenticated User");
expect(response.body.user.password).toBeUndefined();

});
});