import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import AdminSidebar from '../components/navigation/AdminSidebar';

import './AdminLayout.css';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-layout-main">
        <header className="admin-mobile-header">
          <button
            type="button"
            className="admin-mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open administration menu"
          >
            <Menu size={21} />
          </button>

          <div className="admin-mobile-title">
            <strong>Kiangini</strong>
            <span>Administration</span>
          </div>
        </header>

        <div className="admin-layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;