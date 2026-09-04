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
import {
  getCachedTasks,
  saveCachedTasks,
  clearCachedTasks,
} from "./api/taskCache";
import {
  getCachedUser,
  saveCachedUser,
  clearCachedUser,
} from "./api/userCache";
import "./App.css";

function App() {
  // ========================================
  // Authentication state
  // ========================================

  const [token, setToken] = useState(
    () => localStorage.getItem("collabboard_token")
  );

  // Remember which user the current token belongs to.
  // This lets us load the correct user-specific task cache.
  const [user, setUser] = useState(() => {
    const cachedUserId = localStorage.getItem(
      "collabboard_last_user_id"
    );

    return getCachedUser(cachedUserId);
  });

  const [tasks, setTasks] = useState(() => {
    const cachedUserId = localStorage.getItem(
      "collabboard_last_user_id"
    );

    return getCachedTasks(cachedUserId);
  });

  const [showRegister, setShowRegister] = useState(false);

  const [loading, setLoading] = useState(() => {
    const cachedUserId = localStorage.getItem(
      "collabboard_last_user_id"
    );

    return (
      Boolean(localStorage.getItem("collabboard_token")) &&
      !getCachedUser(cachedUserId)
    );
  });

  // ========================================
  // Application state
  // ========================================

  const [offline, setOffline] = useState(false);
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

    const loadApp = async () => {
      try {
        setError("");
        setOffline(false);

        // Verify the token and retrieve the authenticated user.
        const userData = await getCurrentUser(token);

        const authenticatedUser = userData.user;

        // Store the ID of the currently authenticated user.
        localStorage.setItem(
          "collabboard_last_user_id",
          authenticatedUser.id
        );

        // Update the user immediately.
        setUser(authenticatedUser);
        saveCachedUser(authenticatedUser);

        // Retrieve the user's tasks from MongoDB.
        const taskData = await getTasks(token);

        // Update the board with the server data.
        setTasks(taskData);

        // Cache only this user's tasks.
        saveCachedTasks(
          authenticatedUser.id,
          taskData
        );
      } catch (error) {
        // ========================================
        // Session expired / invalid token
        // ========================================

        if (error.status === 401) {
          const cachedUserId = localStorage.getItem(
            "collabboard_last_user_id"
          );

          localStorage.removeItem(
            "collabboard_token"
          );

          clearCachedUser(cachedUserId);
          clearCachedTasks(cachedUserId);

          localStorage.removeItem(
            "collabboard_last_user_id"
          );

          setToken(null);
          setUser(null);
          setTasks([]);

          setError(
            "Your session has expired. Please log in again."
          );

          return;
        }

        // ========================================
        // Backend unavailable / network failure
        // ========================================

        if (error.isNetworkError) {
          const cachedUserId = localStorage.getItem(
            "collabboard_last_user_id"
          );

          const cachedUser =
            getCachedUser(cachedUserId);

          const cachedTasks =
            getCachedTasks(cachedUserId);

          if (cachedUser) {
            setUser(cachedUser);
          }

          setTasks(cachedTasks);
          setOffline(true);

          setError(
            "Unable to connect to the server. Showing cached data."
          );

          return;
        }

        // ========================================
        // Other API error
        // ========================================

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadApp();
  }, [token]);

  // ========================================
  // Login
  // ========================================

  const handleLogin = (data) => {
    const userId = data.user.id;

    localStorage.setItem(
      "collabboard_token",
      data.token
    );

    localStorage.setItem(
      "collabboard_last_user_id",
      userId
    );

    saveCachedUser(data.user);

    // Load this specific user's cached tasks.
    const cachedTasks = getCachedTasks(userId);

    setToken(data.token);
    setUser(data.user);
    setTasks(cachedTasks);

    setError("");
    setOffline(false);
    setLoading(false);
  };

  // ========================================
  // Register
  // ========================================

  const handleRegister = (data) => {
    const userId = data.user.id;

    localStorage.setItem(
      "collabboard_token",
      data.token
    );

    localStorage.setItem(
      "collabboard_last_user_id",
      userId
    );

    saveCachedUser(data.user);

    // Load this user's existing cache if one exists.
    const cachedTasks = getCachedTasks(userId);

    setToken(data.token);
    setUser(data.user);
    setTasks(cachedTasks);

    setShowRegister(false);
    setError("");
    setOffline(false);
    setLoading(false);
  };

  // ========================================
  // Logout
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem(
      "collabboard_token"
    );

    localStorage.removeItem(
      "collabboard_last_user_id"
    );

    setToken(null);
    setUser(null);
    setTasks([]);

    setError("");
    setOffline(false);
    setShowTaskForm(false);
    setLoading(false);
  };

  // ========================================
  // Open Task Form
  // ========================================

  const handleOpenTaskForm = () => {
    if (offline) {
      setError(
        "You are offline. Reconnect to the server before creating a task."
      );

      return;
    }

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

      setTasks((currentTasks) => {
        const updatedTasks = [
          newTask,
          ...currentTasks,
        ];

        // Cache tasks under the authenticated user's ID.
        saveCachedTasks(
          user.id,
          updatedTasks
        );

        return updatedTasks;
      });

      setShowTaskForm(false);
      setOffline(false);

      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignee: user.name,
      });
    } catch (error) {
      // ========================================
      // Authentication failure
      // ========================================

      if (error.status === 401) {
        handleLogout();

        setError(
          "Your session has expired. Please log in again."
        );

        return;
      }

      // ========================================
      // Network failure
      // ========================================

      if (error.isNetworkError) {
        setOffline(true);

        setError(
          "Unable to connect to the server. Your task was not saved."
        );

        return;
      }

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

      setTasks((currentTasks) => {
        const updatedTasks = currentTasks.map(
          (task) =>
            task._id === updatedTask._id
              ? updatedTask
              : task
        );

        // Update only this user's cache.
        saveCachedTasks(
          user.id,
          updatedTasks
        );

        return updatedTasks;
      });

      setOffline(false);
    } catch (error) {
      // ========================================
      // Authentication failure
      // ========================================

      if (error.status === 401) {
        handleLogout();

        setError(
          "Your session has expired. Please log in again."
        );

        return;
      }

      // ========================================
      // Network failure
      // ========================================

      if (error.isNetworkError) {
        setOffline(true);

        setError(
          "Unable to connect to the server. Your change was not saved."
        );

        return;
      }

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

      setTasks((currentTasks) => {
        const updatedTasks = currentTasks.filter(
          (task) => task._id !== taskId
        );

        // Update only this user's cache.
        saveCachedTasks(
          user.id,
          updatedTasks
        );

        return updatedTasks;
      });

      setOffline(false);
    } catch (error) {
      // ========================================
      // Authentication failure
      // ========================================

      if (error.status === 401) {
        handleLogout();

        setError(
          "Your session has expired. Please log in again."
        );

        return;
      }

      // ========================================
      // Network failure
      // ========================================

      if (error.isNetworkError) {
        setOffline(true);

        setError(
          "Unable to connect to the server. Your task was not deleted."
        );

        return;
      }

      setError(error.message);
    }
  };

  // ========================================
  // Loading
  // ========================================

  if (loading && token) {
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
            disabled={offline}
          >
            + Add Task
          </button>
        </section>

        {offline && (
          <p className="offline-status">
            Offline — showing cached data
          </p>
        )}

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
