function TaskCard({ task }) {
  return (
    <article className="task-card">
      <div className="task-card-header">
        <span className={`priority priority-${task.priority}`}>
          {task.priority}
        </span>

        <span className="task-id">#{task.id}</span>
      </div>

      <h3 className="task-title">{task.title}</h3>

      <p className="task-description">{task.description}</p>

      <div className="task-card-footer">
        <span className="assignee">{task.assignee}</span>
      </div>
    </article>
  );
}

export default TaskCard;