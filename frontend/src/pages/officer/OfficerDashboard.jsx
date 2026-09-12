import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import api from '../../config/api';
import officerBookingService from '../../services/officerBookingService';

import './OfficerDashboard.css';

function OfficerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  /*
   * Live current time
   */
  const [currentTime, setCurrentTime] = useState(
    new Date(),
  );

  /*
   * Keep the dashboard clock updated every second.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /*
   * Load dashboard data
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
          bookingsResponse,
          facilitiesResponse,
          announcementsResponse,
          activitiesResponse,
        ] = await Promise.allSettled([
          officerBookingService.getBookings(),

          api.get(
            '/facilities/management/',
          ),

          api.get(
            '/announcements/',
          ),

          api.get(
            '/core/activities/?limit=8',
          ),
        ]);

        /*
         * Bookings
         */
        if (
          bookingsResponse.status ===
          'fulfilled'
        ) {
          const data =
            bookingsResponse.value;

          setBookings(
            Array.isArray(data)
              ? data
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
         * Activities
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

        /*
         * Determine failed requests
         */
        const failedRequests = [
          bookingsResponse,
          facilitiesResponse,
          announcementsResponse,
          activitiesResponse,
        ].filter(
          (result) =>
            result.status ===
            'rejected',
        );

        /*
         * Only show the main error if
         * everything failed.
         */
        if (
          failedRequests.length === 4
        ) {
          throw new Error(
            'Unable to load dashboard data.',
          );
        }

        /*
         * Some sections may still work
         * when another request fails.
         */
        if (
          failedRequests.length > 0
        ) {
          console.warn(
            'Some officer dashboard data could not be loaded.',
            failedRequests,
          );
        }
      } catch (requestError) {
        console.error(
          'Unable to load officer dashboard:',
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

  /*
   * Initial dashboard load
   */
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /*
   * Booking statistics
   */
  const pending = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status ===
          'pending',
      ),
    [bookings],
  );

  const approved = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status ===
          'approved',
      ),
    [bookings],
  );

  const rejected = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status ===
          'rejected',
      ),
    [bookings],
  );

  const cancelled = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status ===
          'cancelled',
      ),
    [bookings],
  );

  /*
   * Facility statistics
   */
  const availableFacilities = useMemo(
    () =>
      facilities.filter(
        (facility) =>
          facility.status ===
            'available' &&
          facility.is_bookable,
      ),
    [facilities],
  );

  const maintenanceFacilities = useMemo(
    () =>
      facilities.filter(
        (facility) =>
          facility.status ===
          'maintenance',
      ),
    [facilities],
  );

  const inactiveFacilities = useMemo(
    () =>
      facilities.filter(
        (facility) =>
          facility.status ===
          'inactive',
      ),
    [facilities],
  );

  /*
   * Operational alerts
   */
  const operationalAlerts = useMemo(() => {
    const alerts = [];

    if (pending.length > 0) {
      alerts.push({
        type: 'warning',
        icon: Clock3,
        title:
          'Pending booking requests',
        description: `${pending.length} booking ${
          pending.length === 1
            ? 'request is'
            : 'requests are'
        } waiting for review.`,
        link: '/officer/bookings',
        action: 'Review requests',
      });
    }

    if (
      maintenanceFacilities.length >
      0
    ) {
      alerts.push({
        type: 'danger',
        icon: AlertTriangle,
        title:
          'Facilities under maintenance',
        description: `${maintenanceFacilities.length} ${
          maintenanceFacilities.length ===
          1
            ? 'facility is'
            : 'facilities are'
        } currently under maintenance.`,
        link: '/officer/facilities',
        action: 'View facilities',
      });
    }

    if (
      inactiveFacilities.length > 0
    ) {
      alerts.push({
        type: 'info',
        icon: Building2,
        title:
          'Inactive facilities',
        description: `${inactiveFacilities.length} ${
          inactiveFacilities.length ===
          1
            ? 'facility is'
            : 'facilities are'
        } currently inactive.`,
        link: '/officer/facilities',
        action: 'Manage facilities',
      });
    }

    return alerts;
  }, [
    pending.length,
    maintenanceFacilities.length,
    inactiveFacilities.length,
  ]);

  /*
   * Real-time greeting
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

  /*
   * Real-time date
   */
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

  /*
   * Real-time clock
   */
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
   * Format announcement dates
   */
  const formatDate = (date) => {
    if (!date) {
      return '—';
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
        year: 'numeric',
      },
    );
  };

  /*
   * Format activity dates
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
   * Activity icons
   */
  const getActivityIcon = (
    activity,
  ) => {
    if (
      activity.type ===
      'booking'
    ) {
      return CalendarCheck;
    }

    if (
      activity.type ===
      'facility'
    ) {
      return Building2;
    }

    if (
      activity.type ===
      'announcement'
    ) {
      return Megaphone;
    }

    if (
      activity.type ===
      'user'
    ) {
      return Users;
    }

    return Activity;
  };

  return (
    <section className="officer-dashboard">
      <div className="officer-dashboard-container">

        {/* Header */}
        <header className="officer-dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              Officer Portal
            </span>

            <h1>
              {getGreeting(
                currentTime,
              )}
              , Officer.
            </h1>

            <div className="officer-live-time">
              <Clock3 size={14} />

              <span>
                {formattedDate}
              </span>

              <span className="officer-live-time-separator">
                ·
              </span>

              <strong>
                {formattedTime}
              </strong>
            </div>

            <p>
              Monitor requests,
              facilities,
              announcements and
              ICT Centre operations
              from one place.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline officer-refresh-button"
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
                  ? 'officer-refresh-icon'
                  : ''
              }
            />

            {refreshing
              ? 'Refreshing...'
              : 'Refresh'}
          </button>
        </header>

        {/* Error */}
        {error && (
          <div className="officer-dashboard-error">
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

        {/* Main statistics */}
        <div className="officer-dashboard-stats">

          <div className="officer-stat-card">
            <div className="officer-stat-icon total">
              <CalendarCheck
                size={21}
              />
            </div>

            <div>
              <span>
                Total Requests
              </span>

              <strong>
                {loading
                  ? '—'
                  : bookings.length}
              </strong>

              <small>
                All booking requests
              </small>
            </div>
          </div>

          <div className="officer-stat-card">
            <div className="officer-stat-icon pending">
              <Clock3 size={21} />
            </div>

            <div>
              <span>
                Pending Review
              </span>

              <strong>
                {loading
                  ? '—'
                  : pending.length}
              </strong>

              <small>
                Requires attention
              </small>
            </div>
          </div>

          <div className="officer-stat-card">
            <div className="officer-stat-icon approved">
              <CheckCircle2
                size={21}
              />
            </div>

            <div>
              <span>
                Approved
              </span>

              <strong>
                {loading
                  ? '—'
                  : approved.length}
              </strong>

              <small>
                Approved requests
              </small>
            </div>
          </div>

          <div className="officer-stat-card">
            <div className="officer-stat-icon rejected">
              <XCircle size={21} />
            </div>

            <div>
              <span>
                Rejected
              </span>

              <strong>
                {loading
                  ? '—'
                  : rejected.length}
              </strong>

              <small>
                Rejected requests
              </small>
            </div>
          </div>

        </div>

        {/* Secondary operational statistics */}
        <div className="officer-secondary-stats">

          <div className="officer-secondary-card">
            <div className="officer-secondary-icon facility">
              <Building2 size={18} />
            </div>

            <div>
              <span>
                Available Facilities
              </span>

              <strong>
                {loading
                  ? '—'
                  : availableFacilities.length}
              </strong>
            </div>
          </div>

          <div className="officer-secondary-card">
            <div className="officer-secondary-icon maintenance">
              <AlertTriangle
                size={18}
              />
            </div>

            <div>
              <span>
                Maintenance
              </span>

              <strong>
                {loading
                  ? '—'
                  : maintenanceFacilities.length}
              </strong>
            </div>
          </div>

          <div className="officer-secondary-card">
            <div className="officer-secondary-icon announcements">
              <Megaphone
                size={18}
              />
            </div>

            <div>
              <span>
                Announcements
              </span>

              <strong>
                {loading
                  ? '—'
                  : announcements.length}
              </strong>
            </div>
          </div>

          <div className="officer-secondary-card">
            <div className="officer-secondary-icon activity">
              <Activity size={18} />
            </div>

            <div>
              <span>
                Recent Activity
              </span>

              <strong>
                {loading
                  ? '—'
                  : activities.length}
              </strong>
            </div>
          </div>

        </div>

        {/* Alerts */}
        {operationalAlerts.length >
          0 && (
          <section className="officer-dashboard-section">
            <div className="officer-section-heading">
              <div>
                <span className="dashboard-eyebrow">
                  Attention
                </span>

                <h2>
                  Operational Alerts
                </h2>
              </div>
            </div>

            <div className="officer-alert-grid">
              {operationalAlerts.map(
                (
                  alert,
                  index,
                ) => {
                  const AlertIcon =
                    alert.icon;

                  return (
                    <div
                      key={`${alert.type}-${index}`}
                      className={`officer-alert-card ${alert.type}`}
                    >
                      <div className="officer-alert-icon">
                        <AlertIcon
                          size={19}
                        />
                      </div>

                      <div className="officer-alert-content">
                        <strong>
                          {alert.title}
                        </strong>

                        <span>
                          {
                            alert.description
                          }
                        </span>
                      </div>

                      <Link
                        to={
                          alert.link
                        }
                        className="officer-alert-link"
                      >
                        {
                          alert.action
                        }

                        <ChevronRight
                          size={16}
                        />
                      </Link>
                    </div>
                  );
                },
              )}
            </div>
          </section>
        )}

        {/* Main dashboard grid */}
        <div className="officer-dashboard-grid">

          {/* Pending requests */}
          <section className="officer-panel officer-pending-panel">

            <div className="officer-panel-header">
              <div>
                <span className="dashboard-eyebrow">
                  Requires attention
                </span>

                <h2>
                  Pending Requests
                </h2>

                <p>
                  Booking requests
                  waiting for your
                  review.
                </p>
              </div>

              <Link
                to="/officer/bookings"
                className="officer-panel-link"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <div className="officer-panel-state">
                Loading
                requests...
              </div>
            ) : pending.length ===
              0 ? (
              <div className="officer-panel-state officer-empty-state">
                <CheckCircle2
                  size={25}
                />

                <strong>
                  All caught up
                </strong>

                <span>
                  There are no
                  pending booking
                  requests.
                </span>
              </div>
            ) : (
              <div className="officer-request-list">
                {pending
                  .slice(0, 5)
                  .map(
                    (
                      booking,
                    ) => (
                      <Link
                        key={
                          booking.id
                        }
                        to={`/officer/bookings/${booking.id}`}
                        className="officer-request-item"
                      >
                        <div className="officer-request-icon">
                          <CalendarCheck
                            size={18}
                          />
                        </div>

                        <div className="officer-request-info">
                          <strong>
                            {booking.facility_name ||
                              'ICT Facility'}
                          </strong>

                          <span>
                            {booking.user_name ||
                              booking.user_email ||
                              'Student'}
                          </span>
                        </div>

                        <div className="officer-request-date">
                          <strong>
                            {booking.booking_date ||
                              '—'}
                          </strong>

                          <span>
                            {booking.start_time ||
                              '—'}
                          </span>
                        </div>

                        <ChevronRight
                          size={16}
                          className="officer-request-arrow"
                        />
                      </Link>
                    ),
                  )}
              </div>
            )}

          </section>

          {/* Quick actions */}
          <section className="officer-panel officer-quick-panel">

            <div className="officer-panel-header">
              <div>
                <span className="dashboard-eyebrow">
                  Quick actions
                </span>

                <h2>
                  Operations
                </h2>

                <p>
                  Common officer
                  tasks.
                </p>
              </div>
            </div>

            <div className="officer-quick-actions">

              <Link
                to="/officer/bookings"
                className="officer-quick-action primary"
              >
                <CalendarCheck
                  size={20}
                />

                <div>
                  <strong>
                    Review bookings
                  </strong>

                  <span>
                    Approve or
                    reject requests
                  </span>
                </div>

                <ChevronRight
                  size={16}
                />
              </Link>

              <Link
                to="/officer/facilities"
                className="officer-quick-action facility"
              >
                <Building2 size={20} />

                <div>
                  <strong>
                    Manage facilities
                  </strong>

                  <span>
                    Update
                    availability
                    and status
                  </span>
                </div>

                <ChevronRight
                  size={16}
                />
              </Link>

              <Link
                to="/officer/announcements/new"
                className="officer-quick-action announcement"
              >
                <Megaphone
                  size={20}
                />

                <div>
                  <strong>
                    Create announcement
                  </strong>

                  <span>
                    Publish an
                    important update
                  </span>
                </div>

                <ChevronRight
                  size={16}
                />
              </Link>

              <Link
                to="/officer/activity"
                className="officer-quick-action activity"
              >
                <Activity size={20} />

                <div>
                  <strong>
                    View activity
                  </strong>

                  <span>
                    Monitor recent
                    system actions
                  </span>
                </div>

                <ChevronRight
                  size={16}
                />
              </Link>

            </div>

          </section>

        </div>

        {/* Lower dashboard */}
        <div className="officer-dashboard-lower-grid">

          {/* Facilities */}
          <section className="officer-panel">

            <div className="officer-panel-header">
              <div>
                <span className="dashboard-eyebrow">
                  Facilities
                </span>

                <h2>
                  Facility Overview
                </h2>

                <p>
                  Current
                  operational
                  availability.
                </p>
              </div>

              <Link
                to="/officer/facilities"
                className="officer-panel-link"
              >
                Manage
              </Link>
            </div>

            {loading ? (
              <div className="officer-panel-state">
                Loading
                facilities...
              </div>
            ) : facilities.length ===
              0 ? (
              <div className="officer-panel-state officer-empty-state">
                <Building2
                  size={25}
                />

                <strong>
                  No facilities
                  found
                </strong>

                <span>
                  Add facilities to
                  start managing
                  availability.
                </span>
              </div>
            ) : (
              <div className="officer-facility-overview">

                <div className="facility-summary available">
                  <div>
                    <span>
                      Available
                    </span>

                    <strong>
                      {
                        availableFacilities.length
                      }
                    </strong>
                  </div>

                  <CheckCircle2
                    size={20}
                  />
                </div>

                <div className="facility-summary maintenance">
                  <div>
                    <span>
                      Maintenance
                    </span>

                    <strong>
                      {
                        maintenanceFacilities.length
                      }
                    </strong>
                  </div>

                  <AlertTriangle
                    size={20}
                  />
                </div>

                <div className="facility-summary inactive">
                  <div>
                    <span>
                      Inactive
                    </span>

                    <strong>
                      {
                        inactiveFacilities.length
                      }
                    </strong>
                  </div>

                  <XCircle
                    size={20}
                  />
                </div>

              </div>
            )}

          </section>

          {/* Announcements */}
          <section className="officer-panel">

            <div className="officer-panel-header">
              <div>
                <span className="dashboard-eyebrow">
                  Communication
                </span>

                <h2>
                  Recent Announcements
                </h2>

                <p>
                  Latest published
                  updates.
                </p>
              </div>

              <Link
                to="/officer/announcements"
                className="officer-panel-link"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <div className="officer-panel-state">
                Loading
                announcements...
              </div>
            ) : announcements.length ===
              0 ? (
              <div className="officer-panel-state officer-empty-state">
                <Megaphone
                  size={25}
                />

                <strong>
                  No announcements
                </strong>

                <span>
                  Published
                  announcements
                  will appear here.
                </span>
              </div>
            ) : (
              <div className="officer-announcement-list">
                {announcements
                  .slice(0, 4)
                  .map(
                    (
                      announcement,
                    ) => (
                      <Link
                        key={
                          announcement.id
                        }
                        to={`/announcements/${announcement.id}`}
                        className="officer-announcement-item"
                      >
                        <div className="officer-announcement-icon">
                          <Bell
                            size={17}
                          />
                        </div>

                        <div>
                          <strong>
                            {
                              announcement.title
                            }
                          </strong>

                          <span>
                            {formatDate(
                              announcement.created_at,
                            )}
                          </span>
                        </div>

                        <ChevronRight
                          size={16}
                        />
                      </Link>
                    ),
                  )}
              </div>
            )}

          </section>

        </div>

        {/* Recent activity */}
        <section className="officer-panel officer-activity-panel">

          <div className="officer-panel-header">
            <div>
              <span className="dashboard-eyebrow">
                System monitoring
              </span>

              <h2>
                Recent Activity
              </h2>

              <p>
                Latest actions
                recorded across the
                platform.
              </p>
            </div>

            <Link
              to="/officer/activity"
              className="officer-panel-link"
            >
              View activity
            </Link>
          </div>

          {loading ? (
            <div className="officer-panel-state">
              Loading activity...
            </div>
          ) : activities.length ===
            0 ? (
            <div className="officer-panel-state officer-empty-state">
              <ShieldCheck
                size={25}
              />

              <strong>
                No recent activity
              </strong>

              <span>
                System actions will
                appear here.
              </span>
            </div>
          ) : (
            <div className="officer-activity-list">
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
                        className="officer-activity-item"
                      >
                        <div
                          className={`officer-activity-icon ${
                            activity.type ||
                            'system'
                          }`}
                        >
                          <ActivityIcon
                            size={17}
                          />
                        </div>

                        <div className="officer-activity-content">
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

        {/* Booking summary */}
        <section className="officer-booking-summary">

          <div className="officer-booking-summary-content">
            <div className="officer-booking-summary-icon">
              <CalendarCheck
                size={22}
              />
            </div>

            <div>
              <span className="dashboard-eyebrow">
                Booking overview
              </span>

              <h2>
                Current request
                distribution
              </h2>

              <p>
                A quick view of how
                booking requests are
                currently distributed.
              </p>
            </div>
          </div>

          <div className="officer-booking-distribution">

            <div>
              <span>
                Pending
              </span>

              <strong>
                {loading
                  ? '—'
                  : pending.length}
              </strong>
            </div>

            <div>
              <span>
                Approved
              </span>

              <strong>
                {loading
                  ? '—'
                  : approved.length}
              </strong>
            </div>

            <div>
              <span>
                Rejected
              </span>

              <strong>
                {loading
                  ? '—'
                  : rejected.length}
              </strong>
            </div>

            <div>
              <span>
                Cancelled
              </span>

              <strong>
                {loading
                  ? '—'
                  : cancelled.length}
              </strong>
            </div>

          </div>

        </section>

      </div>
    </section>
  );
}

export default OfficerDashboard;