
import TaskCard from "../TaskCard/TaskCard";

function Column({
  title,
  tasks,
  onUpdateTask,
  onDeleteTask,
}) {
  return (
    <section className="board-column">
      <header className="column-header">
        <h2>{title}</h2>

        <span className="task-count">
          {tasks.length}
        </span>
      </header>

      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task._id || task.id}
            task={task}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </section>
  );
}

export default Column;
