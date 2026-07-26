import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useUIStore } from '../store/ui.store';
import { useThemeStore } from '../store/theme.store';

export function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <header className="navbar">
      <div className="navbar__left">
        <button
          type="button"
          className="navbar__hamburger"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          &#9776;
        </button>
        <h1 className="navbar__title" onClick={() => navigate('/')}>
          Paqueteria
        </h1>
      </div>
      <div className="navbar__center">
        <button
          type="button"
          className="navbar__link"
          onClick={() => navigate('/update-status-bulk')}
        >
          Recepcion
        </button>
        <button
          type="button"
          className="navbar__link"
          onClick={() => navigate('/ai-extract')}
        >
          Add Manifiesto
        </button>
      </div>
      <div className="navbar__right">
        <button
          type="button"
          className="navbar__theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
        </button>
        <span className="navbar__user">
          {user?.username} ({user?.role})
        </span>
        <button type="button" className="navbar__logout" onClick={logout}>
          Salir
        </button>
      </div>
    </header>
  );
}
