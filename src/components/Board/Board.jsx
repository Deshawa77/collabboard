import Column from "../Column/Column";

const columns = [
  {
    id: "todo",
    title: "To Do",
  },
  {
    id: "doing",
    title: "Doing",
  },
  {
    id: "done",
    title: "Done",
  },
];

function Board({ tasks, onUpdateTask, onDeleteTask }) {
  return (
    <main className="board">
      {columns.map((column) => {
        const columnTasks = tasks.filter(
          (task) => task.status === column.id
        );

        return (
          <Column
            key={column.id}
            title={column.title}
            tasks={columnTasks}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        );
      })}
    </main>
  );
}

export default Board;