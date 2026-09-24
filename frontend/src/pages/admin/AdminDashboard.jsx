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
    Number(value) || 0,
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

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}

function extractTotal(data, fallback = 0) {
  if (Array.isArray(data)) {
    return data.length;
  }

  const candidates = [
    data?.count,
    data?.total,
    data?.total_count,
    data?.pagination?.count,
    data?.pagination?.total,
    data?.meta?.count,
    data?.meta?.total,
  ];

  const numericValue = candidates.find(
    (value) =>
      typeof value === 'number' &&
      Number.isFinite(value),
  );

  return numericValue ?? fallback;
}

function normalizeStatus(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function getActivityIcon(action = '') {
  const value = String(action).toLowerCase();

  if (
    value.includes('user') ||
    value.includes('student') ||
    value.includes('officer') ||
    value.includes('register') ||
    value.includes('profile')
  ) {
    return UserCog;
  }

  if (
    value.includes('booking') ||
    value.includes('reservation') ||
    value.includes('approve') ||
    value.includes('reject')
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
    value.includes('notification') ||
    value.includes('publish')
  ) {
    return Bell;
  }

  if (
    value.includes('security') ||
    value.includes('permission') ||
    value.includes('password') ||
    value.includes('login') ||
    value.includes('logout')
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

function getActivityDescription(activity) {
  return (
    activity?.description ||
    activity?.message ||
    activity?.object_name ||
    ''
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

function getActivityType(activity) {
  return normalizeStatus(
    activity?.activity_type ||
      activity?.type ||
      activity?.category ||
      '',
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

function getAnnouncementStatus(announcement) {
  return normalizeStatus(
    announcement?.status ||
      announcement?.announcement_status ||
      announcement?.state ||
      announcement?.publication_status ||
      announcement?.visibility,
  );
}

function isPublishedAnnouncement(announcement) {
  const status =
    getAnnouncementStatus(announcement);

  if (
    [
      'published',
      'publish',
      'active',
      'live',
    ].includes(status)
  ) {
    return true;
  }

  if (
    [
      'draft',
      'unpublished',
      'inactive',
      'archived',
      'scheduled',
    ].includes(status)
  ) {
    return false;
  }

  /*
   * Some APIs expose publication using a boolean.
   */
  if (
    typeof announcement?.is_published ===
    'boolean'
  ) {
    return announcement.is_published;
  }

  if (
    typeof announcement?.published ===
    'boolean'
  ) {
    return announcement.published;
  }

  /*
   * If no status information exists, do not
   * incorrectly classify the announcement as
   * pending administrative work.
   */
  return false;
}

function isDraftAnnouncement(announcement) {
  const status =
    getAnnouncementStatus(announcement);

  if (
    [
      'draft',
      'unpublished',
      'pending',
      'review',
      'awaiting_review',
    ].includes(status)
  ) {
    return true;
  }

  if (
    typeof announcement?.is_published ===
      'boolean' &&
    announcement.is_published === false
  ) {
    return true;
  }

  if (
    typeof announcement?.published ===
      'boolean' &&
    announcement.published === false
  ) {
    return true;
  }

  return false;
}

function isArchivedAnnouncement(announcement) {
  return [
    'archived',
    'archive',
    'expired',
  ].includes(
    getAnnouncementStatus(announcement),
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
  const [announcements, setAnnouncements] =
    useState([]);
  const [activities, setActivities] = useState([]);

  const [announcementTotal, setAnnouncementTotal] =
    useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [currentTime, setCurrentTime] = useState(
    new Date(),
  );

  const [lastUpdated, setLastUpdated] =
    useState(null);

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
        /*
         * Users
         */
        api.get('/auth/users/'),

        /*
         * Bookings
         */
        api.get('/bookings/management/'),

        /*
         * Facilities
         */
        api.get('/facilities/management/'),

        /*
         * Announcements
         */
        api.get('/announcements/'),

        /*
         * Administrator system-wide activity
         */
        api.get(
          '/core/admin/activities/?limit=10',
        ),

        /*
         * Core system health
         */
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
       * -------------------------------------------------------
       * USERS
       * -------------------------------------------------------
       */

      if (
        usersResponse.status ===
        'fulfilled'
      ) {
        const data =
          usersResponse.value.data;

        setUsers(extractResults(data));
      } else {
        failedRequests += 1;
      }

      /*
       * -------------------------------------------------------
       * BOOKINGS
       * -------------------------------------------------------
       */

      if (
        bookingsResponse.status ===
        'fulfilled'
      ) {
        const data =
          bookingsResponse.value.data;

        setBookings(extractResults(data));
      } else {
        failedRequests += 1;
      }

      /*
       * -------------------------------------------------------
       * FACILITIES
       * -------------------------------------------------------
       */

      if (
        facilitiesResponse.status ===
        'fulfilled'
      ) {
        const data =
          facilitiesResponse.value.data;

        setFacilities(extractResults(data));
      } else {
        failedRequests += 1;
      }

      /*
       * -------------------------------------------------------
       * ANNOUNCEMENTS
       * -------------------------------------------------------
       */

      if (
        announcementsResponse.status ===
        'fulfilled'
      ) {
        const data =
          announcementsResponse.value.data;

        const results =
          extractResults(data);

        setAnnouncements(results);

        setAnnouncementTotal(
          extractTotal(
            data,
            results.length,
          ),
        );
      } else {
        failedRequests += 1;
      }

      /*
       * -------------------------------------------------------
       * SYSTEM ACTIVITY
       * -------------------------------------------------------
       */

      if (
        activitiesResponse.status ===
        'fulfilled'
      ) {
        const data =
          activitiesResponse.value.data;

        setActivities(
          extractResults(data),
        );
      } else {
        failedRequests += 1;
      }

      /*
       * -------------------------------------------------------
       * HEALTH
       * -------------------------------------------------------
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
          healthData.authentication ===
            'ok';

        const applicationHealthy =
          healthData.application ===
            'healthy' ||
          healthData.application ===
            'ok' ||
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
         * If the health endpoint failed but other
         * API endpoints worked, the API itself is
         * still reachable.
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

    const inactive =
      users.length - active;

    return {
      total: users.length,
      students,
      officers,
      admins,
      active,
      inactive,
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

    const pending = count([
      'pending',
      'requested',
      'submitted',
      'awaiting_approval',
      'under_review',
    ]);

    const approved = count([
      'approved',
      'confirmed',
      'accepted',
    ]);

    const rejected = count([
      'rejected',
      'declined',
      'denied',
    ]);

    const cancelled = count([
      'cancelled',
      'canceled',
    ]);

    const completed = count([
      'completed',
      'complete',
      'finished',
    ]);

    const other =
      bookings.length -
      pending -
      approved -
      rejected -
      cancelled -
      completed;

    return {
      total: bookings.length,
      pending,
      approved,
      rejected,
      cancelled,
      completed,
      other: Math.max(other, 0),
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
      'ready',
    ];

    const maintenanceStatuses = [
      'maintenance',
      'under_maintenance',
      'repair',
      'under_repair',
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

    const unknown =
      facilities.length -
      available -
      maintenance -
      inactive;

    return {
      total: facilities.length,
      available,
      maintenance,
      inactive,
      unknown: Math.max(unknown, 0),
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
   * ANNOUNCEMENT ANALYTICS
   * =========================================================
   */

  const announcementStats = useMemo(() => {
    const published =
      announcements.filter(
        isPublishedAnnouncement,
      ).length;

    const drafts =
      announcements.filter(
        isDraftAnnouncement,
      ).length;

    const archived =
      announcements.filter(
        isArchivedAnnouncement,
      ).length;

    const scheduled =
      announcements.filter(
        (announcement) =>
          getAnnouncementStatus(
            announcement,
          ) === 'scheduled',
      ).length;

    const classified =
      published +
      drafts +
      archived +
      scheduled;

    const unknown = Math.max(
      announcements.length -
        classified,
      0,
    );

    /*
     * When the API exposes a total count
     * larger than the current page, retain
     * that total for the main metric.
     */
    const total =
      announcementTotal ||
      announcements.length;

    return {
      total,
      visible: announcements.length,
      published,
      drafts,
      archived,
      scheduled,
      unknown,
    };
  }, [
    announcements,
    announcementTotal,
  ]);

  /*
   * =========================================================
   * ROLE DISTRIBUTION
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
   * ACTIVITY ANALYTICS
   * =========================================================
   */

  const activityStats = useMemo(() => {
    const userActivities = activities.filter(
      (activity) =>
        getActivityType(activity) ===
        'user',
    ).length;

    const bookingActivities =
      activities.filter(
        (activity) =>
          getActivityType(activity) ===
          'booking',
      ).length;

    const facilityActivities =
      activities.filter(
        (activity) =>
          getActivityType(activity) ===
          'facility',
      ).length;

    const announcementActivities =
      activities.filter(
        (activity) =>
          getActivityType(activity) ===
          'announcement',
      ).length;

    const securityActivities =
      activities.filter((activity) => {
        const action =
          normalizeStatus(
            activity?.action,
          );

        return (
          action.includes('login') ||
          action.includes('logout') ||
          action.includes('password') ||
          action.includes('security')
        );
      }).length;

    return {
      total: activities.length,
      user: userActivities,
      booking: bookingActivities,
      facility: facilityActivities,
      announcement:
        announcementActivities,
      security: securityActivities,
    };
  }, [activities]);

  /*
   * =========================================================
   * ADMIN ACTION QUEUE
   *
   * Only actionable items belong here.
   * Informational totals such as "published
   * announcements" should NOT be treated as
   * pending work.
   * =========================================================
   */

  const pendingActions = useMemo(() => {
    const actions = [];

    if (bookingStats.pending > 0) {
      actions.push({
        label: 'Pending booking requests',
        description:
          'Requests waiting for review',
        value: bookingStats.pending,
        icon: Clock3,
        className: 'warning',
        path: '/admin/bookings',
        priority: 1,
      });
    }

    if (announcementStats.drafts > 0) {
      actions.push({
        label: 'Draft announcements',
        description:
          'Announcements awaiting publication',
        value: announcementStats.drafts,
        icon: Bell,
        className: 'info',
        path: '/admin/announcements',
        priority: 2,
      });
    }

    if (facilityStats.maintenance > 0) {
      actions.push({
        label: 'Facilities under maintenance',
        description:
          'Infrastructure requiring attention',
        value: facilityStats.maintenance,
        icon: Building2,
        className: 'danger',
        path: '/admin/facilities',
        priority: 3,
      });
    }

    if (userStats.inactive > 0) {
      actions.push({
        label: 'Inactive user accounts',
        description:
          'Accounts that may require review',
        value: userStats.inactive,
        icon: UserCog,
        className: 'warning',
        path: '/admin/users',
        priority: 4,
      });
    }

    return actions.sort(
      (a, b) => a.priority - b.priority,
    );
  }, [
    bookingStats.pending,
    announcementStats.drafts,
    facilityStats.maintenance,
    userStats.inactive,
  ]);

  const totalPendingActions = useMemo(
    () =>
      pendingActions.reduce(
        (sum, item) =>
          sum + item.value,
        0,
      ),
    [pendingActions],
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

  const allCoreServicesHealthy =
    health.api === 'healthy' &&
    health.database === 'healthy' &&
    health.authentication ===
      'healthy' &&
    health.application === 'healthy';

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

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

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

          {/* USERS */}

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

          {/* BOOKINGS */}

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
                  bookingStats.completed,
                )}{' '}
                completed
              </span>

            </div>

          </article>

          {/* FACILITIES */}

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

          {/* ANNOUNCEMENTS */}

          <article className="admin-metric-card announcement-card">

            <div className="admin-metric-top">

              <div className="admin-metric-icon">
                <Bell size={20} />
              </div>

              <span className="admin-metric-badge neutral">
                {formatNumber(
                  announcementStats.drafts,
                )}{' '}
                drafts
              </span>

            </div>

            <div className="admin-metric-value">
              {loading
                ? '—'
                : formatNumber(
                    announcementStats.total,
                  )}
            </div>

            <div className="admin-metric-label">
              Total announcements
            </div>

            <div className="admin-metric-footer">

              <span>
                {formatNumber(
                  announcementStats.published,
                )}{' '}
                published
              </span>

              <span>
                {formatNumber(
                  announcementStats.drafts,
                )}{' '}
                awaiting publication
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

            <div className="admin-analytics-meta">

              <span>
                Active accounts
              </span>

              <strong>
                {formatNumber(
                  userStats.active,
                )}
              </strong>

              <span>
                {userStats.total
                  ? Math.round(
                      (userStats.active /
                        userStats.total) *
                        100,
                    )
                  : 0}
                % active
              </span>

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

            <div className="admin-analytics-meta">

              <span>
                Completion
              </span>

              <strong>
                {formatNumber(
                  bookingStats.completed,
                )}
              </strong>

              <span>
                {bookingStats.total
                  ? Math.round(
                      (bookingStats.completed /
                        bookingStats.total) *
                        100,
                    )
                  : 0}
                % completed
              </span>

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
                {formatNumber(
                  totalPendingActions,
                )}
              </span>

            </div>

            {pendingActions.length > 0 ? (
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
                          {item.description}
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
            ) : (
              <div className="admin-empty-state">

                <CheckCircle2 size={22} />

                <strong>
                  No pending actions
                </strong>

                <span>
                  The administrative queue is
                  currently clear.
                </span>

              </div>
            )}

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

                      const description =
                        getActivityDescription(
                          activity,
                        );

                      const Icon =
                        getActivityIcon(
                          `${activity?.action || ''} ${activity?.activity_type || ''} ${title}`,
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

                            {description &&
                              description !==
                                title && (
                                <small>
                                  {description}
                                </small>
                              )}

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

            {activities.length > 0 && (
              <div className="admin-activity-summary">

                <span>
                  {formatNumber(
                    activityStats.total,
                  )}{' '}
                  recent events loaded
                </span>

                <span>
                  {formatNumber(
                    activityStats.security,
                  )}{' '}
                  security events
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

              {/* PENDING BOOKINGS */}

              {bookingStats.pending > 0 && (
                <div className="admin-alert-item warning">

                  <div className="admin-alert-icon">
                    <Clock3 size={17} />
                  </div>

                  <div>

                    <strong>
                      {formatNumber(
                        bookingStats.pending,
                      )}{' '}
                      pending booking
                      {bookingStats.pending ===
                      1
                        ? ''
                        : 's'}
                    </strong>

                    <span>
                      Requests currently
                      waiting for
                      administrative action.
                    </span>

                  </div>

                  <Link to="/admin/bookings">
                    Review
                  </Link>

                </div>
              )}

              {/* MAINTENANCE */}

              {facilityStats.maintenance >
                0 && (
                <div className="admin-alert-item danger">

                  <div className="admin-alert-icon">
                    <Building2 size={17} />
                  </div>

                  <div>

                    <strong>
                      {formatNumber(
                        facilityStats.maintenance,
                      )}{' '}
                      facilit
                      {facilityStats.maintenance ===
                      1
                        ? 'y'
                        : 'ies'}{' '}
                      under maintenance
                    </strong>

                    <span>
                      Current
                      infrastructure
                      requiring attention.
                    </span>

                  </div>

                  <Link to="/admin/facilities">
                    Inspect
                  </Link>

                </div>
              )}

              {/* DRAFT ANNOUNCEMENTS */}

              {announcementStats.drafts >
                0 && (
                <div className="admin-alert-item info">

                  <div className="admin-alert-icon">
                    <Bell size={17} />
                  </div>

                  <div>

                    <strong>
                      {formatNumber(
                        announcementStats.drafts,
                      )}{' '}
                      draft announcement
                      {announcementStats.drafts ===
                      1
                        ? ''
                        : 's'}
                    </strong>

                    <span>
                      Communication content
                      awaiting publication.
                    </span>

                  </div>

                  <Link to="/admin/announcements">
                    Review
                  </Link>

                </div>
              )}

              {/* INACTIVE USERS */}

              {userStats.inactive > 0 && (
                <div className="admin-alert-item warning">

                  <div className="admin-alert-icon">
                    <UserCog size={17} />
                  </div>

                  <div>

                    <strong>
                      {formatNumber(
                        userStats.inactive,
                      )}{' '}
                      inactive account
                      {userStats.inactive ===
                      1
                        ? ''
                        : 's'}
                    </strong>

                    <span>
                      Accounts available for
                      administrative review.
                    </span>

                  </div>

                  <Link to="/admin/users">
                    Review
                  </Link>

                </div>
              )}

              {/* CORE HEALTH */}

              <div
                className={`admin-alert-item ${
                  allCoreServicesHealthy
                    ? 'success'
                    : 'warning'
                }`}
              >

                <div className="admin-alert-icon">

                  {allCoreServicesHealthy ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <AlertTriangle size={17} />
                  )}

                </div>

                <div>

                  <strong>
                    {allCoreServicesHealthy
                      ? 'All core services operational'
                      : 'System health requires attention'}
                  </strong>

                  <span>
                    API, database,
                    authentication and
                    application health are
                    monitored automatically.
                  </span>

                </div>

                <span className="admin-alert-resolved">

                  {allCoreServicesHealthy
                    ? 'Healthy'
                    : 'Check'}

                </span>

              </div>

              {/* CLEAR STATE */}

              {bookingStats.pending ===
                0 &&
                facilityStats.maintenance ===
                  0 &&
                announcementStats.drafts ===
                  0 &&
                userStats.inactive ===
                  0 &&
                allCoreServicesHealthy && (
                  <div className="admin-alert-item success">

                    <div className="admin-alert-icon">
                      <CheckCircle2 size={17} />
                    </div>

                    <div>

                      <strong>
                        No outstanding alerts
                      </strong>

                      <span>
                        Platform operations are
                        currently within normal
                        conditions.
                      </span>

                    </div>

                    <span className="admin-alert-resolved">
                      Clear
                    </span>

                  </div>
                )}

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