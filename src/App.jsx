import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import {
  createTask,
  deleteTask,
  getCurrentUser,
  getTasks,
  loginUser,
  registerUser,
  updateTask,
} from "./api/api";

import Board from "./components/Board/Board";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import TaskForm from "./components/TaskForm/TaskForm";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

const getCacheKey = (userId) =>
  `collabboard_tasks_${userId}`;

const getCachedTasks = (userId) => {
  try {
    const cached = localStorage.getItem(
      getCacheKey(userId)
    );

    if (!cached) {
      return [];
    }

    return JSON.parse(cached);
  } catch {
    return [];
  }
};

const saveCachedTasks = (userId, tasks) => {
  try {
    localStorage.setItem(
      getCacheKey(userId),
      JSON.stringify(tasks)
    );
  } catch {
    // Ignore localStorage errors.
  }
};

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [authMode, setAuthMode] = useState("login");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [isOffline, setIsOffline] = useState(
    !navigator.onLine
  );

  const socketRef = useRef(null);

  /*
   * Load the current user and tasks whenever the
   * authentication token changes.
   */
  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const loadUserData = async () => {
      setLoading(true);
      setError("");

      try {
        const currentUser =
          await getCurrentUser(token);

        if (cancelled) {
          return;
        }

        setUser(currentUser.user);

        try {
          const serverTasks = await getTasks(token);

          if (cancelled) {
            return;
          }

          setTasks(serverTasks);

          saveCachedTasks(
            currentUser.user.id,
            serverTasks
          );

          setIsOffline(false);
        } catch (taskError) {
          if (cancelled) {
            return;
          }

          if (taskError.isNetworkError) {
            const cachedTasks = getCachedTasks(
              currentUser.user.id
            );

            setTasks(cachedTasks);
            setIsOffline(true);
            setError(
              "Offline — showing cached data"
            );
          } else {
            throw taskError;
          }
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError.isNetworkError) {
          setError(
            "Unable to connect to the server"
          );
        } else {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setTasks([]);
          setError(
            loadError.message ||
              "Unable to load your account"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      cancelled = true;
    };
  }, [token]);

  /*
   * Keep track of browser online/offline state.
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setError("");
    };

    const handleOffline = () => {
      setIsOffline(true);
      setError("Offline — showing cached data");
    };

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);

  /*
   * Connect to Socket.io whenever the user is
   * authenticated.
   */
  useEffect(() => {
    if (!token || !user) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsOffline(false);
    });

    socket.on("connect_error", (socketError) => {
      console.error(
        "Socket connection error:",
        socketError.message
      );
    });

    /*
     * A task was created.
     */
    socket.on("task:created", (newTask) => {
      setTasks((currentTasks) => {
        const alreadyExists = currentTasks.some(
          (task) => task._id === newTask._id
        );

        const updatedTasks = alreadyExists
          ? currentTasks.map((task) =>
              task._id === newTask._id
                ? newTask
                : task
            )
          : [newTask, ...currentTasks];

        saveCachedTasks(
          user.id,
          updatedTasks
        );

        return updatedTasks;
      });
    });

    /*
     * A task was updated.
     */
    socket.on("task:updated", (updatedTask) => {
      setTasks((currentTasks) => {
        const updatedTasks = currentTasks.map(
          (task) =>
            task._id === updatedTask._id
              ? updatedTask
              : task
        );

        saveCachedTasks(
          user.id,
          updatedTasks
        );

        return updatedTasks;
      });
    });

    /*
     * A task was deleted.
     */
    socket.on("task:deleted", (deletedTask) => {
      setTasks((currentTasks) => {
        const updatedTasks =
          currentTasks.filter(
            (task) =>
              task._id !== deletedTask._id
          );

        saveCachedTasks(
          user.id,
          updatedTasks
        );

        return updatedTasks;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user]);

  /*
   * Login.
   */
  const handleLogin = async (credentials) => {
    setError("");
    setSuccessMessage("");

    try {
      const response =
        await loginUser(credentials);

      localStorage.setItem(
        "token",
        response.token
      );

      setToken(response.token);
      setUser(response.user);

      setSuccessMessage(
        "Login successful"
      );
    } catch (loginError) {
      setError(
        loginError.message ||
          "Unable to log in"
      );
    }
  };

  /*
   * Registration.
   */
  const handleRegister = async (userData) => {
    setError("");
    setSuccessMessage("");

    try {
      const response =
        await registerUser(userData);

      localStorage.setItem(
        "token",
        response.token
      );

      setToken(response.token);
      setUser(response.user);

      setSuccessMessage(
        "Account created successfully"
      );
    } catch (registerError) {
      setError(
        registerError.message ||
          "Unable to create account"
      );
    }
  };

  /*
   * Logout.
   */
  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
    setTasks([]);
    setError("");
    setSuccessMessage("");
    setAuthMode("login");
  };

  /*
   * Create a task.
   */
  const handleCreateTask = async (taskData) => {
    if (isOffline) {
      setError(
        "You are offline. Reconnect before creating a task."
      );

      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const newTask = await createTask(
        token,
        taskData
      );

      /*
       * Socket.io will also send this task back to
       * this client. The ID check prevents duplicates.
       */
      setTasks((currentTasks) => {
        const alreadyExists = currentTasks.some(
          (task) => task._id === newTask._id
        );

        const updatedTasks = alreadyExists
          ? currentTasks
          : [newTask, ...currentTasks];

        saveCachedTasks(
          user.id,
          updatedTasks
        );

        return updatedTasks;
      });

      setSuccessMessage(
        "Task created successfully"
      );
    } catch (createError) {
      if (createError.isNetworkError) {
        setIsOffline(true);
        setError(
          "You are offline. The task could not be created."
        );
      } else {
        setError(
          createError.message ||
            "Unable to create task"
        );
      }
    }
  };

  /*
   * Update a task using optimistic concurrency.
   */
  const handleUpdateTask = async (
    taskId,
    taskData
  ) => {
    if (isOffline) {
      setError(
        "You are offline. Reconnect before updating a task."
      );

      return;
    }

    setError("");
    setSuccessMessage("");

    /*
     * Find the version currently known by this client.
     */
    const currentTask = tasks.find(
      (task) => task._id === taskId
    );

    if (!currentTask) {
      setError(
        "The task could not be found locally."
      );

      return;
    }

    try {
      const updatedTask = await updateTask(
        token,
        taskId,
        {
          ...taskData,
          expectedVersion:
            currentTask.version,
        }
      );

      setTasks((currentTasks) => {
        const updatedTasks =
          currentTasks.map((task) =>
            task._id === updatedTask._id
              ? updatedTask
              : task
          );

        saveCachedTasks(
          user.id,
          updatedTasks
        );

        return updatedTasks;
      });

      setSuccessMessage(
        "Task updated successfully"
      );
    } catch (updateError) {
      if (updateError.isNetworkError) {
        setIsOffline(true);
        setError(
          "You are offline. The task could not be updated."
        );

        return;
      }

      /*
       * Handle the M5 concurrency conflict.
       */
      if (
        updateError.status === 409 &&
        updateError.data?.conflict
      ) {
        const latestTask =
          updateError.data.task;

        if (latestTask) {
          setTasks((currentTasks) => {
            const updatedTasks =
              currentTasks.map((task) =>
                task._id === latestTask._id
                  ? latestTask
                  : task
              );

            saveCachedTasks(
              user.id,
              updatedTasks
            );

            return updatedTasks;
          });
        }

        setError(
          "Conflict detected: another user updated this task. The latest version is now shown. Please review it before making another change."
        );

        return;
      }

      setError(
        updateError.message ||
          "Unable to update task"
      );
    }
  };

  /*
   * Delete a task.
   */
  const handleDeleteTask = async (taskId) => {
    if (isOffline) {
      setError(
        "You are offline. Reconnect before deleting a task."
      );

      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      await deleteTask(token, taskId);

      setTasks((currentTasks) => {
        const updatedTasks =
          currentTasks.filter(
            (task) => task._id !== taskId
          );

        saveCachedTasks(
          user.id,
          updatedTasks
        );

        return updatedTasks;
      });

      setSuccessMessage(
        "Task deleted successfully"
      );
    } catch (deleteError) {
      if (deleteError.isNetworkError) {
        setIsOffline(true);
        setError(
          "You are offline. The task could not be deleted."
        );

        return;
      }

      setError(
        deleteError.message ||
          "Unable to delete task"
      );
    }
  };

  /*
   * Logged-out view.
   */
  if (!token) {
    return (
      <div className="app">
        {authMode === "login" ? (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() =>
              setAuthMode("register")
            }
          />
        ) : (
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() =>
              setAuthMode("login")
            }
          />
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
      </div>
    );
  }

  /*
   * Loading view.
   */
  if (loading) {
    return (
      <div className="app">
        <p>Loading...</p>
      </div>
    );
  }

  /*
   * Main application.
   */
  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>CollabBoard</h1>

          {user && (
            <p>
              Welcome, {user.name}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      {isOffline && (
        <div className="offline-banner">
          Offline — showing cached data
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <TaskForm
        onCreateTask={handleCreateTask}
        disabled={isOffline}
      />

      <Board
        tasks={tasks}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
}

export default App;