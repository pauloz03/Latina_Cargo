export function AuthPage({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <header className="auth-hero">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      <div className="auth-body">{children}</div>
    </div>
  );
}
