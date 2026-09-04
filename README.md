# SyncBoard / CollabBoard

A full-stack collaborative task management application built with **React, Express, MongoDB Atlas, Mongoose, and JWT authentication**.

SyncBoard provides a Kanban-style task management board where authenticated users can create, view, update, move, and delete their own tasks. The application includes a React frontend, Express REST API, MongoDB Atlas database persistence, JWT-based authentication, automated frontend testing, and client-side caching for improved resilience during network failures.

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
* MongoDB Atlas database persistence
* Client-side task and user caching
* Offline fallback when API network requests fail
* Responsive React frontend
* REST API documentation
* Automated frontend tests using Vitest and React Testing Library
* ESLint code quality checks
* Production frontend build using Vite

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
* Mongoose
* MongoDB Atlas
* JSON Web Tokens (JWT)
* bcryptjs
* CORS
* dotenv

### Development and Testing

* Git and GitHub
* Postman
* ESLint
* Vitest

## System Architecture

The application follows a full-stack client-server architecture:

```text
┌──────────────────────────────┐
│       React Frontend         │
│                              │
│  Login / Register            │
│  Kanban Board                │
│  Task Management             │
│  Client-side Cache           │
└──────────────┬───────────────┘
               │ HTTP / REST API
               ▼
┌──────────────────────────────┐
│      Express Backend         │
│                              │
│  Authentication             │
│  JWT Middleware              │
│  Task Controllers            │
│  REST API Routes             │
└──────────────┬───────────────┘
               │ Mongoose
               ▼
┌──────────────────────────────┐
│       MongoDB Atlas          │
│                              │
│  collabboard                 │
│  ├── users                   │
│  └── tasks                   │
└──────────────────────────────┘
```

## Project Structure

```text
collabboard/
│
├── src/
│   ├── api/
│   │   ├── api.js
│   │   ├── taskCache.js
│   │   └── userCache.js
│   │
│   ├── components/
│   │   ├── Auth/
│   │   ├── Board/
│   │   ├── Column/
│   │   ├── Header/
│   │   ├── TaskCard/
│   │   └── TaskForm/
│   │
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
│   ├── database-schema.md
│   ├── wireframe.md
│   └── images/
│
├── package.json
├── vite.config.js
├── vitest.config.js
└── README.md
```

## Requirements

Make sure the following software is installed:

* Node.js
* npm
* MongoDB Atlas account
* Git
* Postman (recommended for API testing)

The project uses MongoDB Atlas for the production/demo database. A local MongoDB installation is not required.

## Installation

Clone the repository:

```bash
git clone https://github.com/Deshawa77/collabboard.git
cd collabboard
```

### Install frontend dependencies

From the project root:

```bash
npm install
```

### Install backend dependencies

```bash
cd server
npm install
cd ..
```

## MongoDB Atlas Configuration

The backend connects to MongoDB Atlas using a MongoDB connection URI.

Create a MongoDB Atlas project and cluster, then create a database user with permission to access the database.

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
```

Example format:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collabboard
```

Replace the placeholder values with your own credentials.

**Never commit the `.env` file, MongoDB password, connection string containing credentials, or JWT secret to GitHub.**

The application uses the `collabboard` database and stores user and task information in MongoDB collections.

## Running the Backend

Open a terminal in the project root:

```bash
cd server
npm run dev
```

The backend will normally run on:

```text
http://localhost:5000
```

The API base URL is:

```text
http://localhost:5000/api
```

The terminal should indicate that the MongoDB database connection was established successfully.

## Running the Frontend

Open a second terminal in the project root:

```bash
npm run dev
```

Vite will provide a local development URL, normally:

```text
http://localhost:5173
```

Open the URL displayed by Vite in your browser.

## API Endpoints

The REST API is available under:

```text
http://localhost:5000/api
```

### Health Check

| Method | Endpoint      | Description                      |
| ------ | ------------- | -------------------------------- |
| GET    | `/api/health` | Check whether the API is running |

### Authentication

| Method | Endpoint             | Description                               |
| ------ | -------------------- | ----------------------------------------- |
| POST   | `/api/auth/register` | Register a new user                       |
| POST   | `/api/auth/login`    | Authenticate a user and receive a JWT     |
| GET    | `/api/auth/me`       | Retrieve the currently authenticated user |

### Tasks

| Method | Endpoint         | Description                             |
| ------ | ---------------- | --------------------------------------- |
| GET    | `/api/tasks`     | Retrieve the authenticated user's tasks |
| GET    | `/api/tasks/:id` | Retrieve a specific task                |
| POST   | `/api/tasks`     | Create a new task                       |
| PUT    | `/api/tasks/:id` | Update an existing task                 |
| DELETE | `/api/tasks/:id` | Delete a task                           |

Protected endpoints require a valid JWT access token using the Bearer authentication scheme.

Detailed request and response information is available in:

```text
docs/api.md
```

## Authentication

SyncBoard uses JSON Web Tokens (JWT) to protect authenticated API endpoints.

After a successful login, the frontend stores the authentication token locally and uses it when making protected API requests.

The backend verifies the token using authentication middleware before allowing access to protected resources.

Each user's tasks are associated with their authenticated user account.

## Client-Side Caching and Offline Support

The frontend includes client-side caching to improve the application's resilience when network connectivity is unavailable.

Task data is cached separately for each authenticated user. User information is also cached locally.

When the application cannot reach the backend because of a network failure, previously cached task data can be displayed instead of leaving the board empty.

The application continues to require an active network connection for operations that modify server-side data, such as creating new tasks while offline.

The caching functionality is implemented in:

```text
src/api/taskCache.js
src/api/userCache.js
```

## Testing

Run the frontend test suite:

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

The project includes automated tests for client-side caching and other frontend functionality.

## Postman API Testing

The REST API can be tested using Postman.

Recommended API testing sequence:

```text
Health
  └── GET /api/health

Authentication
  ├── POST /api/auth/register
  ├── POST /api/auth/login
  └── GET /api/auth/me

Tasks
  ├── GET /api/tasks
  ├── GET /api/tasks/:id
  ├── POST /api/tasks
  ├── PUT /api/tasks/:id
  └── DELETE /api/tasks/:id
```

Protected requests should use the JWT returned by the login endpoint as a Bearer Token.

## Database

The application uses MongoDB Atlas as its cloud database.

The main database is:

```text
collabboard
```

Collections include:

```text
collabboard
├── users
└── tasks
```

The `users` collection stores registered user information, while the `tasks` collection stores task information associated with authenticated users.

Additional database design information is available in:

```text
docs/database-schema.md
```

## Assignment 02

The Assignment 02 submission is tagged in Git as:

```text
assignment-02
```

The tag represents the version containing the working REST APIs integrated with the frontend.

The tag can be viewed using:

```bash
git checkout assignment-02
```

Later development features are available in subsequent commits and branches.

## Assignment 03

Assignment 03 represents the working full-stack version of SyncBoard, including:

* React frontend
* Express backend
* REST API
* JWT authentication
* MongoDB Atlas database
* Task CRUD functionality
* Client-side caching and offline fallback
* Automated tests
* Postman API testing

The final Assignment 03 version is tagged in Git as:

```text
assignment-03
```

To view the tagged version:

```bash
git checkout assignment-03
```

## GitHub

Repository:

https://github.com/Deshawa77/collabboard

The repository contains the source code, documentation, Git history, and assignment tags for the project.

## Team

The project was developed as a group project.

Individual roles and contributions are documented in the Assignment 03 project report.

Key responsibilities include frontend development, backend/API development, database integration, testing, documentation, and project preparation.

## Documentation

Additional project documentation is available in the `docs` directory:

```text
docs/
├── api.md
├── component-tree.md
├── database-schema.md
└── wireframe.md
```

## License

This project was developed as an academic university project.
