const getUserCacheKey = (userId) =>
  `collabboard_user_${userId}`;

export const getCachedUser = (userId) => {
  if (!userId) {
    return null;
  }

  try {
    const cachedUser = localStorage.getItem(
      getUserCacheKey(userId)
    );

    if (!cachedUser) {
      return null;
    }

    return JSON.parse(cachedUser);
  } catch {
    return null;
  }
};

export const saveCachedUser = (user) => {
  if (!user?.id) {
    return;
  }

  try {
    localStorage.setItem(
      getUserCacheKey(user.id),
      JSON.stringify(user)
    );
  } catch {
    // Ignore localStorage failures.
  }
};

export const clearCachedUser = (userId) => {
  if (!userId) {
    return;
  }

  try {
    localStorage.removeItem(
      getUserCacheKey(userId)
    );
  } catch {
    // Ignore localStorage failures.
  }
};
