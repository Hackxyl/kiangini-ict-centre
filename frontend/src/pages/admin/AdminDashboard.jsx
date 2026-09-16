import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  Gauge,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  UserCog,
  Users,
  UserPlus,
  Wifi,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

import './AdminDashboard.css';

const REFRESH_INTERVAL = 30000;

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';

  return 'Good evening';
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

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(
    value || 0,
  );
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function formatActivityDate(value) {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return `${formatDate(date)} · ${formatTime(date)}`;
}

function extractResults(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function normalizeStatus(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function getActivityIcon(action = '') {
  const value = action.toLowerCase();

  if (
    value.includes('user') ||
    value.includes('student') ||
    value.includes('officer')
  ) {
    return UserCog;
  }

  if (
    value.includes('booking') ||
    value.includes('reservation')
  ) {
    return CalendarCheck;
  }

  if (
    value.includes('facility') ||
    value.includes('equipment')
  ) {
    return Building2;
  }

  if (
    value.includes('announcement') ||
    value.includes('notification')
  ) {
    return Bell;
  }

  if (
    value.includes('security') ||
    value.includes('permission')
  ) {
    return ShieldCheck;
  }

  return Activity;
}

function getActivityTitle(activity) {
  return (
    activity?.title ||
    activity?.action_display ||
    activity?.action ||
    activity?.description ||
    activity?.message ||
    'System activity'
  );
}

function getActivityUser(activity) {
  return (
    activity?.user_name ||
    activity?.user?.name ||
    activity?.user?.email ||
    activity?.performed_by ||
    'System'
  );
}

function getBookingStatus(booking) {
  return normalizeStatus(
    booking?.status ||
      booking?.booking_status ||
      booking?.state,
  );
}

function getFacilityStatus(facility) {
  return normalizeStatus(
    facility?.status ||
      facility?.condition ||
      facility?.availability ||
      facility?.state,
  );
}

/*
 * =========================================================
 * ADMIN DASHBOARD
 * =========================================================
 */

function AdminDashboard() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [currentTime, setCurrentTime] = useState(
    new Date(),
  );

  const [lastUpdated, setLastUpdated] = useState(null);

  const [health, setHealth] = useState({
    api: 'checking',
    database: 'checking',
    authentication: 'checking',
    application: 'checking',
  });

  /*
   * =========================================================
   * LOAD DASHBOARD DATA
   * =========================================================
   */

  const loadDashboard = useCallback(
    async (manualRefresh = false) => {
      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const requests = await Promise.allSettled([
        api.get('/auth/users/'),
        api.get('/bookings/management/'),
        api.get('/facilities/management/'),
        api.get('/announcements/'),

        // Administrator system-wide activity
        api.get(
          '/core/admin/activities/?limit=10',
        ),

        // Core API health
        api.get('/core/health/'),
      ]);

      const [
        usersResponse,
        bookingsResponse,
        facilitiesResponse,
        announcementsResponse,
        activitiesResponse,
        healthResponse,
      ] = requests;

      let failedRequests = 0;

      /*
       * USERS
       */

      if (usersResponse.status === 'fulfilled') {
        setUsers(
          extractResults(
            usersResponse.value.data,
          ),
        );
      } else {
        failedRequests += 1;
      }

      /*
       * BOOKINGS
       */

      if (bookingsResponse.status === 'fulfilled') {
        setBookings(
          extractResults(
            bookingsResponse.value.data,
          ),
        );
      } else {
        failedRequests += 1;
      }

      /*
       * FACILITIES
       */

      if (facilitiesResponse.status === 'fulfilled') {
        setFacilities(
          extractResults(
            facilitiesResponse.value.data,
          ),
        );
      } else {
        failedRequests += 1;
      }

      /*
       * ANNOUNCEMENTS
       */

      if (
        announcementsResponse.status ===
        'fulfilled'
      ) {
        setAnnouncements(
          extractResults(
            announcementsResponse.value.data,
          ),
        );
      } else {
        failedRequests += 1;
      }

      /*
       * SYSTEM ACTIVITY
       */

      if (
        activitiesResponse.status ===
        'fulfilled'
      ) {
        setActivities(
          extractResults(
            activitiesResponse.value.data,
          ),
        );
      } else {
        failedRequests += 1;
      }

      /*
       * HEALTH
       *
       * Supports both:
       *
       * "healthy"
       *
       * and the current endpoint:
       *
       * "ok"
       */

      if (
        healthResponse.status ===
        'fulfilled'
      ) {
        const healthData =
          healthResponse.value.data || {};

        const apiHealthy =
          healthData.api === 'healthy' ||
          healthData.api === 'ok' ||
          healthData.status === 'healthy' ||
          healthData.status === 'ok';

        const databaseHealthy =
          healthData.database === 'healthy' ||
          healthData.database === 'ok';

        const authenticationHealthy =
          healthData.authentication ===
            'healthy' ||
          healthData.authentication === 'ok';

        const applicationHealthy =
          healthData.application ===
            'healthy' ||
          healthData.application === 'ok' ||
          healthData.status === 'healthy' ||
          healthData.status === 'ok';

        setHealth({
          api: apiHealthy
            ? 'healthy'
            : 'warning',

          database: databaseHealthy
            ? 'healthy'
            : 'warning',

          authentication:
            authenticationHealthy
              ? 'healthy'
              : 'warning',

          application:
            applicationHealthy
              ? 'healthy'
              : 'warning',
        });
      } else {
        /*
         * The API itself responded to the other
         * requests, therefore the API is reachable
         * even if /core/health/ is unavailable.
         */

        const apiReachable =
          usersResponse.status ===
            'fulfilled' ||
          bookingsResponse.status ===
            'fulfilled' ||
          facilitiesResponse.status ===
            'fulfilled';

        setHealth((previous) => ({
          ...previous,

          api: apiReachable
            ? 'healthy'
            : 'offline',

          application: 'warning',

          database: 'unknown',

          authentication: 'unknown',
        }));
      }

      if (failedRequests > 0) {
        setError(
          `${failedRequests} dashboard service${
            failedRequests === 1
              ? ''
              : 's'
          } could not be loaded.`,
        );
      }

      setLastUpdated(new Date());
      setLoading(false);
      setRefreshing(false);
    },
    [],
  );

  /*
   * =========================================================
   * INITIAL LOAD + AUTOMATIC REFRESH
   * =========================================================
   */

  useEffect(() => {
    loadDashboard();

    const interval =
      window.setInterval(() => {
        loadDashboard(true);
      }, REFRESH_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadDashboard]);

  /*
   * =========================================================
   * LIVE CLOCK
   * =========================================================
   */

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /*
   * =========================================================
   * USER ANALYTICS
   * =========================================================
   */

  const userStats = useMemo(() => {
    const students = users.filter(
      (item) =>
        normalizeStatus(item.role) ===
        'student',
    ).length;

    const officers = users.filter(
      (item) =>
        normalizeStatus(item.role) ===
        'officer',
    ).length;

    const admins = users.filter(
      (item) =>
        normalizeStatus(item.role) ===
        'admin',
    ).length;

    const active = users.filter(
      (item) => item.is_active !== false,
    ).length;

    return {
      total: users.length,
      students,
      officers,
      admins,
      active,
    };
  }, [users]);

  /*
   * =========================================================
   * BOOKING ANALYTICS
   * =========================================================
   */

  const bookingStats = useMemo(() => {
    const statuses = bookings.map(
      getBookingStatus,
    );

    const count = (values) =>
      statuses.filter((status) =>
        values.includes(status),
      ).length;

    return {
      total: bookings.length,

      pending: count([
        'pending',
        'requested',
        'submitted',
      ]),

      approved: count([
        'approved',
        'confirmed',
        'accepted',
      ]),

      rejected: count([
        'rejected',
        'declined',
      ]),

      cancelled: count([
        'cancelled',
        'canceled',
      ]),
    };
  }, [bookings]);

  const approvalPercentage = useMemo(() => {
    if (!bookingStats.total) {
      return 0;
    }

    return Math.round(
      (bookingStats.approved /
        bookingStats.total) *
        100,
    );
  }, [bookingStats]);

  /*
   * =========================================================
   * FACILITY ANALYTICS
   * =========================================================
   */

  const facilityStats = useMemo(() => {
    const availableStatuses = [
      'available',
      'active',
      'operational',
      'working',
    ];

    const maintenanceStatuses = [
      'maintenance',
      'under_maintenance',
      'repair',
    ];

    const inactiveStatuses = [
      'inactive',
      'unavailable',
      'disabled',
      'offline',
    ];

    const available =
      facilities.filter((facility) =>
        availableStatuses.includes(
          getFacilityStatus(facility),
        ),
      ).length;

    const maintenance =
      facilities.filter((facility) =>
        maintenanceStatuses.some((status) =>
          getFacilityStatus(
            facility,
          ).includes(status),
        ),
      ).length;

    const inactive =
      facilities.filter((facility) =>
        inactiveStatuses.includes(
          getFacilityStatus(facility),
        ),
      ).length;

    return {
      total: facilities.length,
      available,
      maintenance,
      inactive,
    };
  }, [facilities]);

  const facilityOperationalPercentage =
    useMemo(() => {
      if (!facilityStats.total) {
        return 0;
      }

      return Math.round(
        (facilityStats.available /
          facilityStats.total) *
          100,
      );
    }, [facilityStats]);

  /*
   * =========================================================
   * USER DISTRIBUTION
   * =========================================================
   */

  const roleDistribution = useMemo(() => {
    const total = userStats.total;

    if (!total) {
      return [
        {
          label: 'Students',
          value: 0,
          percentage: 0,
          className: 'student',
        },
        {
          label: 'ICT Officers',
          value: 0,
          percentage: 0,
          className: 'officer',
        },
        {
          label: 'Administrators',
          value: 0,
          percentage: 0,
          className: 'admin',
        },
      ];
    }

    return [
      {
        label: 'Students',
        value: userStats.students,
        percentage: Math.round(
          (userStats.students / total) *
            100,
        ),
        className: 'student',
      },
      {
        label: 'ICT Officers',
        value: userStats.officers,
        percentage: Math.round(
          (userStats.officers / total) *
            100,
        ),
        className: 'officer',
      },
      {
        label: 'Administrators',
        value: userStats.admins,
        percentage: Math.round(
          (userStats.admins / total) *
            100,
        ),
        className: 'admin',
      },
    ];
  }, [userStats]);

  /*
   * =========================================================
   * BOOKING DISTRIBUTION
   * =========================================================
   */

  const bookingDistribution = useMemo(() => {
    const total = bookingStats.total;

    if (!total) {
      return [
        {
          label: 'Approved',
          value: 0,
          percentage: 0,
          className: 'approved',
        },
        {
          label: 'Pending',
          value: 0,
          percentage: 0,
          className: 'pending',
        },
        {
          label: 'Rejected',
          value: 0,
          percentage: 0,
          className: 'rejected',
        },
        {
          label: 'Cancelled',
          value: 0,
          percentage: 0,
          className: 'cancelled',
        },
      ];
    }

    return [
      {
        label: 'Approved',
        value: bookingStats.approved,
        percentage: Math.round(
          (bookingStats.approved / total) *
            100,
        ),
        className: 'approved',
      },
      {
        label: 'Pending',
        value: bookingStats.pending,
        percentage: Math.round(
          (bookingStats.pending / total) *
            100,
        ),
        className: 'pending',
      },
      {
        label: 'Rejected',
        value: bookingStats.rejected,
        percentage: Math.round(
          (bookingStats.rejected / total) *
            100,
        ),
        className: 'rejected',
      },
      {
        label: 'Cancelled',
        value: bookingStats.cancelled,
        percentage: Math.round(
          (bookingStats.cancelled / total) *
            100,
        ),
        className: 'cancelled',
      },
    ];
  }, [bookingStats]);

  /*
   * =========================================================
   * ADMIN ACTION QUEUE
   * =========================================================
   */

  const pendingActions = useMemo(
    () => [
      {
        label: 'Pending booking requests',
        value: bookingStats.pending,
        icon: Clock3,
        className: 'warning',
        path: '/admin/bookings',
      },
      {
        label: 'Facilities under maintenance',
        value: facilityStats.maintenance,
        icon: Building2,
        className: 'danger',
        path: '/admin/facilities',
      },
      {
        label: 'Published announcements',
        value: announcements.length,
        icon: Bell,
        className: 'info',
        path: '/admin/announcements',
      },
    ],
    [
      bookingStats.pending,
      facilityStats.maintenance,
      announcements.length,
    ],
  );

  /*
   * =========================================================
   * SYSTEM HEALTH
   * =========================================================
   */

  const healthItems = useMemo(
    () => [
      {
        label: 'API Service',
        detail: 'Django REST API',
        icon: Wifi,
        status: health.api,
      },
      {
        label: 'Database',
        detail: 'PostgreSQL',
        icon: Database,
        status: health.database,
      },
      {
        label: 'Authentication',
        detail: 'JWT Security',
        icon: ShieldCheck,
        status: health.authentication,
      },
      {
        label: 'Application',
        detail: 'Kiangini ICT Centre',
        icon: Gauge,
        status: health.application,
      },
    ],
    [health],
  );

  function getHealthLabel(status) {
    switch (status) {
      case 'healthy':
        return 'Operational';

      case 'warning':
        return 'Attention';

      case 'offline':
        return 'Offline';

      case 'unknown':
        return 'Unknown';

      default:
        return 'Checking';
    }
  }

  function getHealthClass(status) {
    switch (status) {
      case 'healthy':
        return 'healthy';

      case 'offline':
        return 'danger';

      case 'warning':
        return 'warning';

      default:
        return 'checking';
    }
  }

  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard-container">

        {/* =====================================================
            COMMAND HEADER
        ====================================================== */}

        <header className="admin-command-header">

          <div className="admin-command-heading">

            <div className="admin-command-eyebrow">
              <span className="admin-command-dot" />
              ADMIN CONTROL CENTER
            </div>

            <h1>
              {getGreeting()},{' '}
              <span>
                {getDisplayName(user)}
              </span>
            </h1>

            <p>
              Monitor and control the entire
              Kiangini ICT Centre platform from
              one live administrative workspace.
            </p>

          </div>

          <div className="admin-command-actions">

            <div className="admin-command-date">

              <strong>
                {formatDate(currentTime)}
              </strong>

              <span>
                {formatTime(currentTime)}
                {' · '}
                Africa/Nairobi
              </span>

              {lastUpdated && (
                <small>
                  Updated {formatTime(lastUpdated)}
                </small>
              )}

            </div>

            <button
              type="button"
              className="admin-refresh-button"
              onClick={() =>
                loadDashboard(true)
              }
              disabled={refreshing}
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? 'admin-refresh-spinning'
                    : ''
                }
              />

              <span>
                {refreshing
                  ? 'Updating'
                  : 'Refresh'}
              </span>
            </button>

          </div>

        </header>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="admin-dashboard-alert warning">

            <AlertTriangle size={18} />

            <div>
              <strong>
                Partial dashboard update
              </strong>

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                loadDashboard(true)
              }
            >
              Retry
            </button>

          </div>
        )}

        {/* =====================================================
            SYSTEM HEALTH
        ====================================================== */}

        <section className="admin-system-status">

          <div className="admin-section-heading compact">

            <div>
              <span className="admin-section-kicker">
                SYSTEM STATUS
              </span>

              <h2>
                Live platform health
              </h2>
            </div>

            <span className="admin-live-status">
              <span />
              Auto-updating
            </span>

          </div>

          <div className="admin-health-grid">

            {healthItems.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  className="admin-health-card"
                  key={service.label}
                >

                  <div
                    className={`admin-health-icon ${getHealthClass(
                      service.status,
                    )}`}
                  >
                    <Icon size={19} />
                  </div>

                  <div className="admin-health-content">

                    <strong>
                      {service.label}
                    </strong>

                    <span>
                      {service.detail}
                    </span>

                  </div>

                  <div
                    className={`admin-health-status ${getHealthClass(
                      service.status,
                    )}`}
                  >
                    <span />

                    {getHealthLabel(
                      service.status,
                    )}
                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* =====================================================
            LIVE METRICS
        ====================================================== */}

        <section className="admin-metrics-grid">

          <article className="admin-metric-card users-card">

            <div className="admin-metric-top">

              <div className="admin-metric-icon">
                <Users size={20} />
              </div>

              <span className="admin-metric-badge positive">
                <CheckCircle2 size={13} />
                {formatNumber(
                  userStats.active,
                )}{' '}
                active
              </span>

            </div>

            <div className="admin-metric-value">
              {loading
                ? '—'
                : formatNumber(
                    userStats.total,
                  )}
            </div>

            <div className="admin-metric-label">
              Total users
            </div>

            <div className="admin-metric-footer">

              <span>
                {formatNumber(
                  userStats.students,
                )}{' '}
                students
              </span>

              <span>
                {formatNumber(
                  userStats.officers,
                )}{' '}
                officers
              </span>

            </div>

          </article>

          <article className="admin-metric-card booking-card">

            <div className="admin-metric-top">

              <div className="admin-metric-icon">
                <CalendarCheck size={20} />
              </div>

              <span className="admin-metric-badge warning">
                <Clock3 size={13} />
                {formatNumber(
                  bookingStats.pending,
                )}{' '}
                pending
              </span>

            </div>

            <div className="admin-metric-value">
              {loading
                ? '—'
                : formatNumber(
                    bookingStats.total,
                  )}
            </div>

            <div className="admin-metric-label">
              Total bookings
            </div>

            <div className="admin-metric-footer">

              <span>
                {formatNumber(
                  bookingStats.approved,
                )}{' '}
                approved
              </span>

              <span>
                {formatNumber(
                  bookingStats.rejected,
                )}{' '}
                rejected
              </span>

            </div>

          </article>

          <article className="admin-metric-card facility-card">

            <div className="admin-metric-top">

              <div className="admin-metric-icon">
                <Building2 size={20} />
              </div>

              <span className="admin-metric-badge positive">
                <CheckCircle2 size={13} />
                {facilityOperationalPercentage}%
                {' '}
                operational
              </span>

            </div>

            <div className="admin-metric-value">
              {loading
                ? '—'
                : formatNumber(
                    facilityStats.total,
                  )}
            </div>

            <div className="admin-metric-label">
              ICT facilities
            </div>

            <div className="admin-metric-footer">

              <span>
                {formatNumber(
                  facilityStats.available,
                )}{' '}
                available
              </span>

              <span>
                {formatNumber(
                  facilityStats.maintenance,
                )}{' '}
                maintenance
              </span>

            </div>

          </article>

          <article className="admin-metric-card announcement-card">

            <div className="admin-metric-top">

              <div className="admin-metric-icon">
                <Bell size={20} />
              </div>

              <span className="admin-metric-badge neutral">
                Live
              </span>

            </div>

            <div className="admin-metric-value">
              {loading
                ? '—'
                : formatNumber(
                    announcements.length,
                  )}
            </div>

            <div className="admin-metric-label">
              Published announcements
            </div>

            <div className="admin-metric-footer">

              <span>
                Current platform communication
              </span>

            </div>

          </article>

        </section>

        {/* =====================================================
            ANALYTICS
        ====================================================== */}

        <section className="admin-analytics-grid">

          {/* USER DISTRIBUTION */}

          <article className="admin-panel admin-role-panel">

            <div className="admin-panel-header">

              <div>
                <span className="admin-panel-kicker">
                  LIVE USER ANALYTICS
                </span>

                <h2>
                  User distribution
                </h2>
              </div>

              <Link to="/admin/users">
                <Eye size={16} />
                View users
              </Link>

            </div>

            <div className="admin-role-total">

              <div>
                <strong>
                  {formatNumber(
                    userStats.total,
                  )}
                </strong>

                <span>
                  Total registered accounts
                </span>
              </div>

              <div className="admin-role-total-icon">
                <Users size={22} />
              </div>

            </div>

            <div className="admin-distribution-list">

              {roleDistribution.map((item) => (
                <div
                  className="admin-distribution-row"
                  key={item.label}
                >

                  <div className="admin-distribution-label">

                    <span
                      className={`admin-distribution-dot ${item.className}`}
                    />

                    <span>
                      {item.label}
                    </span>

                    <strong>
                      {formatNumber(
                        item.value,
                      )}
                    </strong>

                  </div>

                  <div className="admin-distribution-track">

                    <span
                      className={`admin-distribution-bar ${item.className}`}
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />

                  </div>

                  <span className="admin-distribution-percent">
                    {item.percentage}%
                  </span>

                </div>
              ))}

            </div>

          </article>

          {/* BOOKING DISTRIBUTION */}

          <article className="admin-panel admin-booking-panel">

            <div className="admin-panel-header">

              <div>
                <span className="admin-panel-kicker">
                  LIVE BOOKING ANALYTICS
                </span>

                <h2>
                  Booking distribution
                </h2>
              </div>

              <Link to="/admin/bookings">
                <Eye size={16} />
                Manage
              </Link>

            </div>

            <div className="admin-booking-summary">

              <div className="admin-booking-number">

                <strong>
                  {formatNumber(
                    bookingStats.total,
                  )}
                </strong>

                <span>
                  Total booking requests
                </span>

              </div>

              <div
                className="admin-booking-ring"
                style={{
                  '--booking-progress':
                    `${approvalPercentage}%`,
                }}
              >

                <div className="admin-booking-ring-inner">

                  <strong>
                    {approvalPercentage}%
                  </strong>

                  <span>
                    approved
                  </span>

                </div>

              </div>

            </div>

            <div className="admin-booking-bars">

              {bookingDistribution.map(
                (item) => (
                  <div
                    className="admin-booking-bar-row"
                    key={item.label}
                  >

                    <div>

                      <span
                        className={`admin-booking-bar-dot ${item.className}`}
                      />

                      <span>
                        {item.label}
                      </span>

                    </div>

                    <strong>
                      {formatNumber(
                        item.value,
                      )}
                    </strong>

                  </div>
                ),
              )}

            </div>

          </article>

        </section>

        {/* =====================================================
            OPERATIONS
        ====================================================== */}

        <section className="admin-operations-grid">

          {/* ACTION QUEUE */}

          <article className="admin-panel admin-actions-panel">

            <div className="admin-panel-header">

              <div>
                <span className="admin-panel-kicker">
                  LIVE OPERATIONS
                </span>

                <h2>
                  Action queue
                </h2>
              </div>

              <span className="admin-panel-count">
                {pendingActions.reduce(
                  (sum, item) =>
                    sum + item.value,
                  0,
                )}
              </span>

            </div>

            <div className="admin-action-list">

              {pendingActions.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    to={item.path}
                    className="admin-action-item"
                    key={item.label}
                  >

                    <div
                      className={`admin-action-icon ${item.className}`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="admin-action-content">

                      <strong>
                        {item.label}
                      </strong>

                      <span>
                        Open management area
                      </span>

                    </div>

                    <strong className="admin-action-value">
                      {formatNumber(
                        item.value,
                      )}
                    </strong>

                    <ArrowUpRight
                      size={16}
                      className="admin-action-arrow"
                    />

                  </Link>
                );
              })}

            </div>

          </article>

          {/* FACILITIES */}

          <article className="admin-panel admin-facility-panel">

            <div className="admin-panel-header">

              <div>
                <span className="admin-panel-kicker">
                  LIVE INFRASTRUCTURE
                </span>

                <h2>
                  Facility status
                </h2>
              </div>

              <Link to="/admin/facilities">
                Manage
              </Link>

            </div>

            <div className="admin-facility-overview">

              <div className="admin-facility-main">

                <div className="admin-facility-gauge">

                  <div
                    className="admin-facility-gauge-fill"
                    style={{
                      '--facility-progress':
                        `${facilityOperationalPercentage}%`,
                    }}
                  >

                    <div>

                      <strong>
                        {facilityOperationalPercentage}%
                      </strong>

                      <span>
                        operational
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              <div className="admin-facility-stats">

                <div>
                  <span className="facility-status-dot available" />

                  <span>
                    Available
                  </span>

                  <strong>
                    {formatNumber(
                      facilityStats.available,
                    )}
                  </strong>
                </div>

                <div>
                  <span className="facility-status-dot maintenance" />

                  <span>
                    Maintenance
                  </span>

                  <strong>
                    {formatNumber(
                      facilityStats.maintenance,
                    )}
                  </strong>
                </div>

                <div>
                  <span className="facility-status-dot inactive" />

                  <span>
                    Inactive
                  </span>

                  <strong>
                    {formatNumber(
                      facilityStats.inactive,
                    )}
                  </strong>
                </div>

              </div>

            </div>

          </article>

        </section>

        {/* =====================================================
            ACTIVITY + ALERTS
        ====================================================== */}

        <section className="admin-bottom-grid">

          {/* ACTIVITY */}

          <article className="admin-panel admin-activity-panel">

            <div className="admin-panel-header">

              <div>
                <span className="admin-panel-kicker">
                  LIVE AUDIT TRAIL
                </span>

                <h2>
                  Recent system activity
                </h2>
              </div>

              <Link to="/admin/activity">
                View all
                <ArrowUpRight size={15} />
              </Link>

            </div>

            {activities.length > 0 ? (
              <div className="admin-activity-list">

                {activities
                  .slice(0, 7)
                  .map(
                    (
                      activity,
                      index,
                    ) => {
                      const title =
                        getActivityTitle(
                          activity,
                        );

                      const Icon =
                        getActivityIcon(
                          title,
                        );

                      return (
                        <div
                          className="admin-activity-item"
                          key={
                            activity.id ||
                            activity.pk ||
                            index
                          }
                        >

                          <div className="admin-activity-icon">
                            <Icon size={16} />
                          </div>

                          <div className="admin-activity-content">

                            <strong>
                              {title}
                            </strong>

                            <span>
                              {getActivityUser(
                                activity,
                              )}

                              {' · '}

                              {formatActivityDate(
                                activity.created_at ||
                                  activity.timestamp ||
                                  activity.date,
                              )}
                            </span>

                          </div>

                          <span className="admin-activity-arrow">
                            <ArrowUpRight size={15} />
                          </span>

                        </div>
                      );
                    },
                  )}

              </div>
            ) : (
              <div className="admin-empty-state">

                <Activity size={22} />

                <strong>
                  No recent activity
                </strong>

                <span>
                  New system activity will
                  appear here automatically.
                </span>

              </div>
            )}

          </article>

          {/* ALERTS */}

          <article className="admin-panel admin-alert-panel">

            <div className="admin-panel-header">

              <div>
                <span className="admin-panel-kicker">
                  LIVE ATTENTION
                </span>

                <h2>
                  System alerts
                </h2>
              </div>

              <AlertTriangle size={19} />

            </div>

            <div className="admin-alert-list">

              <div className="admin-alert-item warning">

                <div className="admin-alert-icon">
                  <Clock3 size={17} />
                </div>

                <div>

                  <strong>
                    {formatNumber(
                      bookingStats.pending,
                    )}{' '}
                    pending booking requests
                  </strong>

                  <span>
                    Requests currently waiting
                    for administrative action.
                  </span>

                </div>

                <Link to="/admin/bookings">
                  Review
                </Link>

              </div>

              <div className="admin-alert-item danger">

                <div className="admin-alert-icon">
                  <Building2 size={17} />
                </div>

                <div>

                  <strong>
                    {formatNumber(
                      facilityStats.maintenance,
                    )}{' '}
                    facilities under
                    maintenance
                  </strong>

                  <span>
                    Current infrastructure
                    requiring attention.
                  </span>

                </div>

                <Link to="/admin/facilities">
                  Inspect
                </Link>

              </div>

              <div
                className={`admin-alert-item ${
                  health.api === 'healthy' &&
                  health.database ===
                    'healthy'
                    ? 'success'
                    : 'warning'
                }`}
              >

                <div className="admin-alert-icon">

                  {health.api ===
                    'healthy' &&
                  health.database ===
                    'healthy' ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <AlertTriangle size={17} />
                  )}

                </div>

                <div>

                  <strong>
                    {health.api ===
                      'healthy' &&
                    health.database ===
                      'healthy'
                      ? 'Core services operational'
                      : 'System health requires attention'}
                  </strong>

                  <span>
                    API and database health
                    are monitored
                    automatically.
                  </span>

                </div>

                <span className="admin-alert-resolved">

                  {health.api ===
                    'healthy' &&
                  health.database ===
                    'healthy'
                    ? 'Healthy'
                    : 'Check'}

                </span>

              </div>

            </div>

          </article>

        </section>

        {/* =====================================================
            ADMIN CONTROL
        ====================================================== */}

        <section className="admin-control-panel">

          <div className="admin-control-heading">

            <div className="admin-control-icon">
              <LayoutDashboard size={20} />
            </div>

            <div>

              <span>
                ADMINISTRATIVE CONTROL
              </span>

              <h2>
                Manage the entire platform
              </h2>

              <p>
                Users, bookings, facilities,
                announcements, activity and
                security.
              </p>

            </div>

          </div>

          <div className="admin-control-actions">

            <Link
              to="/admin/users/create"
              className="admin-control-button primary"
            >
              <UserPlus size={17} />
              Create user
            </Link>

            <Link
              to="/admin/bookings"
              className="admin-control-button"
            >
              <CalendarCheck size={17} />
              Bookings
            </Link>

            <Link
              to="/admin/facilities"
              className="admin-control-button"
            >
              <Building2 size={17} />
              Facilities
            </Link>

            <Link
              to="/admin/settings"
              className="admin-control-button"
            >
              <ShieldCheck size={17} />
              Security
            </Link>

          </div>

        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="admin-dashboard-footer">

          <div>
            <strong>
              Kiangini ICT Centre
            </strong>

            <span>
              Administrative Control Center
            </span>
          </div>

          <div className="admin-footer-status">

            <span />

            Live monitoring · 30s refresh

          </div>

        </footer>

      </div>
    </section>
  );
}

export default AdminDashboard;