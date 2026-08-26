function Header({ user, onLogout }) {
  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon">C</div>

        <div>
          <h1>CollabBoard</h1>
          <p>Team task management</p>
        </div>
      </div>

      <div className="header-user">
        <span className="user-name">{user.name}</span>

        <div className="user-avatar">
          {initial}
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;