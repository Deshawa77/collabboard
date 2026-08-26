
function TaskCard({
  task,
  onUpdateTask,
  onDeleteTask,
}) {
  // Real API tasks use MongoDB's _id.
  // Test/mock tasks may use a numeric id.
  const taskId = task._id || task.id;

  const displayId =
    typeof taskId === "string"
      ? taskId.slice(-6)
      : taskId;

  const handleMove = async (newStatus) => {
    if (newStatus === task.status) {
      return;
    }

    if (onUpdateTask) {
      await onUpdateTask(taskId, {
        status: newStatus,
      });
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${task.title}"?`
    );

    if (!confirmed) {
      return;
    }

    if (onDeleteTask) {
      await onDeleteTask(taskId);
    }
  };

  return (
    <article className="task-card">
      <div className="task-card-header">
        <span
          className={`priority priority-${task.priority}`}
        >
          {task.priority}
        </span>

        <span className="task-id">
          #{displayId}
        </span>
      </div>

      <h3 className="task-title">
        {task.title}
      </h3>

      <p className="task-description">
        {task.description}
      </p>

      <div className="task-card-footer">
        <span className="assignee">
          {task.assignee || "Unassigned"}
        </span>
      </div>

      {onUpdateTask && onDeleteTask && (
        <div className="task-actions">
          {task.status !== "todo" && (
            <button
              type="button"
              onClick={() => handleMove("todo")}
            >
              To Do
            </button>
          )}

          {task.status !== "doing" && (
            <button
              type="button"
              onClick={() => handleMove("doing")}
            >
              Doing
            </button>
          )}

          {task.status !== "done" && (
            <button
              type="button"
              onClick={() => handleMove("done")}
            >
              Done
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}

export default TaskCard;
