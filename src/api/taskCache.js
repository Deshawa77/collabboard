const getTaskCacheKey = (userId) =>
  `collabboard_tasks_${userId}`;

export const getCachedTasks = (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const cachedTasks = localStorage.getItem(
      getTaskCacheKey(userId)
    );

    if (!cachedTasks) {
      return [];
    }

    const tasks = JSON.parse(cachedTasks);

    return Array.isArray(tasks) ? tasks : [];
  } catch {
    return [];
  }
};

export const saveCachedTasks = (userId, tasks) => {
  if (!userId) {
    return;
  }

  try {
    localStorage.setItem(
      getTaskCacheKey(userId),
      JSON.stringify(tasks)
    );
  } catch {
    // Ignore localStorage failures.
  }
};

export const clearCachedTasks = (userId) => {
  if (!userId) {
    return;
  }

  try {
    localStorage.removeItem(
      getTaskCacheKey(userId)
    );
  } catch {
    // Ignore localStorage failures.
  }
};
