import TaskCard from "../TaskCard/TaskCard";

function Column({ title, tasks }) {
  return (
    <section className="board-column">
      <header className="column-header">
        <h2>{title}</h2>
        <span className="task-count">{tasks.length}</span>
      </header>

      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}

export default Column;