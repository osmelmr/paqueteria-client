import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useUIStore } from '../store/ui.store';

interface NavLink {
  label: string;
  path: string;
}

interface NavGroup {
  label: string;
  roles: string[];
  links?: NavLink[];
  groups?: NavGroup[];
  path?: string;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Inicio', roles: ['ADMIN', 'STOREKEEPER'],
    path: '/',
  },
  {
    label: 'Paquetes', roles: ['ADMIN', 'STOREKEEPER'],
    path: '/packages',
  },
  
  {
    label: 'Rutas', roles: ['ADMIN', 'STOREKEEPER'],
    links: [
      { label: 'Rutas', path: '/routes' },
      { label: 'Vehiculos', path: '/vehicles' },
      { label: 'Choferes', path: '/drivers' },
    ],
  },
  {
    label: 'Guias', roles: ['ADMIN', 'STOREKEEPER'],
    path: '/guides',
  },
  {
    label: 'Agencias', roles: ['ADMIN', 'STOREKEEPER'],
    path: '/agencies',
  },
  {
    label: 'Destino', roles: ['ADMIN', 'STOREKEEPER'],
    links: [],
    groups: [
      {
        label: 'Destinatarios', roles: ['ADMIN', 'STOREKEEPER'],
        path: '/recipients',
      },
      {
        label: 'Provincias', roles: ['ADMIN', 'STOREKEEPER'],
        path: '/provinces',
      },
      {
        label: 'Municipios', roles: ['ADMIN', 'STOREKEEPER'],
        path: '/municipes',
      },
    ],
  },
  {
    label: 'Ubicaciones', roles: ['ADMIN', 'STOREKEEPER'],
    path: '/locations',
  },
  {
    label: 'Estados', roles: ['ADMIN', 'STOREKEEPER'],
    path: '/statuses',
  },
  {
    label: 'Usuarios', roles: ['ADMIN'],
    path: '/users',
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const isActive = (path: string) => {
    if (path === location.pathname) return true;
    if (!path.endsWith('/new') && path.split('/').length === 2) {
      const p = location.pathname.split('/');
      if (p.length === 4 && p[3] === 'edit' && p[1] === path.split('/')[1]) return true;
    }
    return false;
  };

  const visibleGroups = NAV_GROUPS.filter(
    (g) => user && g.roles.includes(user.role),
  );

  const findActivePath = (groups: NavGroup[], prefix = ''): string | null => {
    for (const g of groups) {
      const path = prefix ? `${prefix}::${g.label}` : g.label;
      if (g.path && isActive(g.path)) return path;
      if (g.links?.some((l) => isActive(l.path))) return path;
      if (g.groups) {
        const nested = findActivePath(g.groups, path);
        if (nested) return nested;
      }
    }
    return null;
  };

  const [openGroup, setOpenGroup] = useState<string | null>(() => findActivePath(visibleGroups));
  const [lastPathname, setLastPathname] = useState(location.pathname);

  if (lastPathname !== location.pathname) {
    setLastPathname(location.pathname);
    setOpenGroup(findActivePath(visibleGroups));
  }

  const toggleGroup = (path: string) => {
    setOpenGroup((prev) => (prev === path ? null : path));
  };

  const isOpen = (path: string) => openGroup === path || openGroup?.startsWith(path + '::');

  const renderLinks = (links: NavLink[]) =>
    links.map((link) => (
      <button
        key={link.path}
        type="button"
        className={`bg-transparent border-none text-left px-6 py-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer w-full font-medium hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-gray-900 dark:hover:text-gray-100 transition-colors ${isActive(link.path) ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400 border-r-2 border-purple-500 dark:border-purple-400' : ''}`}
        onClick={() => {
          navigate(link.path);
        }}
      >
        {link.label}
      </button>
    ));

  const renderGroup = (group: NavGroup, path: string, depth = 0) => {
    if (group.path) {
      return (
        <div key={path} className="flex flex-col">
          <button
            type="button"
            className={`flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${depth > 0 ? 'pl-6 pr-4' : 'px-4'} py-2.5 cursor-pointer bg-transparent border-none text-left hover:text-gray-900 dark:hover:text-gray-100 transition-colors ${isActive(group.path) ? 'text-purple-500 dark:text-purple-400' : ''}`}
            onClick={() => navigate(group.path!)}
          >
            {group.label}
          </button>
        </div>
      );
    }

    const open = isOpen(path);
    const visibleSubs = group.groups?.filter((g) => user && g.roles.includes(user.role)) ?? [];
    return (
      <div key={path} className="flex flex-col">
        <button
          type="button"
          className={`flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${depth > 0 ? 'pl-6 pr-4' : 'px-4'} py-2.5 cursor-pointer bg-transparent border-none text-left hover:text-gray-900 dark:hover:text-gray-100 transition-colors`}
          onClick={() => toggleGroup(path)}
        >
          {group.label}
          <span className={`text-[0.6rem] transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>&#9656;</span>
        </button>
        <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-96' : 'max-h-0'}`}>
          {renderLinks(group.links ?? [])}
          {visibleSubs.map((sub) => renderGroup(sub, `${path}::${sub.label}`, depth + 1))}
        </div>
      </div>
    );
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-19 left-0 bottom-0 w-[220px] bg-chrome border-r border-border overflow-y-auto py-2 z-40 -translate-x-full transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : ''}`}>
        <nav className="flex flex-col gap-0.5">
          {visibleGroups.map((g) => renderGroup(g, g.label))}
        </nav>
      </aside>
    </>
  );
}
