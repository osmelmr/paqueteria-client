import { useUIStore } from '../store/ui.store';

export function Footer() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <footer className={`flex items-center justify-center h-10 text-sm text-gray-500 dark:text-gray-400 border-t border-border bg-chrome transition-[margin] duration-200 ${sidebarOpen ? 'md:ml-[220px]' : ''}`}>
      <span>Paqueteria &copy; {new Date().getFullYear()}</span>
    </footer>
  );
}
