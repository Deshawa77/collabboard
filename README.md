# SyncBoard / CollabBoard

A full-stack collaborative task management application built with React, Express, MongoDB, and JWT authentication.

The project provides a Kanban-style task board where authenticated users can create, update, move, and delete their own tasks.

## Features

* User registration and login
* JWT-based authentication
* Protected REST API endpoints
* Create, read, update, and delete tasks
* Kanban-style task board
* Task status management:

  * To Do
  * Doing
  * Done
* Task priority management:

  * Low
  * Medium
  * High
* User-specific task ownership
* MongoDB persistence
* Responsive React frontend
* REST API documentation
* Automated frontend tests with Vitest

## Technologies

### Frontend

* React
* Vite
* JavaScript
* CSS
* Vitest
* React Testing Library

### Backend

* Node.js
* Express
* MongoDB
* Mongoose
* JSON Web Tokens (JWT)
* bcryptjs
* CORS
* dotenv

## Project Structure

```text
collabboard/
├── src/
│   ├── api/
│   │   └── api.js
│   ├── components/
│   │   ├── Auth/
│   │   ├── Board/
│   │   ├── Column/
│   │   ├── Header/
│   │   ├── TaskCard/
│   │   └── TaskForm/
│   ├── data/
│   ├── test/
│   ├── App.jsx
│   └── main.jsx
│
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── app.js
│       └── server.js
│
├── docs/
│   ├── api.md
│   ├── component-tree.md
│   └── wireframe.md
│
├── package.json
└── README.md
```

## Requirements

Make sure the following are installed:

* Node.js
* npm
* MongoDB or access to a MongoDB database

## Installation

Clone the repository:

```bash
git clone https://github.com/Deshawa77/collabboard.git
cd collabboard
```

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
cd ..
```

## Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit real credentials, database passwords, or JWT secrets to GitHub.

## Running the Backend

Open a terminal in the project root and run:

```bash
cd server
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

The API base URL is:

```text
http://localhost:5000/api
```

## Running the Frontend

Open another terminal in the project root and run:

```bash
npm run dev
```

Vite will provide the local frontend URL, normally:

```text
http://localhost:5173
```

Open the URL shown by Vite in your browser.

## API Endpoints

### Authentication

| Method | Endpoint             | Description            |
| ------ | -------------------- | ---------------------- |
| POST   | `/api/auth/register` | Register a new user    |
| POST   | `/api/auth/login`    | Login                  |
| GET    | `/api/auth/me`       | Get authenticated user |

### Tasks

| Method | Endpoint         | Description      |
| ------ | ---------------- | ---------------- |
| GET    | `/api/tasks`     | Get user's tasks |
| GET    | `/api/tasks/:id` | Get one task     |
| POST   | `/api/tasks`     | Create a task    |
| PUT    | `/api/tasks/:id` | Update a task    |
| DELETE | `/api/tasks/:id` | Delete a task    |

### Health Check

```text
GET /api/health
```

Detailed API documentation is available in:

```text
docs/api.md
```

## Testing

Run the frontend tests:

```bash
npm test
```

Run ESLint:

```bash
npm run lint
```

Build the frontend:

```bash
npm run build
```

## Assignment 02

The Assignment 02 submission is tagged in Git as:

```text
assignment-02
```

The tag represents the version containing the working REST APIs integrated with the frontend.

View the tag with:

```bash
git checkout assignment-02
```

The current development branch may contain later features that are not part of Assignment 02.

## GitHub

Repository:

https://github.com/Deshawa77/collabboard

Assignment 02 tag:

```text
assignment-02
```

## Team

The project was developed as a group project. Team members contributed across frontend development, backend/API development, testing, documentation, and project preparation.

Individual responsibilities are described in the project report.
