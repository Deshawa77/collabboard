# CollabBoard Database Schema

## Overview

CollabBoard uses **MongoDB** for persistent data storage and **Mongoose** as the Object Data Modeling (ODM) library.

The database contains two main collections:

* `users` — stores registered user accounts.
* `tasks` — stores tasks created by users.

Each task references the user who created it through the `createdBy` field.

This database design provides persistent storage while maintaining ownership isolation between users.

---

## Entity Relationship

```text
┌──────────────────────┐
│        User          │
├──────────────────────┤
│ _id        ObjectId  │
│ name       String    │
│ email      String    │
│ password   String    │
│ createdAt  Date      │
│ updatedAt  Date      │
└──────────┬───────────┘
           │
           │ 1
           │
           │ creates
           │
           │ many
           ▼
┌──────────────────────┐
│        Task          │
├──────────────────────┤
│ _id         ObjectId │
│ title       String   │
│ description String   │
│ status      String   │
│ priority    String   │
│ assignee    String   │
│ createdBy   ObjectId │
│ createdAt   Date     │
│ updatedAt   Date     │
└──────────────────────┘
```

### Relationship

The relationship is:

```text
User._id  ←  Task.createdBy
```

One user can create many tasks.

---

## User Schema

Each user document contains:

| Field       | Type     | Rules                                |
| ----------- | -------- | ------------------------------------ |
| `_id`       | ObjectId | MongoDB-generated identifier         |
| `name`      | String   | Required, trimmed                    |
| `email`     | String   | Required, unique, lowercase, trimmed |
| `password`  | String   | Required, minimum 6 characters       |
| `createdAt` | Date     | Automatically generated              |
| `updatedAt` | Date     | Automatically generated              |

The `email` field is unique to prevent multiple accounts from using the same email address.

---

## Task Schema

Each task document contains:

| Field         | Type     | Rules                              |
| ------------- | -------- | ---------------------------------- |
| `_id`         | ObjectId | MongoDB-generated identifier       |
| `title`       | String   | Required, trimmed                  |
| `description` | String   | Optional, defaults to empty string |
| `status`      | String   | `todo`, `doing`, or `done`         |
| `priority`    | String   | `low`, `medium`, or `high`         |
| `assignee`    | String   | Optional, defaults to empty string |
| `createdBy`   | ObjectId | Required reference to `User`       |
| `createdAt`   | Date     | Automatically generated            |
| `updatedAt`   | Date     | Automatically generated            |

Mongoose timestamps automatically maintain the `createdAt` and `updatedAt` fields.

---

## Referencing vs Embedding

CollabBoard uses **referencing** between users and tasks rather than embedding the complete user document inside each task.

The `createdBy` field stores the MongoDB `ObjectId` of the user who created the task.

```text
Task.createdBy → User._id
```

Referencing is appropriate because:

1. A user can create many tasks.
2. User information is shared across multiple tasks.
3. User account data should have a single source of truth.
4. Embedding complete user documents would duplicate account information.
5. Updating user information does not require updating every task document.

Task-specific information such as title, description, status, priority, and assignee remains directly inside the task document because it belongs specifically to that task.

---

## Indexing

The Task schema uses a compound index:

```text
(createdBy, createdAt)
```

This index is defined as:

```javascript
taskSchema.index({
  createdBy: 1,
  createdAt: -1,
});
```

The index supports the application's primary task query:

```text
Task.find({ createdBy: req.user._id })
```

combined with sorting tasks by creation time:

```text
.sort({ createdAt: -1 })
```

This allows MongoDB to efficiently locate tasks belonging to a particular user and retrieve them in newest-first order.

The User schema also enforces a unique index for the `email` field through:

```text
unique: true
```

---

## Persistence

Tasks are stored in MongoDB rather than only in the application's memory.

The server connects to MongoDB using the `MONGODB_URI` environment variable through Mongoose.

The persistence flow is:

```text
React Client
     │
     │ HTTP request
     ▼
Express REST API
     │
     │ Mongoose
     ▼
MongoDB
     │
     │ persistent storage
     ▼
Task documents
```

Because tasks are stored in MongoDB, they remain available after the Node.js/Express server is stopped and restarted.

### Persistence Verification

M3 persistence was manually verified by:

1. Creating a task through the CollabBoard interface.
2. Confirming the task appeared on the board.
3. Stopping the backend server.
4. Restarting the backend server.
5. Refreshing the frontend.
6. Confirming that the previously created task was still present.

This demonstrates that task data is persisted in MongoDB rather than being dependent on the server's in-memory state.

---

## Validation

Mongoose provides schema-level validation for:

* required fields
* minimum password length
* allowed task statuses
* allowed task priorities
* unique user email addresses
* trimmed string values

The REST API also performs request validation before creating or updating tasks.

Invalid values are rejected rather than being stored as valid task documents.

---

## Authentication and Ownership

Task routes are protected using JWT authentication.

The authenticated user's ID is available through:

```text
req.user._id
```

Task queries use this value to ensure that users only access tasks belonging to their account.

For example:

```text
Task.find({ createdBy: req.user._id })
```

This provides application-level ownership isolation.

The ownership model is:

```text
Authenticated User
       │
       │ req.user._id
       ▼
Task.createdBy
       │
       ▼
Only that user's tasks
```

A user's tasks therefore cannot be retrieved simply by requesting another user's task collection.

---

# Client-Side Caching and Offline Support

M3 also provides client-side caching so that the board can remain visible when the backend is temporarily unavailable.

Task data retrieved from the API is stored in the browser's `localStorage`.

The application stores cached tasks using a **user-specific cache key**:

```text
collabboard_tasks_<userId>
```

This prevents cached tasks from different accounts from being mixed together.

The cached-user information is also stored locally so that the application can restore the authenticated user's interface after a page refresh.

---

## Cache Flow

When the application starts:

```text
Local Storage
     │
     │ cached user/tasks
     ▼
React Application
     │
     │ attempt API synchronization
     ▼
Express API
     │
     ▼
MongoDB
```

If the API is available:

```text
API response
     │
     ▼
Update React state
     │
     ▼
Update localStorage cache
```

If the API is temporarily unavailable:

```text
API unavailable
     │
     ▼
Use cached user/tasks
     │
     ▼
Display cached board
     │
     ▼
Show offline status
```

The application does not immediately erase the cached board simply because the backend cannot be reached.

---

## Cache Isolation

Cached task data is isolated by user.

For example:

```text
collabboard_tasks_userA
        │
        └── User A's tasks


collabboard_tasks_userB
        │
        └── User B's tasks
```

When a user logs out, their cached user and task data is cleared.

This prevents a subsequent user from seeing the previous user's cached board on the same browser.

---

## Offline Behaviour

When the backend cannot be reached:

* previously cached tasks remain visible;
* the application displays an offline status;
* creating new tasks is disabled;
* changes are not falsely reported as saved;
* the application does not erase the cached board.

When the backend becomes available again, a refresh allows the application to retrieve the latest data from MongoDB and update the cache.

---

## Client-Side Cache Testing

Automated tests verify the task cache behaviour.

The cache tests verify that:

1. Tasks can be saved and retrieved.
2. Different users have separate task caches.
3. Missing cache data returns an empty task list.
4. Clearing one user's cache does not clear another user's cache.

These tests help prevent accidental cross-user cache exposure and ensure reliable local persistence.

---

## M3 Persistence Architecture

The completed M3 architecture therefore consists of three persistence layers:

```text
                    CollabBoard
                         │
          ┌──────────────┴──────────────┐
          │                             │
     Client Cache                  Server Database
      localStorage                    MongoDB
          │                             │
          │                             │
   Fast local access              Persistent storage
   Offline fallback               Survives restarts
          │                             │
          └──────────────┬──────────────┘
                         │
                    REST API
                         │
                  Authentication
                         │
                    User-owned
                       tasks
```

MongoDB provides the application's authoritative persistent storage, while browser `localStorage` provides a client-side cache and offline fallback.

Together, these mechanisms provide persistent task storage, faster client startup, and graceful behaviour during temporary backend outages.
