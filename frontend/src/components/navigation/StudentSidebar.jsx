import { NavLink, Link } from 'react-router-dom';
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

  const firstName =
    user.first_name?.trim() || '';

  const lastName =
    user.last_name?.trim() || '';

  if (firstName && lastName) {
    return (
      `${firstName.charAt(0)}${lastName.charAt(0)}`
        .toUpperCase()
    );
  }

  if (firstName) {
    return firstName
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    user.email
      ?.substring(0, 2)
      .toUpperCase() || 'SU'
  );
}

function getDisplayName(user) {
  if (!user) {
    return 'Student User';
  }

  const fullName =
    `${user.first_name || ''} ${user.last_name || ''}`
      .trim();

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
  const {
    user,
    logout,
  } = useAuth();

  const navigation = [
    {
      label: 'Overview',
      icon: Home,
      path: '/student/dashboard',
    },
    {
      label: 'My Bookings',
      icon: CalendarCheck,
      path: '/student/bookings',
    },
    {
      label: 'Announcements',
      icon: Bell,
      path: '/student/announcements',
    },
    {
      label: 'Activity',
      icon: ClipboardList,
      path: '/student/activity',
    },
  ];

  const accountNavigation = [
    {
      label: 'Profile',
      icon: UserRound,
      path: '/student/profile',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/student/settings',
    },
  ];

  const handleLogout = async () => {
    await logout();
    onClose();
  };

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

        {/* User */}
        <div className="student-sidebar-user">

          <div
            className="student-avatar"
            aria-hidden="true"
          >
            {getInitials(user)}
          </div>

          <div className="student-user-info">

            <strong>
              {getDisplayName(user)}
            </strong>

            <span>
              {getRoleLabel(user?.role)}
            </span>

          </div>

        </div>

        {/* Navigation */}
        <nav className="student-sidebar-nav">

          <span className="student-nav-label">
            MAIN MENU
          </span>

          <div className="student-nav-list">

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `student-nav-link ${
                      isActive
                        ? 'active'
                        : ''
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

          <span className="student-nav-label student-account-label">
            ACCOUNT
          </span>

          <div className="student-nav-list">

            {accountNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `student-nav-link ${
                      isActive
                        ? 'active'
                        : ''
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

        {/* Bottom */}
        <div className="student-sidebar-bottom">

          <div className="student-sidebar-help">

            <span>
              Need assistance?
            </span>

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