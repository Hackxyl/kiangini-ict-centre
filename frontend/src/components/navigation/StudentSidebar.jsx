import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Bell,
  CalendarCheck,
  ChevronLeft,
  ClipboardList,
  Home,
  LogOut,
  Settings,
  UserRound,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

import './StudentSidebar.css';

function getInitials(user) {
  if (!user) {
    return 'SU';
  }

  const firstName = user.first_name?.trim() || '';
  const lastName = user.last_name?.trim() || '';

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  }

  return user.email?.substring(0, 2).toUpperCase() || 'SU';
}

function getDisplayName(user) {
  if (!user) {
    return 'Student User';
  }

  const fullName =
    `${user.first_name || ''} ${user.last_name || ''}`.trim();

  return (
    fullName ||
    user.name ||
    user.email ||
    'Student User'
  );
}

function getRoleLabel(role) {
  switch (role) {
    case 'admin':
      return 'Administrator';

    case 'officer':
      return 'ICT Officer';

    case 'student':
    default:
      return 'Student';
  }
}

function StudentSidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      label: 'Dashboard',
      description: 'Your student overview',
      icon: Home,
      path: '/student/dashboard',
    },
    {
      label: 'My Bookings',
      description: 'View and manage bookings',
      icon: CalendarCheck,
      path: '/student/bookings',
    },
    {
      label: 'Announcements',
      description: 'Latest ICT Centre updates',
      icon: Bell,
      path: '/student/announcements',
    },
    {
      label: 'Activity',
      description: 'View your recent activity',
      icon: ClipboardList,
      path: '/student/activity',
    },
  ];

  const accountNavigation = [
    {
      label: 'Profile',
      description: 'Manage your profile',
      icon: UserRound,
      path: '/student/profile',
    },
    {
      label: 'Settings',
      description: 'Manage account settings',
      icon: Settings,
      path: '/student/settings',
    },
  ];

  const isItemActive = (path) => {
    if (path === '/student/dashboard') {
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
          className={`student-nav-link ${
            active ? 'active' : ''
          }`}
          aria-current={active ? 'page' : undefined}
          onClick={onClose}
        >
          <span className="student-nav-icon">
            <Icon
              size={18}
              strokeWidth={active ? 2.2 : 1.9}
            />
          </span>

          <span className="student-nav-content">
            <span className="student-nav-text">
              {item.label}
            </span>

            <span className="student-nav-description">
              {item.description}
            </span>
          </span>

          {active && (
            <span
              className="student-nav-active-indicator"
              aria-hidden="true"
            />
          )}
        </NavLink>
      );
    });

  return (
    <>
      <div
        className={`student-sidebar-overlay ${
          open ? 'is-visible' : ''
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`student-sidebar ${
          open ? 'is-open' : ''
        }`}
        aria-label="Student navigation"
      >
        {/* Header */}
        <div className="student-sidebar-header">
          <Link
            to="/"
            className="student-sidebar-brand"
            onClick={onClose}
          >
            <span className="student-brand-mark">
              <img
                src="/images/hero-ict.png"
                alt="Kiangini ICT Centre"
              />
            </span>

            <span className="student-brand-text">
              <strong>Kiangini</strong>
              <small>ICT Centre</small>
            </span>
          </Link>

          <button
            type="button"
            className="student-sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <ChevronLeft size={19} />
          </button>
        </div>

        {/* Student profile */}
        <div className="student-sidebar-user">
          <div
            className="student-avatar"
            aria-hidden="true"
          >
            {getInitials(user)}
          </div>

          <div className="student-user-info">
            <strong>{getDisplayName(user)}</strong>

            <span>
              <i aria-hidden="true" />
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="student-sidebar-nav"
          aria-label="Student sections"
        >
          <div className="student-nav-section">
            <span className="student-nav-label">
              MAIN MENU
            </span>

            <div className="student-nav-list">
              {renderNavigation(navigation)}
            </div>
          </div>

          <div className="student-nav-section student-account-section">
            <span className="student-nav-label">
              ACCOUNT
            </span>

            <div className="student-nav-list">
              {renderNavigation(accountNavigation)}
            </div>
          </div>
        </nav>

        {/* Bottom */}
        <div className="student-sidebar-bottom">
          <div className="student-sidebar-help">
            <div className="student-help-heading">
              <span className="student-help-dot" />

              <span>Need assistance?</span>
            </div>

            <Link
              to="/contact"
              onClick={onClose}
            >
              Contact ICT Support
            </Link>
          </div>

          <button
            type="button"
            className="student-logout"
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

export default StudentSidebar;