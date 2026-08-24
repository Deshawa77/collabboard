# CollabBoard REST API

## Base URL

```text
http://localhost:5000/api
```

## Authentication

Protected endpoints require a JSON Web Token (JWT).

After registering or logging in, the API returns a JWT token.

Include the token in the `Authorization` header:

```text
Authorization: Bearer <jwt>
```

> Never commit a real JWT token or JWT secret to the repository.

---

## Endpoint Summary

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| GET | `/health` | No | Check API status |
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive a JWT |
| GET | `/auth/me` | Yes | Get the current authenticated user |
| GET | `/tasks` | Yes | Get all tasks belonging to the user |
| GET | `/tasks/:id` | Yes | Get a specific task |
| POST | `/tasks` | Yes | Create a task |
| PUT | `/tasks/:id` | Yes | Update a task |
| DELETE | `/tasks/:id` | Yes | Delete a task |

---

# Authentication Endpoints

## Register

```text
POST /auth/register
```

Creates a new user account.

### Request

```json
{
  "name": "Deshawa",
  "email": "deshawa@example.com",
  "password": "password123"
}
```

### Success

**201 Created**

```json
{
  "message": "User registered successfully",
  "token": "<jwt>",
  "user": {
    "id": "...",
    "name": "Deshawa",
    "email": "deshawa@example.com"
  }
}
```

### Errors

**400 Bad Request**

```json
{
  "message": "Name, email, and password are required"
}
```

**409 Conflict**

```json
{
  "message": "User with this email already exists"
}
```

---

## Login

```text
POST /auth/login
```

Authenticates an existing user and returns a JWT.

### Request

```json
{
  "email": "deshawa@example.com",
  "password": "password123"
}
```

### Success

**200 OK**

```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "id": "...",
    "name": "Deshawa",
    "email": "deshawa@example.com"
  }
}
```

### Errors

**401 Unauthorized**

```json
{
  "message": "Invalid email or password"
}
```

---

## Current User

```text
GET /auth/me
```

Returns the currently authenticated user.

### Authentication

Required.

```text
Authorization: Bearer <jwt>
```

### Success

**200 OK**

```json
{
  "user": {
    "id": "...",
    "name": "Deshawa",
    "email": "deshawa@example.com"
  }
}
```

---

# Task Endpoints

All task endpoints require JWT authentication.

```text
Authorization: Bearer <jwt>
```

Tasks are associated with the authenticated user. Users can only access and modify their own tasks.

---

## Get All Tasks

```text
GET /tasks
```

Returns all tasks belonging to the authenticated user.

### Success

**200 OK**

```json
[
  {
    "_id": "...",
    "title": "Design landing page",
    "description": "Create the initial landing page design.",
    "status": "todo",
    "priority": "high",
    "assignee": "Deshawa",
    "createdBy": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

## Get One Task

```text
GET /tasks/:id
```

Returns a specific task belonging to the authenticated user.

### Success

**200 OK**

Returns the task object.

### Errors

**400 Bad Request**

Returned when the task ID is invalid.

**404 Not Found**

Returned when the task does not exist or does not belong to the authenticated user.

---

## Create Task

```text
POST /tasks
```

Creates a new task for the authenticated user.

### Request

```json
{
  "title": "Design landing page",
  "description": "Create the initial landing page design.",
  "status": "todo",
  "priority": "high",
  "assignee": "Deshawa"
}
```

### Valid Status Values

```text
todo
doing
done
```

### Valid Priority Values

```text
low
medium
high
```

### Success

**201 Created**

Returns the newly created task.

### Errors

**400 Bad Request**

Returned when:

- The title is missing.
- The title is empty.
- An invalid status is supplied.
- An invalid priority is supplied.

---

## Update Task

```text
PUT /tasks/:id
```

Updates one or more fields on a task.

### Request

All fields are optional.

```json
{
  "title": "Updated task",
  "description": "Updated description",
  "status": "doing",
  "priority": "medium",
  "assignee": "Deshawa"
}
```

### Success

**200 OK**

Returns the updated task.

### Errors

**400 Bad Request**

Returned when:

- The task ID is invalid.
- An invalid status is supplied.
- An invalid priority is supplied.
- The title is empty.

**404 Not Found**

Returned when the task does not exist or does not belong to the authenticated user.

---

## Move Task

Moving a task is performed using the update endpoint.

```text
PUT /tasks/:id
```

For example:

```json
{
  "status": "doing"
}
```

A task can move between the following statuses:

```text
To Do → Doing → Done
```

The API also allows moving a task to any of the valid status values.

### Success

**200 OK**

Returns the updated task.

---

## Delete Task

```text
DELETE /tasks/:id
```

Deletes a task belonging to the authenticated user.

### Success

**200 OK**

```json
{
  "message": "Task deleted successfully"
}
```

### Errors

**400 Bad Request**

Returned when the task ID is invalid.

**404 Not Found**

Returned when the task does not exist or does not belong to the authenticated user.

---

# Health Check

```text
GET /health
```

Checks whether the API server is running.

### Success

**200 OK**

```json
{
  "status": "ok",
  "message": "CollabBoard API is running"
}
```

---

# HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Authentication required or invalid |
| 404 | Resource not found |
| 409 | Resource conflict |
| 500 | Internal server error |