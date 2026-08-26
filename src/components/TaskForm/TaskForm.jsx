function TaskForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitting,
}) {
  return (
    <form className="task-form" onSubmit={onSubmit}>
      <h2>Create Task</h2>

      <label>
        Title
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onChange}
          placeholder="Enter task title"
          required
        />
      </label>

      <label>
        Description
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Describe the task"
          rows="4"
        />
      </label>

      <label>
        Status
        <select
          name="status"
          value={formData.status}
          onChange={onChange}
        >
          <option value="todo">To Do</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
      </label>

      <label>
        Priority
        <select
          name="priority"
          value={formData.priority}
          onChange={onChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <label>
        Assignee
        <input
          type="text"
          name="assignee"
          value={formData.assignee}
          onChange={onChange}
          placeholder="Enter assignee"
        />
      </label>

      <div className="task-form-actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Task"}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;