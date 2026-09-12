import { Link, NavLink } from 'react-router-dom';
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
  const {
    user,
    logout,
  } = useAuth();

  const navigation = [
    {
      label: 'Overview',
      icon: Home,
      path: '/officer/dashboard',
    },
    {
      label: 'Booking Requests',
      icon: CalendarCheck,
      path: '/officer/bookings',
    },
    {
      label: 'Facilities',
      icon: Monitor,
      path: '/officer/facilities',
    },
    {
      label: 'Announcements',
      icon: Bell,
      path: '/officer/announcements',
    },
    {
      label: 'Activity',
      icon: ClipboardList,
      path: '/officer/activity',
    },
  ];

  const accountNavigation = [
    {
      label: 'Profile',
      icon: UserRound,
      path: '/officer/profile',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/officer/settings',
    },
  ];

  const handleLogout = async () => {
    await logout();
    onClose();
  };

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
        aria-label="Officer navigation"
      >
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

        <div className="officer-sidebar-user">
          <div
            className="officer-avatar"
            aria-hidden="true"
          >
            {getInitials(user)}
          </div>

          <div className="officer-user-info">
            <strong>
              {getDisplayName(user)}
            </strong>

            <span>
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>

        <nav className="officer-sidebar-nav">
          <span className="officer-nav-label">
            MAIN MENU
          </span>

          <div className="officer-nav-list">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `officer-nav-link ${
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

          <span className="officer-nav-label officer-account-label">
            ACCOUNT
          </span>

          <div className="officer-nav-list">
            {accountNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `officer-nav-link ${
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

        <div className="officer-sidebar-bottom">
          <div className="officer-sidebar-help">
            <span>
              ICT Centre Administration
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