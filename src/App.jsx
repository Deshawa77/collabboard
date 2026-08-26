import { useEffect, useState } from "react";
import Header from "./components/Header/Header";
import Board from "./components/Board/Board";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import TaskForm from "./components/TaskForm/TaskForm";
import {
  getCurrentUser,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./api/api";
import "./App.css";

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("collabboard_token")
  );

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [showRegister, setShowRegister] = useState(false);

  const [loading, setLoading] = useState(
    () => Boolean(localStorage.getItem("collabboard_token"))
  );

  const [error, setError] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignee: "",
  });

  // ========================================
  // Load current user and tasks
  // ========================================

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const loadApp = async () => {
      try {
        setError("");

        const userData = await getCurrentUser(token);
        const taskData = await getTasks(token);

        if (cancelled) {
          return;
        }

        setUser(userData.user);
        setTasks(taskData);
      } catch (error) {
        if (cancelled) {
          return;
        }

        localStorage.removeItem("collabboard_token");

        setToken(null);
        setUser(null);
        setTasks([]);
        setError(error.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadApp();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ========================================
  // Login
  // ========================================

  const handleLogin = (data) => {
    localStorage.setItem(
      "collabboard_token",
      data.token
    );

    setToken(data.token);
    setUser(data.user);
    setError("");
    setLoading(false);
  };

  // ========================================
  // Register
  // ========================================

  const handleRegister = (data) => {
    localStorage.setItem(
      "collabboard_token",
      data.token
    );

    setToken(data.token);
    setUser(data.user);
    setShowRegister(false);
    setError("");
    setLoading(false);
  };

  // ========================================
  // Logout
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem("collabboard_token");

    setToken(null);
    setUser(null);
    setTasks([]);
    setError("");
    setShowTaskForm(false);
  };

  // ========================================
  // Open Task Form
  // ========================================

  const handleOpenTaskForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assignee: user.name,
    });

    setError("");
    setShowTaskForm(true);
  };

  // ========================================
  // Task Form Changes
  // ========================================

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  // ========================================
  // Create Task
  // ========================================

  const handleCreateTask = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const newTask = await createTask(
        token,
        formData
      );

      setTasks((currentTasks) => [
        newTask,
        ...currentTasks,
      ]);

      setShowTaskForm(false);

      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignee: user.name,
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // Cancel Task Form
  // ========================================

  const handleCancelTaskForm = () => {
    if (submitting) {
      return;
    }

    setShowTaskForm(false);
    setError("");
  };

  // ========================================
  // Update Task
  // ========================================

  const handleUpdateTask = async (
    taskId,
    taskData
  ) => {
    try {
      setError("");

      const updatedTask = await updateTask(
        token,
        taskId,
        taskData
      );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task._id === updatedTask._id
            ? updatedTask
            : task
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  // ========================================
  // Delete Task
  // ========================================

  const handleDeleteTask = async (taskId) => {
    try {
      setError("");

      await deleteTask(token, taskId);

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task._id !== taskId
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  // ========================================
  // Loading
  // ========================================

  if (loading) {
    return <p>Loading CollabBoard...</p>;
  }

  // ========================================
  // Authentication
  // ========================================

  if (!token || !user) {
    if (showRegister) {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() =>
            setShowRegister(false)
          }
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() =>
          setShowRegister(true)
        }
      />
    );
  }

  // ========================================
  // Main Application
  // ========================================

  return (
    <div className="app">
      <Header
        user={user}
        onLogout={handleLogout}
      />

      <main className="app-content">
        <section className="board-heading">
          <div>
            <p className="eyebrow">WORKSPACE</p>

            <h2>Project Board</h2>

            <p className="board-description">
              Organize your team's work and keep
              projects moving.
            </p>
          </div>

          <button
            className="add-task-button"
            type="button"
            onClick={handleOpenTaskForm}
          >
            + Add Task
          </button>
        </section>

        {error && (
          <p className="api-error">
            {error}
          </p>
        )}

        {showTaskForm && (
          <TaskForm
            formData={formData}
            onChange={handleFormChange}
            onSubmit={handleCreateTask}
            onCancel={handleCancelTaskForm}
            submitting={submitting}
          />
        )}

        <Board
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      </main>
    </div>
  );
}

export default App;
