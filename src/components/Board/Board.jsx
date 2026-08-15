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

function Board({ tasks }) {
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
          />
        );
      })}
    </main>
  );
}

export default Board;