import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from '../components/navigation/StudentSidebar';
import './StudentLayout.css';

function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="student-layout">

      <StudentSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="student-content">

        <header className="student-topbar">

          <button
            type="button"
            className="student-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open student navigation"
          >
            <Menu size={21} />
          </button>

          <div className="student-topbar-title">
            <span>Student Portal</span>
            <strong>Kiangini ICT Centre</strong>
          </div>

        </header>

        <main className="student-main">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default StudentLayout;