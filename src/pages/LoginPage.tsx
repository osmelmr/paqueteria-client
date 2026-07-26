import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { useAuthStore } from '../store/auth.store';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  if (isAuthenticated) {
    navigate('/', { replace: true });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await loginMutation.mutateAsync({ username, password });
      navigate('/', { replace: true });
    } catch {
      // error is handled by the store
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Paqueteria</h1>
      </header>
      {error && <div className="error-box">{error}</div>}
      <section className="panel">
        <h2>Acceso</h2>
        <form onSubmit={handleSubmit} className="simple-form">
          <label>
            Usuario
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            Contrasena
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </div>
  );
}
