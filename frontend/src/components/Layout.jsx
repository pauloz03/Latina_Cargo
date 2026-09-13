import { useAuth } from '../context/AuthContext';

export function Layout({ title, children }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="brand">Latina Cargo</p>
          <h1>{title}</h1>
        </div>
        <div className="topbar-actions">
          <span>{user?.email}</span>
          {isAdmin && <span className="badge">Administrador</span>}
          <button type="button" className="ghost" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
