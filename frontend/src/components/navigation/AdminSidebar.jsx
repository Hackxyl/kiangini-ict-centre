import { Link, NavLink } from 'react-router-dom';
import {
  Activity,
  Bell,
  CalendarCheck,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Monitor,
  Settings,
  Users,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

import './AdminSidebar.css';

function getInitials(user) {
  if (!user) {
    return 'AD';
  }

  const firstName = user.first_name?.trim() || '';
  const lastName = user.last_name?.trim() || '';

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  }

  return user.email?.substring(0, 2).toUpperCase() || 'AD';
}

function getDisplayName(user) {
  if (!user) {
    return 'Administrator';
  }

  const fullName =
    `${user.first_name || ''} ${user.last_name || ''}`.trim();

  return (
    fullName ||
    user.name ||
    user.email ||
    'Administrator'
  );
}

function AdminSidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  const navigation = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      label: 'Users',
      icon: Users,
      path: '/admin/users',
    },
    {
      label: 'Booking Management',
      icon: CalendarCheck,
      path: '/admin/bookings',
    },
    {
      label: 'Facilities',
      icon: Monitor,
      path: '/admin/facilities',
    },
    {
      label: 'Announcements',
      icon: Bell,
      path: '/admin/announcements',
    },
  ];

  const systemNavigation = [
    {
      label: 'Activity',
      icon: Activity,
      path: '/admin/activity',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <>
      <div
        className={`admin-sidebar-overlay ${
          open ? 'is-visible' : ''
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`admin-sidebar ${
          open ? 'is-open' : ''
        }`}
        aria-label="Administration navigation"
      >
        <div className="admin-sidebar-header">
          <Link
            to="/"
            className="admin-sidebar-brand"
            onClick={onClose}
          >
            <span className="admin-brand-mark">
              <img
                src="/images/hero-ict.png"
                alt="Kiangini ICT Centre"
              />
            </span>

            <span className="admin-brand-text">
              <strong>Kiangini</strong>
              <small>Administration</small>
            </span>
          </Link>

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <ChevronLeft size={19} />
          </button>
        </div>

        <div className="admin-sidebar-user">
          <div
            className="admin-avatar"
            aria-hidden="true"
          >
            {getInitials(user)}
          </div>

          <div className="admin-user-info">
            <strong>
              {getDisplayName(user)}
            </strong>

            <span>Administrator</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <span className="admin-nav-label">
            MAIN MENU
          </span>

          <div className="admin-nav-list">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `admin-nav-link ${
                      isActive ? 'active' : ''
                    }`
                  }
                  onClick={onClose}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <span className="admin-nav-label admin-system-label">
            SYSTEM
          </span>

          <div className="admin-nav-list">
            {systemNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `admin-nav-link ${
                      isActive ? 'active' : ''
                    }`
                  }
                  onClick={onClose}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-help">
            <span>
              System Administration
            </span>

            <Link
              to="/contact"
              onClick={onClose}
            >
              Contact Support
            </Link>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;