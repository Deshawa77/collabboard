import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["todo", "doing", "done"],
      default: "todo",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    assignee: {
      type: String,
      default: "",
      trim: true,
    },

    // Used for optimistic concurrency control.
    // The version increases every time a task is successfully updated.
    version: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize the main task query:
// find tasks belonging to a user and sort them by newest first.
taskSchema.index({
  createdBy: 1,
  createdAt: -1,
});

const Task = mongoose.model("Task", taskSchema);

export default Task;