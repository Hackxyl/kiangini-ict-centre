import { Link, NavLink, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const navigation = [
    {
      label: 'Dashboard',
      description: 'System overview',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      label: 'Users',
      description: 'Manage user accounts',
      icon: Users,
      path: '/admin/users',
    },
    {
      label: 'Bookings',
      description: 'Manage facility bookings',
      icon: CalendarCheck,
      path: '/admin/bookings',
    },
    {
      label: 'Facilities',
      description: 'Manage ICT facilities',
      icon: Monitor,
      path: '/admin/facilities',
    },
    {
      label: 'Announcements',
      description: 'Manage announcements',
      icon: Bell,
      path: '/admin/announcements',
    },
  ];

  const systemNavigation = [
    {
      label: 'Activity',
      description: 'System activity history',
      icon: Activity,
      path: '/admin/activity',
    },
    {
      label: 'Settings',
      description: 'Account and system settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  const isItemActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const renderNavigation = (items) =>
    items.map((item) => {
      const Icon = item.icon;
      const active = isItemActive(item.path);

      return (
        <NavLink
          key={item.path}
          to={item.path}
          title={item.description}
          className={`admin-nav-link ${
            active ? 'active' : ''
          }`}
          aria-current={active ? 'page' : undefined}
          onClick={onClose}
        >
          <span className="admin-nav-icon">
            <Icon size={18} strokeWidth={active ? 2.2 : 1.9} />
          </span>

          <span className="admin-nav-content">
            <span className="admin-nav-text">
              {item.label}
            </span>

            <span className="admin-nav-description">
              {item.description}
            </span>
          </span>

          {active && (
            <span
              className="admin-nav-active-indicator"
              aria-hidden="true"
            />
          )}
        </NavLink>
      );
    });

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
        {/* Header */}
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

        {/* Administrator */}
        <div className="admin-sidebar-user">
          <div
            className="admin-avatar"
            aria-hidden="true"
          >
            {getInitials(user)}
          </div>

          <div className="admin-user-info">
            <strong>{getDisplayName(user)}</strong>

            <span>
              <i aria-hidden="true" />
              Administrator
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="admin-sidebar-nav"
          aria-label="Admin sections"
        >
          <div className="admin-nav-section">
            <span className="admin-nav-label">
              MAIN MENU
            </span>

            <div className="admin-nav-list">
              {renderNavigation(navigation)}
            </div>
          </div>

          <div className="admin-nav-section admin-system-section">
            <span className="admin-nav-label">
              SYSTEM
            </span>

            <div className="admin-nav-list">
              {renderNavigation(systemNavigation)}
            </div>
          </div>
        </nav>

        {/* Bottom area */}
        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-help">
            <div className="admin-help-heading">
              <span className="admin-help-dot" />
              <span>System Administration</span>
            </div>

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