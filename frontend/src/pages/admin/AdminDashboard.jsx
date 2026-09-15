import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  ChevronRight,
  CircleCheck,
  Clock3,
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  UserRoundPlus,
  X,
  XCircle,
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';

import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

import './AdminDashboard.css';


function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [announcements, setAnnouncements] =
    useState([]);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState('');

  const [currentTime, setCurrentTime] =
    useState(new Date());


  /*
   * =====================================================
   * LIVE CLOCK
   * =====================================================
   */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  /*
   * =====================================================
   * LOAD ADMIN DATA
   * =====================================================
   *
   * The dashboard intentionally uses Promise.allSettled()
   * so one unavailable API does not break the entire
   * administration dashboard.
   */

  const loadDashboard = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const [
          usersResponse,
          bookingsResponse,
          facilitiesResponse,
          announcementsResponse,
          activitiesResponse,
        ] = await Promise.allSettled([
          api.get('/accounts/users/'),

          api.get('/bookings/management/'),

          api.get('/facilities/management/'),

          api.get('/announcements/'),

          api.get('/core/activities/?limit=10'),
        ]);


        /*
         * Users
         */

        if (
          usersResponse.status ===
          'fulfilled'
        ) {
          const data =
            usersResponse.value?.data;

          setUsers(
            Array.isArray(data)
              ? data
              : Array.isArray(
                  data?.results,
                )
                ? data.results
                : [],
          );
        }


        /*
         * Bookings
         */

        if (
          bookingsResponse.status ===
          'fulfilled'
        ) {
          const data =
            bookingsResponse.value?.data;

          setBookings(
            Array.isArray(data)
              ? data
              : Array.isArray(
                  data?.results,
                )
                ? data.results
                : [],
          );
        }


        /*
         * Facilities
         */

        if (
          facilitiesResponse.status ===
          'fulfilled'
        ) {
          const data =
            facilitiesResponse.value?.data;

          setFacilities(
            Array.isArray(data)
              ? data
              : Array.isArray(
                  data?.results,
                )
                ? data.results
                : [],
          );
        }


        /*
         * Announcements
         */

        if (
          announcementsResponse.status ===
          'fulfilled'
        ) {
          const data =
            announcementsResponse.value?.data;

          setAnnouncements(
            Array.isArray(data)
              ? data
              : Array.isArray(
                  data?.results,
                )
                ? data.results
                : [],
          );
        }


        /*
         * Activity
         */

        if (
          activitiesResponse.status ===
          'fulfilled'
        ) {
          const data =
            activitiesResponse.value?.data;

          setActivities(
            Array.isArray(data)
              ? data
              : Array.isArray(
                  data?.results,
                )
                ? data.results
                : [],
          );
        }


        const responses = [
          usersResponse,
          bookingsResponse,
          facilitiesResponse,
          announcementsResponse,
          activitiesResponse,
        ];

        const failedRequests =
          responses.filter(
            (response) =>
              response.status ===
              'rejected',
          );


        /*
         * Only display a full dashboard
         * error if every API failed.
         */

        if (
          failedRequests.length ===
          responses.length
        ) {
          throw new Error(
            'Unable to load administration data.',
          );
        }

        if (
          failedRequests.length > 0
        ) {
          console.warn(
            'Some administration dashboard requests failed.',
            failedRequests,
          );
        }
      } catch (requestError) {
        console.error(
          'Unable to load admin dashboard:',
          requestError,
        );

        setError(
          'Unable to load dashboard data. Please try again.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );


  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);


  /*
   * =====================================================
   * USER STATISTICS
   * =====================================================
   */

  const studentUsers = useMemo(
    () =>
      users.filter(
        (item) =>
          item.role ===
          'student',
      ),
    [users],
  );

  const officerUsers = useMemo(
    () =>
      users.filter(
        (item) =>
          item.role ===
          'officer',
      ),
    [users],
  );

  const adminUsers = useMemo(
    () =>
      users.filter(
        (item) =>
          item.role ===
          'admin',
      ),
    [users],
  );


  /*
   * =====================================================
   * BOOKING STATISTICS
   * =====================================================
   */

  const pendingBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status ===
          'pending',
      ),
    [bookings],
  );

  const approvedBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status ===
          'approved',
      ),
    [bookings],
  );

  const rejectedBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status ===
          'rejected',
      ),
    [bookings],
  );

  const cancelledBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status ===
          'cancelled',
      ),
    [bookings],
  );


  /*
   * =====================================================
   * FACILITY STATISTICS
   * =====================================================
   */

  const availableFacilities =
    useMemo(
      () =>
        facilities.filter(
          (facility) =>
            facility.status ===
              'available' &&
            facility.is_bookable !==
              false,
        ),
      [facilities],
    );

  const maintenanceFacilities =
    useMemo(
      () =>
        facilities.filter(
          (facility) =>
            facility.status ===
            'maintenance',
        ),
      [facilities],
    );

  const inactiveFacilities =
    useMemo(
      () =>
        facilities.filter(
          (facility) =>
            facility.status ===
            'inactive',
        ),
      [facilities],
    );


  /*
   * =====================================================
   * SYSTEM HEALTH
   * =====================================================
   */

  const successfulSystems = [
    users.length > 0 ||
      !loading,
    bookings.length > 0 ||
      !loading,
    facilities.length > 0 ||
      !loading,
    announcements.length > 0 ||
      !loading,
  ].filter(Boolean).length;


  /*
   * =====================================================
   * GREETING
   * =====================================================
   */

  const getGreeting = (date) => {
    const hour = date.getHours();

    if (hour < 5) {
      return 'Good night';
    }

    if (hour < 12) {
      return 'Good morning';
    }

    if (hour < 17) {
      return 'Good afternoon';
    }

    return 'Good evening';
  };


  const formattedDate =
    currentTime.toLocaleDateString(
      undefined,
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    );


  const formattedTime =
    currentTime.toLocaleTimeString(
      undefined,
      {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      },
    );


  /*
   * =====================================================
   * ACTIVITY DATE
   * =====================================================
   */

  const formatActivityDate = (
    date,
  ) => {
    if (!date) {
      return '';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      undefined,
      {
        day: 'numeric',
        month: 'short',
      },
    );
  };


  /*
   * =====================================================
   * ACTIVITY ICON
   * =====================================================
   */

  const getActivityIcon = (
    activity,
  ) => {
    switch (activity.type) {
      case 'booking':
        return CalendarCheck;

      case 'facility':
        return Building2;

      case 'announcement':
        return Megaphone;

      case 'user':
        return Users;

      default:
        return Activity;
    }
  };


  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  const handleLogout = async () => {
    setMobileMenuOpen(false);

    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };


  /*
   * =====================================================
   * CLOSE MOBILE MENU
   * =====================================================
   */

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };


  return (
    <div className="admin-dashboard">

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileMenuOpen && (
        <button
          type="button"
          className="admin-mobile-overlay"
          aria-label="Close administration menu"
          onClick={closeMobileMenu}
        />
      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`admin-sidebar ${
          mobileMenuOpen
            ? 'is-open'
            : ''
        }`}
      >

        <div className="admin-sidebar-top">

          <Link
            to="/"
            className="admin-brand"
            onClick={closeMobileMenu}
          >
            <span className="admin-brand-mark">
              K
            </span>

            <span className="admin-brand-text">
              <strong>
                Kiangini
              </strong>

              <small>
                Administration
              </small>
            </span>
          </Link>


          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>


          <div className="admin-sidebar-section">

            <span className="admin-sidebar-label">
              Administration
            </span>

            <nav className="admin-nav">

              <Link
                to="/admin/dashboard"
                className="admin-nav-item active"
                onClick={closeMobileMenu}
              >
                <LayoutDashboard
                  size={18}
                />

                <span>
                  Dashboard
                </span>
              </Link>


              <Link
                to="/admin/users"
                className="admin-nav-item"
                onClick={closeMobileMenu}
              >
                <Users size={18} />

                <span>
                  User Management
                </span>
              </Link>


              <Link
                to="/admin/bookings"
                className="admin-nav-item"
                onClick={closeMobileMenu}
              >
                <CalendarCheck
                  size={18}
                />

                <span>
                  Bookings
                </span>
              </Link>


              <Link
                to="/admin/facilities"
                className="admin-nav-item"
                onClick={closeMobileMenu}
              >
                <Building2
                  size={18}
                />

                <span>
                  Facilities
                </span>
              </Link>


              <Link
                to="/admin/announcements"
                className="admin-nav-item"
                onClick={closeMobileMenu}
              >
                <Megaphone
                  size={18}
                />

                <span>
                  Announcements
                </span>
              </Link>

            </nav>

          </div>


          <div className="admin-sidebar-section">

            <span className="admin-sidebar-label">
              System
            </span>

            <nav className="admin-nav">

              <Link
                to="/admin/activity"
                className="admin-nav-item"
                onClick={closeMobileMenu}
              >
                <Activity size={18} />

                <span>
                  Activity Log
                </span>
              </Link>


              <Link
                to="/admin/settings"
                className="admin-nav-item"
                onClick={closeMobileMenu}
              >
                <Settings size={18} />

                <span>
                  System Settings
                </span>
              </Link>

            </nav>

          </div>

        </div>


        <div className="admin-sidebar-bottom">

          <div className="admin-sidebar-security">
            <ShieldCheck
              size={17}
            />

            <div>
              <strong>
                Administrator
              </strong>

              <span>
                Privileged access
              </span>
            </div>
          </div>


          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />

            <span>
              Sign out
            </span>
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-main">

        {/* Top bar */}

        <header className="admin-topbar">

          <div className="admin-topbar-left">

            <button
              type="button"
              className="admin-menu-button"
              onClick={() =>
                setMobileMenuOpen(
                  true,
                )
              }
              aria-label="Open administration menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <span className="admin-topbar-label">
                Administration
              </span>

              <strong>
                Control Centre
              </strong>
            </div>

          </div>


          <div className="admin-topbar-right">

            <div className="admin-system-status">
              <span className="admin-status-dot" />

              <span>
                System operational
              </span>
            </div>


            <button
              type="button"
              className="admin-notification-button"
              aria-label="Notifications"
            >
              <Bell size={19} />

              {pendingBookings.length >
                0 && (
                <span className="admin-notification-badge">
                  {pendingBookings.length >
                  9
                    ? '9+'
                    : pendingBookings.length}
                </span>
              )}
            </button>


            <div className="admin-user-chip">

              <div className="admin-user-avatar">
                {(user?.first_name ||
                  user?.email ||
                  'A')
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {user?.first_name ||
                    'Administrator'}
                </strong>

                <span>
                  System Admin
                </span>
              </div>

            </div>

          </div>

        </header>


        <div className="admin-dashboard-container">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section className="admin-page-header">

            <div>

              <span className="admin-eyebrow">
                System Administration
              </span>

              <h1>
                {getGreeting(
                  currentTime,
                )}
                , Administrator.
              </h1>

              <div className="admin-live-time">
                <Clock3 size={14} />

                <span>
                  {formattedDate}
                </span>

                <span>
                  ·
                </span>

                <strong>
                  {formattedTime}
                </strong>
              </div>

              <p>
                Manage users, facilities,
                bookings, announcements and
                platform operations from one
                central administration centre.
              </p>

            </div>


            <button
              type="button"
              className="admin-refresh-button"
              onClick={() =>
                loadDashboard(true)
              }
              disabled={
                loading ||
                refreshing
              }
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? 'admin-refresh-spin'
                    : ''
                }
              />

              {refreshing
                ? 'Refreshing...'
                : 'Refresh'}
            </button>

          </section>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="admin-dashboard-error">

              <XCircle size={19} />

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  loadDashboard(true)
                }
              >
                Try again
              </button>

            </div>
          )}


          {/* =================================================
              PRIMARY STATISTICS
          ================================================= */}

          <section className="admin-stat-grid">

            <div className="admin-stat-card blue">

              <div className="admin-stat-icon">
                <Users size={21} />
              </div>

              <div className="admin-stat-content">
                <span>
                  Total Users
                </span>

                <strong>
                  {loading
                    ? '—'
                    : users.length}
                </strong>

                <small>
                  All registered accounts
                </small>
              </div>

              <Link
                to="/admin/users"
                className="admin-stat-arrow"
              >
                <ChevronRight
                  size={17}
                />
              </Link>

            </div>


            <div className="admin-stat-card indigo">

              <div className="admin-stat-icon">
                <CalendarCheck
                  size={21}
                />
              </div>

              <div className="admin-stat-content">
                <span>
                  Total Bookings
                </span>

                <strong>
                  {loading
                    ? '—'
                    : bookings.length}
                </strong>

                <small>
                  Platform booking requests
                </small>
              </div>

              <Link
                to="/admin/bookings"
                className="admin-stat-arrow"
              >
                <ChevronRight
                  size={17}
                />
              </Link>

            </div>


            <div className="admin-stat-card cyan">

              <div className="admin-stat-icon">
                <Building2 size={21} />
              </div>

              <div className="admin-stat-content">
                <span>
                  Facilities
                </span>

                <strong>
                  {loading
                    ? '—'
                    : facilities.length}
                </strong>

                <small>
                  ICT Centre facilities
                </small>
              </div>

              <Link
                to="/admin/facilities"
                className="admin-stat-arrow"
              >
                <ChevronRight
                  size={17}
                />
              </Link>

            </div>


            <div className="admin-stat-card violet">

              <div className="admin-stat-icon">
                <Megaphone
                  size={21}
                />
              </div>

              <div className="admin-stat-content">
                <span>
                  Announcements
                </span>

                <strong>
                  {loading
                    ? '—'
                    : announcements.length}
                </strong>

                <small>
                  Published platform updates
                </small>
              </div>

              <Link
                to="/admin/announcements"
                className="admin-stat-arrow"
              >
                <ChevronRight
                  size={17}
                />
              </Link>

            </div>

          </section>


          {/* =================================================
              USER / BOOKING SNAPSHOT
          ================================================= */}

          <section className="admin-overview-grid">

            {/* User overview */}

            <div className="admin-panel">

              <div className="admin-panel-header">

                <div>
                  <span className="admin-eyebrow">
                    Accounts
                  </span>

                  <h2>
                    User Overview
                  </h2>

                  <p>
                    Distribution of registered
                    platform accounts.
                  </p>
                </div>

                <Link
                  to="/admin/users"
                  className="admin-panel-link"
                >
                  Manage users
                  <ChevronRight size={15} />
                </Link>

              </div>


              <div className="admin-user-overview">

                <div className="admin-user-total">

                  <div className="admin-user-total-icon">
                    <Users size={21} />
                  </div>

                  <div>
                    <span>
                      Registered users
                    </span>

                    <strong>
                      {loading
                        ? '—'
                        : users.length}
                    </strong>
                  </div>

                </div>


                <div className="admin-role-list">

                  <div className="admin-role-item">

                    <span className="admin-role-icon student">
                      <Users size={15} />
                    </span>

                    <span>
                      Students
                    </span>

                    <strong>
                      {loading
                        ? '—'
                        : studentUsers.length}
                    </strong>

                  </div>


                  <div className="admin-role-item">

                    <span className="admin-role-icon officer">
                      <UserCog size={15} />
                    </span>

                    <span>
                      Officers
                    </span>

                    <strong>
                      {loading
                        ? '—'
                        : officerUsers.length}
                    </strong>

                  </div>


                  <div className="admin-role-item">

                    <span className="admin-role-icon admin">
                      <ShieldCheck
                        size={15}
                      />
                    </span>

                    <span>
                      Administrators
                    </span>

                    <strong>
                      {loading
                        ? '—'
                        : adminUsers.length}
                    </strong>

                  </div>

                </div>

              </div>

            </div>


            {/* Booking overview */}

            <div className="admin-panel">

              <div className="admin-panel-header">

                <div>
                  <span className="admin-eyebrow">
                    Operations
                  </span>

                  <h2>
                    Booking Overview
                  </h2>

                  <p>
                    Current platform booking
                    distribution.
                  </p>
                </div>

                <Link
                  to="/admin/bookings"
                  className="admin-panel-link"
                >
                  View bookings
                  <ChevronRight size={15} />
                </Link>

              </div>


              <div className="admin-booking-overview">

                <div className="admin-booking-row">

                  <div>
                    <span className="admin-booking-status pending">
                      <Clock3 size={14} />
                    </span>

                    <span>
                      Pending
                    </span>
                  </div>

                  <strong>
                    {loading
                      ? '—'
                      : pendingBookings.length}
                  </strong>

                </div>


                <div className="admin-booking-row">

                  <div>
                    <span className="admin-booking-status approved">
                      <CircleCheck
                        size={14}
                      />
                    </span>

                    <span>
                      Approved
                    </span>
                  </div>

                  <strong>
                    {loading
                      ? '—'
                      : approvedBookings.length}
                  </strong>

                </div>


                <div className="admin-booking-row">

                  <div>
                    <span className="admin-booking-status rejected">
                      <XCircle size={14} />
                    </span>

                    <span>
                      Rejected
                    </span>
                  </div>

                  <strong>
                    {loading
                      ? '—'
                      : rejectedBookings.length}
                  </strong>

                </div>


                <div className="admin-booking-row">

                  <div>
                    <span className="admin-booking-status cancelled">
                      <AlertTriangle
                        size={14}
                      />
                    </span>

                    <span>
                      Cancelled
                    </span>
                  </div>

                  <strong>
                    {loading
                      ? '—'
                      : cancelledBookings.length}
                  </strong>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              QUICK ADMINISTRATION
          ================================================= */}

          <section className="admin-panel admin-quick-panel">

            <div className="admin-panel-header">

              <div>
                <span className="admin-eyebrow">
                  Administration
                </span>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Common system management
                  operations.
                </p>
              </div>

            </div>


            <div className="admin-quick-grid">

              <Link
                to="/admin/users"
                className="admin-quick-action users"
              >
                <div className="admin-quick-icon">
                  <Users size={20} />
                </div>

                <div>
                  <strong>
                    Manage users
                  </strong>

                  <span>
                    Accounts, roles and
                    permissions
                  </span>
                </div>

                <ChevronRight size={17} />

              </Link>


              <Link
                to="/admin/users/create"
                className="admin-quick-action create"
              >
                <div className="admin-quick-icon">
                  <UserRoundPlus
                    size={20}
                  />
                </div>

                <div>
                  <strong>
                    Add user
                  </strong>

                  <span>
                    Create a platform account
                  </span>
                </div>

                <ChevronRight size={17} />

              </Link>


              <Link
                to="/admin/facilities"
                className="admin-quick-action facilities"
              >
                <div className="admin-quick-icon">
                  <Building2 size={20} />
                </div>

                <div>
                  <strong>
                    Manage facilities
                  </strong>

                  <span>
                    Availability and resources
                  </span>
                </div>

                <ChevronRight size={17} />

              </Link>


              <Link
                to="/admin/bookings"
                className="admin-quick-action bookings"
              >
                <div className="admin-quick-icon">
                  <CalendarCheck
                    size={20}
                  />
                </div>

                <div>
                  <strong>
                    Booking oversight
                  </strong>

                  <span>
                    Monitor all reservations
                  </span>
                </div>

                <ChevronRight size={17} />

              </Link>


              <Link
                to="/admin/announcements"
                className="admin-quick-action announcements"
              >
                <div className="admin-quick-icon">
                  <Megaphone size={20} />
                </div>

                <div>
                  <strong>
                    Announcements
                  </strong>

                  <span>
                    Manage platform communication
                  </span>
                </div>

                <ChevronRight size={17} />

              </Link>


              <Link
                to="/admin/activity"
                className="admin-quick-action activity"
              >
                <div className="admin-quick-icon">
                  <Activity size={20} />
                </div>

                <div>
                  <strong>
                    Activity log
                  </strong>

                  <span>
                    Review system actions
                  </span>
                </div>

                <ChevronRight size={17} />

              </Link>

            </div>

          </section>


          {/* =================================================
              FACILITY + SYSTEM HEALTH
          ================================================= */}

          <section className="admin-lower-grid">

            {/* Facility status */}

            <div className="admin-panel">

              <div className="admin-panel-header">

                <div>
                  <span className="admin-eyebrow">
                    Infrastructure
                  </span>

                  <h2>
                    Facility Status
                  </h2>

                  <p>
                    Current ICT Centre resource
                    availability.
                  </p>
                </div>

                <Link
                  to="/admin/facilities"
                  className="admin-panel-link"
                >
                  Manage
                  <ChevronRight size={15} />
                </Link>

              </div>


              <div className="admin-facility-grid">

                <div className="admin-facility-card available">

                  <CircleCheck size={20} />

                  <span>
                    Available
                  </span>

                  <strong>
                    {loading
                      ? '—'
                      : availableFacilities.length}
                  </strong>

                </div>


                <div className="admin-facility-card maintenance">

                  <AlertTriangle
                    size={20}
                  />

                  <span>
                    Maintenance
                  </span>

                  <strong>
                    {loading
                      ? '—'
                      : maintenanceFacilities.length}
                  </strong>

                </div>


                <div className="admin-facility-card inactive">

                  <XCircle size={20} />

                  <span>
                    Inactive
                  </span>

                  <strong>
                    {loading
                      ? '—'
                      : inactiveFacilities.length}
                  </strong>

                </div>

              </div>

            </div>


            {/* System health */}

            <div className="admin-panel">

              <div className="admin-panel-header">

                <div>
                  <span className="admin-eyebrow">
                    Platform
                  </span>

                  <h2>
                    System Health
                  </h2>

                  <p>
                    Core platform service
                    availability.
                  </p>
                </div>

                <div className="admin-health-badge">
                  <span />
                  Operational
                </div>

              </div>


              <div className="admin-health-list">

                <div className="admin-health-item">

                  <div className="admin-health-icon database">
                    <Database size={17} />
                  </div>

                  <div>
                    <strong>
                      Database
                    </strong>

                    <span>
                      PostgreSQL service
                    </span>
                  </div>

                  <CircleCheck
                    size={18}
                    className="admin-health-success"
                  />

                </div>


                <div className="admin-health-item">

                  <div className="admin-health-icon api">
                    <ShieldCheck
                      size={17}
                    />
                  </div>

                  <div>
                    <strong>
                      API
                    </strong>

                    <span>
                      Backend service
                    </span>
                  </div>

                  <CircleCheck
                    size={18}
                    className="admin-health-success"
                  />

                </div>


                <div className="admin-health-item">

                  <div className="admin-health-icon activity">
                    <Activity size={17} />
                  </div>

                  <div>
                    <strong>
                      Activity logging
                    </strong>

                    <span>
                      System monitoring
                    </span>
                  </div>

                  <CircleCheck
                    size={18}
                    className="admin-health-success"
                  />

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              RECENT ACTIVITY
          ================================================= */}

          <section className="admin-panel admin-activity-panel">

            <div className="admin-panel-header">

              <div>
                <span className="admin-eyebrow">
                  Monitoring
                </span>

                <h2>
                  Recent System Activity
                </h2>

                <p>
                  Latest actions recorded
                  across the Kiangini platform.
                </p>
              </div>

              <Link
                to="/admin/activity"
                className="admin-panel-link"
              >
                View activity
                <ChevronRight size={15} />
              </Link>

            </div>


            {loading ? (
              <div className="admin-panel-state">
                Loading activity...
              </div>
            ) : activities.length ===
              0 ? (
              <div className="admin-panel-state admin-empty-state">

                <Activity size={25} />

                <strong>
                  No recent activity
                </strong>

                <span>
                  System actions will appear
                  here as they occur.
                </span>

              </div>
            ) : (
              <div className="admin-activity-list">

                {activities
                  .slice(0, 8)
                  .map(
                    (activity) => {
                      const ActivityIcon =
                        getActivityIcon(
                          activity,
                        );

                      return (
                        <div
                          key={
                            activity.id
                          }
                          className="admin-activity-item"
                        >

                          <div
                            className={`admin-activity-icon ${
                              activity.type ||
                              'system'
                            }`}
                          >
                            <ActivityIcon
                              size={17}
                            />
                          </div>


                          <div className="admin-activity-content">

                            <strong>
                              {activity.title ||
                                activity.action_display ||
                                'System activity'}
                            </strong>

                            <span>
                              {activity.description ||
                                activity.object_name ||
                                'Activity recorded in the system.'}
                            </span>

                          </div>


                          <time>
                            {formatActivityDate(
                              activity.created_at,
                            )}
                          </time>

                        </div>
                      );
                    },
                  )}

              </div>
            )}

          </section>


          {/* =================================================
              ADMIN SECURITY FOOTER
          ================================================= */}

          <section className="admin-security-banner">

            <div className="admin-security-banner-icon">
              <ShieldCheck size={21} />
            </div>

            <div>

              <span className="admin-eyebrow">
                Administrative access
              </span>

              <h2>
                Protected system controls
              </h2>

              <p>
                Administrative actions can affect
                users, facilities, bookings and
                platform data. Review changes
                carefully before saving.
              </p>

            </div>

            <Link
              to="/admin/settings"
              className="admin-security-link"
            >
              Security settings
              <ChevronRight size={16} />
            </Link>

          </section>


          {/* Footer */}

          <footer className="admin-dashboard-footer">
            <span>
              © 2026 Kiangini ICT Centre
            </span>

            <span>
              Administration Portal
            </span>

            <span>
              {successfulSystems}/4 core
              services available
            </span>
          </footer>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;