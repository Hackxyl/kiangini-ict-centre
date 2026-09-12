import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import OfficerSidebar from '../components/navigation/OfficerSidebar';

import './OfficerLayout.css';

function OfficerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="officer-layout">
      <OfficerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="officer-content">
        <header className="officer-topbar">
          <button
            type="button"
            className="officer-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open officer navigation"
          >
            <Menu size={21} />
          </button>

          <div className="officer-topbar-title">
            <span>Officer Portal</span>
            <strong>Kiangini ICT Centre</strong>
          </div>
        </header>

        <main className="officer-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default OfficerLayout;