import mongoose from "mongoose";
import Task from "../models/Task.js";

const emitTaskEvent = (req, event, task) => {
  const io = req.app.locals.io;

  if (!io) {
    return;
  }

  io.to(`user:${req.user._id}`).emit(event, task);
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      message: "Server error while fetching tasks",
    });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error("Get task error:", error);

    return res.status(500).json({
      message: "Server error while fetching task",
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      assignee,
    } = req.body;

    // Validate title type before using string methods.
    if (typeof title !== "string") {
      return res.status(400).json({
        message: "Task title must be a string",
      });
    }

    if (!title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const validStatuses = ["todo", "doing", "done"];
    const validPriorities = ["low", "medium", "high"];

    if (
      status !== undefined &&
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    if (
      priority !== undefined &&
      !validPriorities.includes(priority)
    ) {
      return res.status(400).json({
        message: "Invalid task priority",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description:
        typeof description === "string"
          ? description.trim()
          : "",
      status,
      priority,
      assignee:
        typeof assignee === "string"
          ? assignee.trim()
          : "",
      createdBy: req.user._id,
    });

    emitTaskEvent(req, "task:created", task);

    return res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid task data",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    return res.status(500).json({
      message: "Server error while creating task",
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const {
      title,
      description,
      status,
      priority,
      assignee,
      expectedVersion,
    } = req.body;

    // The client must provide the version it last saw.
    if (
      expectedVersion === undefined ||
      !Number.isInteger(expectedVersion) ||
      expectedVersion < 0
    ) {
      return res.status(400).json({
        message: "A valid expectedVersion is required",
      });
    }

    const validStatuses = ["todo", "doing", "done"];
    const validPriorities = ["low", "medium", "high"];

    if (
      status !== undefined &&
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    if (
      priority !== undefined &&
      !validPriorities.includes(priority)
    ) {
      return res.status(400).json({
        message: "Invalid task priority",
      });
    }

    if (title !== undefined) {
      if (typeof title !== "string") {
        return res.status(400).json({
          message: "Task title must be a string",
        });
      }

      if (!title.trim()) {
        return res.status(400).json({
          message: "Task title cannot be empty",
        });
      }
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Task description must be a string",
        });
      }
    }

    if (assignee !== undefined) {
      if (typeof assignee !== "string") {
        return res.status(400).json({
          message: "Task assignee must be a string",
        });
      }
    }

    // Build only the fields that were actually supplied.
    const updateFields = {};

    if (title !== undefined) {
      updateFields.title = title.trim();
    }

    if (description !== undefined) {
      updateFields.description = description.trim();
    }

    if (status !== undefined) {
      updateFields.status = status;
    }

    if (priority !== undefined) {
      updateFields.priority = priority;
    }

    if (assignee !== undefined) {
      updateFields.assignee = assignee.trim();
    }

    // Atomically update only when the version still matches.
    //
    // This prevents two simultaneous requests from both successfully
    // overwriting the same task.
    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: id,
        createdBy: req.user._id,
        version: expectedVersion,
      },
      {
        $set: updateFields,
        $inc: {
          version: 1,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (updatedTask) {
      emitTaskEvent(
        req,
        "task:updated",
        updatedTask
      );

      return res.status(200).json(updatedTask);
    }

    // The update failed. Determine whether the task exists
    // so we can distinguish "not found" from a concurrency conflict.
    const currentTask = await Task.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!currentTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(409).json({
      message:
        "Task was updated by another user. Please review the latest version before making changes.",
      conflict: true,
      task: currentTask,
    });
  } catch (error) {
    console.error("Update task error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid task data",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    return res.status(500).json({
      message: "Server error while updating task",
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOneAndDelete({
      _id: id,
      createdBy: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    emitTaskEvent(req, "task:deleted", task);

    return res.status(200).json({
      message: "Task deleted successfully",
      task,
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      message: "Server error while deleting task",
    });
  }
};
