import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthPage } from '../components/AuthPage';
import { client } from '../Supabase/client';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const { data, error: signInError } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    const { data: profile } = await client
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single();

    navigate(profile?.is_admin ? '/admin' : '/dashboard', { replace: true });
  };

  return (
    <AuthPage title="Inicio de sesión" subtitle="Inicio / Login">
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
        <p className="auth-links">
          ¿No tiene cuenta? <Link to="/signup">Regístrate</Link>
        </p>
      </form>
    </AuthPage>
  );
}
