import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Sidebar />
      <main className="flex-1 md:ml-[220px] pt-24 px-5 pb-5 max-w-full overflow-x-auto bg-slate-50 dark:bg-slate-950">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
