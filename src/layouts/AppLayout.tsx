import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { useUIStore } from '../store/ui.store';

export function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Sidebar />
      <main className={`flex-1 pt-24 px-5 pb-5 max-w-full overflow-x-auto bg-canvas transition-[margin] duration-200 ${sidebarOpen ? 'md:ml-[220px]' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
