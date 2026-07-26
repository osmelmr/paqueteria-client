import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';

export function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />
      <main className="app-layout__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
