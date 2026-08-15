function Header() {
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
        <span className="user-name">Deshawa</span>
        <div className="user-avatar">D</div>
      </div>
    </header>
  );
}

export default Header;