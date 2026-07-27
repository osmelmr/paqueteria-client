import { useState, useEffect } from 'react';
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
  {
    label: 'Test', roles: ['ADMIN', 'STOREKEEPER'],
    links: [
      { label: 'PackageCard', path: '/package-card-test' },
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

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of visibleGroups) {
      const hasActive = g.links.some((l) => isActive(l.path));
      if (hasActive) init[g.label] = true;
    }
    return init;
  });

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const g of visibleGroups) {
        const hasActive = g.links.some((l) => isActive(l.path));
        if (hasActive) next[g.label] = true;
      }
      return next;
    });
  }, [location.pathname, visibleGroups]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-14 left-0 bottom-0 w-[220px] bg-white dark:bg-[#16171d] border-r border-gray-200 dark:border-gray-700 overflow-y-auto py-2 z-30 max-md:-translate-x-full max-md:transition-transform max-md:duration-200 md:translate-x-0 ${sidebarOpen ? 'max-md:translate-x-0' : ''}`}>
        <nav className="flex flex-col gap-0.5">
          {visibleGroups.map((group) => {
            const isOpen = openGroups[group.label] ?? false;
            return (
              <div key={group.label} className="flex flex-col">
                <button
                  type="button"
                  className={`flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-4 py-2.5 cursor-pointer bg-transparent border-none text-left hover:text-gray-900 dark:hover:text-gray-100 transition-colors`}
                  onClick={() => toggleGroup(group.label)}
                >
                  {group.label}
                  <span className={`text-[0.6rem] transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>&#9656;</span>
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-50' : 'max-h-0'}`}>
                  {group.links.map((link) => (
                    <button
                      key={link.path}
                      type="button"
                      className={`bg-transparent border-none text-left px-6 py-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer w-full font-medium hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-gray-900 dark:hover:text-gray-100 transition-colors ${isActive(link.path) ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400 border-r-2 border-purple-500 dark:border-purple-400' : ''}`}
                      onClick={() => {
                        navigate(link.path);
                        setSidebarOpen(false);
                      }}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
