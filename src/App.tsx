import { useEffect, useState, type FormEvent } from 'react';
import type { User } from './types';
import { api, setToken, clearToken, setUser, clearUser, getToken, getUser } from './api';
import AgenciesPage from './pages/AgenciesPage';
import GuidesPage from './pages/GuidesPage';
import PackagesPage from './pages/PackagesPage';
import RecipientsPage from './pages/RecipientsPage';
import ProvincesPage from './pages/ProvincesPage';
import LocationsPage from './pages/LocationsPage';
import StatusesPage from './pages/StatusesPage';
import UsersPage from './pages/UsersPage';
import BulkPackageEntryPage from './pages/BulkPackageEntryPage';
import AiPreviewPage from './pages/AiPreviewPage';
import AiExtractPage from './pages/AiExtractPage';
import UpdateStatusBulkPage from './pages/UpdateStatusBulkPage';

type Section = 'login' | 'bulk' | 'ai-preview' | 'ai-extract' | 'update-status-bulk' | 'agencies' | 'guides' | 'packages' | 'recipients' | 'provinces' | 'locations' | 'statuses' | 'users';

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'ai-extract', label: 'AI Extract' },
  { key: 'bulk', label: 'Ingreso masivo' },
  { key: 'update-status-bulk', label: 'Actualizar Estado Bulk' },
  { key: 'ai-preview', label: 'AI Preview' },
  { key: 'agencies', label: 'Agencias' },
  { key: 'guides', label: 'Guías' },
  { key: 'packages', label: 'Paquetes' },
  { key: 'recipients', label: 'Destinatarios' },
  { key: 'provinces', label: 'Provincias' },
  { key: 'locations', label: 'Ubicaciones' },
  { key: 'statuses', label: 'Estados' },
  { key: 'users', label: 'Usuarios' },
];

function App() {
  const [token, setTokenState] = useState(getToken());
  const [user, setUserState] = useState<User | null>(getUser() as User | null);
  const [section, setSection] = useState<Section>('login');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      setTokenState(savedToken);
      setUserState(getUser() as User | null);
      setSection('packages');
    }
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await api<{ accessToken: string; user: User }>('/auth/login', 'POST', loginForm);
      setTokenState(result.accessToken);
      setUserState(result.user);
      setToken(result.accessToken);
      setUser(result.user);
      setSection('packages');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    clearUser();
    setTokenState('');
    setUserState(null);
    setSection('login');
  };

  if (!token) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <h1>Paquetería</h1>
        </header>
        {error && <div className="error-box">{error}</div>}
        <section className="panel">
          <h2>Acceso</h2>
          <form onSubmit={handleLogin} className="simple-form">
            <label>
              Usuario
              <input value={loginForm.username} onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))} required />
            </label>
            <label>
              Contraseña
              <input type="password" value={loginForm.password} onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))} required />
            </label>
            <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Paquetería</h1>
        </div>
        <div className="user-panel">
          <span><strong>{user?.username}</strong> ({user?.role})</span>
          <button type="button" className="secondary" onClick={handleLogout}>Salir</button>
        </div>
      </header>
      {error && <div className="error-box">{error}</div>}
      <nav className="section-nav">
        {SECTIONS.map((s) => (
          <button key={s.key} className={section === s.key ? 'active' : ''} onClick={() => setSection(s.key)} type="button">
            {s.label}
          </button>
        ))}
      </nav>
      {section === 'ai-extract' && <AiExtractPage />}
      {section === 'bulk' && <BulkPackageEntryPage />}
      {section === 'update-status-bulk' && <UpdateStatusBulkPage />}
      {section === 'ai-preview' && <AiPreviewPage />}
      {section === 'agencies' && <AgenciesPage />}
      {section === 'guides' && <GuidesPage />}
      {section === 'packages' && <PackagesPage />}
      {section === 'recipients' && <RecipientsPage />}
      {section === 'provinces' && <ProvincesPage />}
      {section === 'locations' && <LocationsPage />}
      {section === 'statuses' && <StatusesPage />}
      {section === 'users' && <UsersPage />}
    </div>
  );
}

export default App;
