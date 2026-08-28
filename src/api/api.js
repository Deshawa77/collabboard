
const API_URL = "http://localhost:5000/api";

const request = async (endpoint, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    const networkError = new Error(
      "Unable to connect to the server"
    );

    networkError.isNetworkError = true;

    throw networkError;
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const apiError = new Error(
      data.message || "Something went wrong"
    );

    apiError.status = response.status;

    throw apiError;
  }

  return data;
};

export const registerUser = async (userData) => {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (credentials) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const getCurrentUser = async (token) => {
  return request("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getTasks = async (token) => {
  return request("/tasks", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createTask = async (token, taskData) => {
  return request("/tasks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });
};

export const updateTask = async (
  token,
  taskId,
  taskData
) => {
  return request(`/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });
};

export const deleteTask = async (token, taskId) => {
  return request(`/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
