# CollabBoard Component Tree

## Application Structure

App
├── Header
│   ├── Brand
│   └── UserProfile
│
└── Main Content
    ├── Board Heading
    │   └── Add Task Button
    │
    └── Board
        ├── Column (To Do)
        │   └── TaskCard
        │
        ├── Column (Doing)
        │   └── TaskCard
        │
        └── Column (Done)
            └── TaskCard

## Data flow

mockTasks.js
     │
     ▼
    App
     │
     ▼
   Board
     │
     ├── filters tasks by status
     │
     ▼
   Column
     │
     ├── receives column tasks
     │
     ▼
  TaskCard
     │
     └── displays individual task

## Component Responsibilities
# App

The root application component. It combines the Header and Board and provides the initial mock task data.

# Header

Displays the CollabBoard branding and current user information.

# Board

Controls the Kanban board structure and divides tasks into To Do, Doing, and Done columns based on task status.

# Column

Displays a single Kanban column and renders the tasks belonging to that column.

# TaskCard

Displays an individual task including its title, description, priority, ID, and assignee.


## Future Architecture

MongoDB
   ↓
Mongoose
   ↓
Express REST API
   ↓
React
   ↓
Board
   ↓
Column
   ↓
TaskCard

