import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useUIStore } from '../store/ui.store';

interface NavGroup {
  label: string;
  roles: string[];
  links: { label: string; path: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Paquetes', roles: ['ADMIN', 'STOREKEEPER'],
    links: [
      { label: 'Ver todos', path: '/packages' },
      { label: 'Nuevo', path: '/packages/new' },
    ],
  },
  {
    label: 'Guias', roles: ['ADMIN', 'STOREKEEPER'],
    links: [
      { label: 'Ver todos', path: '/guides' },
      { label: 'Nueva', path: '/guides/new' },
    ],
  },
  {
    label: 'Agencias', roles: ['ADMIN', 'STOREKEEPER'],
    links: [
      { label: 'Ver todos', path: '/agencies' },
      { label: 'Nueva', path: '/agencies/new' },
    ],
  },
  {
    label: 'Destinatarios', roles: ['ADMIN', 'STOREKEEPER'],
    links: [
      { label: 'Ver todos', path: '/recipients' },
      { label: 'Nuevo', path: '/recipients/new' },
    ],
  },
  {
    label: 'Provincias', roles: ['ADMIN', 'STOREKEEPER'],
    links: [
      { label: 'Ver todos', path: '/provinces' },
      { label: 'Nueva', path: '/provinces/new' },
    ],
  },
  {
    label: 'Municipios', roles: ['ADMIN', 'STOREKEEPER'],
    links: [
      { label: 'Ver todos', path: '/municipes' },
      { label: 'Nuevo', path: '/municipes/new' },
    ],
  },
  {
    label: 'Ubicaciones', roles: ['ADMIN', 'STOREKEEPER'],
    links: [
      { label: 'Ver todos', path: '/locations' },
      { label: 'Nueva', path: '/locations/new' },
    ],
  },
  {
    label: 'Estados', roles: ['ADMIN', 'STOREKEEPER'],
    links: [
      { label: 'Ver todos', path: '/statuses' },
      { label: 'Nuevo', path: '/statuses/new' },
    ],
  },
  {
    label: 'Usuarios', roles: ['ADMIN'],
    links: [
      { label: 'Ver todos', path: '/users' },
      { label: 'Nuevo', path: '/users/new' },
    ],
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const visibleGroups = NAV_GROUPS.filter(
    (g) => user && g.roles.includes(user.role),
  );

  const isActive = (path: string) => {
    if (path === location.pathname) return true;
    if (!path.endsWith('/new') && path.split('/').length === 2) {
      const p = location.pathname.split('/');
      if (p.length === 4 && p[3] === 'edit' && p[1] === path.split('/')[1]) return true;
    }
    return false;
  };

  return (
    <>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <nav className="sidebar__nav">
          {visibleGroups.map((group) => (
            <div key={group.label} className="sidebar__group">
              <span className="sidebar__group-label">{group.label}</span>
              {group.links.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  className={`sidebar__link ${isActive(link.path) ? 'sidebar__link--active' : ''}`}
                  onClick={() => {
                    navigate(link.path);
                    setSidebarOpen(false);
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
