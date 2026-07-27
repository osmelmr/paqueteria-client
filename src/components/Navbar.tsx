import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useUIStore } from '../store/ui.store';
import { useThemeStore } from '../store/theme.store';
import { 
  Menu, 
  Sun, 
  Moon, 
  LogOut, 
  Package, 
  Truck, 
  FilePlus2, 
  User as UserIcon 
} from 'lucide-react';

export function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <header className="fixed top-0 left-0 right-0 flex items-center justify-between h-[76px] px-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 transition-colors">
      
      {/* Sección Izquierda: Menú móvil y Título/Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex md:hidden items-center justify-center w-10 h-10 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20 transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0 tracking-tight">
            Paquetería
          </h1>
        </div>
      </div>

      {/* Sección Central: Acciones Rápidas (Recepción y Add Manifiesto) */}
      <div className="hidden sm:flex items-center gap-2.5">
        <button
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-800/60 transition-all shadow-sm"
          onClick={() => navigate('/update-status-bulk')}
        >
          <Truck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          Recepción
        </button>
        
        <button
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-800/60 transition-all shadow-sm"
          onClick={() => navigate('/ai-extract')}
        >
          <FilePlus2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          Add Manifiesto
        </button>
      </div>

      {/* Sección Derecha: Tema, Usuario y Salir */}
      <div className="flex items-center gap-3">
        
        {/* Botón de Tema Mejorado con Lucide Icons */}
        <button
          type="button"
          className="relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-all"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700 transition-transform hover:scale-110" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:scale-110" />
          )}
        </button>

        {/* Separador vertical sutil */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Información del Usuario */}
        <div className="hidden md:flex items-center gap-2.5 pl-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {user?.username || 'Usuario'}
            </span>
            <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              {user?.role || 'Rol'}
            </span>
          </div>
        </div>

        {/* Botón Salir */}
        <button 
          type="button" 
          className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all shadow-sm"
          onClick={logout}
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>

      </div>
    </header>
  );
}