import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Bell,
  CalendarCheck,
  ChevronLeft,
  ClipboardList,
  Home,
  LogOut,
  Monitor,
  Settings,
  UserRound,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

import './OfficerSidebar.css';

function getInitials(user) {
  if (!user) {
    return 'IO';
  }

  const firstName = user.first_name?.trim() || '';
  const lastName = user.last_name?.trim() || '';

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  }

  return user.email?.substring(0, 2).toUpperCase() || 'IO';
}

function getDisplayName(user) {
  if (!user) {
    return 'ICT Officer';
  }

  const fullName =
    `${user.first_name || ''} ${user.last_name || ''}`.trim();

  return (
    fullName ||
    user.name ||
    user.email ||
    'ICT Officer'
  );
}

function getRoleLabel(role) {
  switch (role) {
    case 'admin':
      return 'Administrator';

    case 'officer':
      return 'ICT Officer';

    default:
      return 'ICT Officer';
  }
}

function OfficerSidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      label: 'Dashboard',
      description: 'Officer overview',
      icon: Home,
      path: '/officer/dashboard',
    },
    {
      label: 'Booking Requests',
      description: 'Review facility requests',
      icon: CalendarCheck,
      path: '/officer/bookings',
    },
    {
      label: 'Facilities',
      description: 'Manage ICT facilities',
      icon: Monitor,
      path: '/officer/facilities',
    },
    {
      label: 'Announcements',
      description: 'Manage centre updates',
      icon: Bell,
      path: '/officer/announcements',
    },
    {
      label: 'Activity',
      description: 'View officer activity',
      icon: ClipboardList,
      path: '/officer/activity',
    },
  ];

  const accountNavigation = [
    {
      label: 'Profile',
      description: 'Manage your profile',
      icon: UserRound,
      path: '/officer/profile',
    },
    {
      label: 'Settings',
      description: 'Account preferences',
      icon: Settings,
      path: '/officer/settings',
    },
  ];

  const isItemActive = (path) => {
    if (path === '/officer/dashboard') {
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
          className={`officer-nav-link ${
            active ? 'active' : ''
          }`}
          aria-current={active ? 'page' : undefined}
          onClick={onClose}
        >
          <span className="officer-nav-icon">
            <Icon
              size={18}
              strokeWidth={active ? 2.2 : 1.9}
            />
          </span>

          <span className="officer-nav-content">
            <span className="officer-nav-text">
              {item.label}
            </span>

            <span className="officer-nav-description">
              {item.description}
            </span>
          </span>

          {active && (
            <span
              className="officer-nav-active-indicator"
              aria-hidden="true"
            />
          )}
        </NavLink>
      );
    });

  return (
    <>
      <div
        className={`officer-sidebar-overlay ${
          open ? 'is-visible' : ''
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`officer-sidebar ${
          open ? 'is-open' : ''
        }`}
        aria-label="ICT Officer navigation"
      >
        {/* Header */}
        <div className="officer-sidebar-header">
          <Link
            to="/"
            className="officer-sidebar-brand"
            onClick={onClose}
          >
            <span className="officer-brand-mark">
              <img
                src="/images/hero-ict.png"
                alt="Kiangini ICT Centre"
              />
            </span>

            <span className="officer-brand-text">
              <strong>Kiangini</strong>
              <small>ICT Centre</small>
            </span>
          </Link>

          <button
            type="button"
            className="officer-sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <ChevronLeft size={19} />
          </button>
        </div>

        {/* Officer profile */}
        <div className="officer-sidebar-user">
          <div
            className="officer-avatar"
            aria-hidden="true"
          >
            {getInitials(user)}
          </div>

          <div className="officer-user-info">
            <strong>{getDisplayName(user)}</strong>

            <span>
              <i aria-hidden="true" />
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="officer-sidebar-nav"
          aria-label="Officer sections"
        >
          <div className="officer-nav-section">
            <span className="officer-nav-label">
              MAIN MENU
            </span>

            <div className="officer-nav-list">
              {renderNavigation(navigation)}
            </div>
          </div>

          <div className="officer-nav-section officer-account-section">
            <span className="officer-nav-label">
              ACCOUNT
            </span>

            <div className="officer-nav-list">
              {renderNavigation(accountNavigation)}
            </div>
          </div>
        </nav>

        {/* Bottom */}
        <div className="officer-sidebar-bottom">
          <div className="officer-sidebar-help">
            <div className="officer-help-heading">
              <span className="officer-help-dot" />

              <span>
                ICT Centre Administration
              </span>
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
            className="officer-logout"
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

export default OfficerSidebar;