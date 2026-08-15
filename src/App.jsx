import Header from "./components/Header/Header";
import Board from "./components/Board/Board";
import mockTasks from "./data/mockTasks";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Header />

      <main className="app-content">
        <section className="board-heading">
          <div>
            <p className="eyebrow">WORKSPACE</p>
            <h2>Project Board</h2>
            <p className="board-description">
              Organize your team's work and keep projects moving.
            </p>
          </div>

          <button className="add-task-button">+ Add Task</button>
        </section>

        <Board tasks={mockTasks} />
      </main>
    </div>
  );
}

export default App;