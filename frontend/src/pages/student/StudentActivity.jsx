import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FileEdit,
  Filter,
  KeyRound,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import activityService from '../../services/activityService';

import './StudentActivity.css';

function getActivityVisual(activity) {
  const { activity_type: activityType, action } = activity;

  if (action === 'approved') {
    return {
      type: 'approved',
      icon: <CheckCircle2 size={19} />,
    };
  }

  if (action === 'rejected') {
    return {
      type: 'rejected',
      icon: <XCircle size={19} />,
    };
  }

  if (action === 'cancelled') {
    return {
      type: 'cancelled',
      icon: <XCircle size={19} />,
    };
  }

  if (action === 'password_changed') {
    return {
      type: 'security',
      icon: <KeyRound size={19} />,
    };
  }

  if (action === 'profile_updated') {
    return {
      type: 'profile',
      icon: <UserRound size={19} />,
    };
  }

  if (action === 'login') {
    return {
      type: 'login',
      icon: <LogIn size={19} />,
    };
  }

  if (action === 'logout') {
    return {
      type: 'logout',
      icon: <LogOut size={19} />,
    };
  }

  if (activityType === 'announcement') {
    return {
      type: 'announcement',
      icon: <Bell size={19} />,
    };
  }

  if (activityType === 'facility') {
    return {
      type: 'facility',
      icon: <ShieldCheck size={19} />,
    };
  }

  if (action === 'updated') {
    return {
      type: 'updated',
      icon: <FileEdit size={19} />,
    };
  }

  if (action === 'created' && activityType === 'booking') {
    return {
      type: 'created',
      icon: <CalendarCheck size={19} />,
    };
  }

  return {
    type: 'default',
    icon: <Activity size={19} />,
  };
}

function formatRelativeTime(value) {
  if (!value) {
    return 'Unknown time';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  const now = new Date();
  const difference = now.getTime() - date.getTime();

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) {
    return 'Just now';
  }

  if (minutes < 1) {
    return `${seconds}s ago`;
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatExactDate(value) {
  if (!value) {
    return 'Date unavailable';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getActivityFilterType(activity) {
  if (activity.activity_type === 'booking') {
    return 'booking';
  }

  if (activity.activity_type === 'user') {
    return 'user';
  }

  if (activity.activity_type === 'announcement') {
    return 'announcement';
  }

  if (activity.activity_type === 'facility') {
    return 'facility';
  }

  return 'system';
}

function StudentActivity() {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    this_week: 0,
    important: 0,
  });

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadActivity = useCallback(async () => {
    try {
      setError('');

      const [activityData, statsData] =
        await Promise.all([
          activityService.getActivities(),
          activityService.getStats(),
        ]);

      setActivities(
        Array.isArray(activityData)
          ? activityData
          : activityData?.results || [],
      );

      setStats({
        total: statsData?.total || 0,
        today: statsData?.today || 0,
        this_week: statsData?.this_week || 0,
        important: statsData?.important || 0,
      });
    } catch (requestError) {
      console.error(
        'Unable to load student activity.',
        requestError,
      );

      setError(
        'Unable to load your activity right now. Please try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivity();
  };

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activities.filter((activity) => {
      const matchesSearch =
        !query ||
        activity.title
          ?.toLowerCase()
          .includes(query) ||
        activity.description
          ?.toLowerCase()
          .includes(query) ||
        activity.object_name
          ?.toLowerCase()
          .includes(query) ||
        activity.action_display
          ?.toLowerCase()
          .includes(query) ||
        activity.activity_type_display
          ?.toLowerCase()
          .includes(query);

      const activityFilterType =
        getActivityFilterType(activity);

      const matchesFilter =
        filter === 'all' ||
        activityFilterType === filter;

      return matchesSearch && matchesFilter;
    });
  }, [activities, search, filter]);

  return (
    <section className="student-activity-page">
      <div className="student-page-container">

        <div className="student-activity-header">
          <div>
            

            <h1>Activity</h1>

            <p>
              Review your recent activity, booking actions,
              account changes and important events from the
              Kiangini ICT Centre student portal.
            </p>
          </div>

          <div className="activity-header-actions">
            <button
              type="button"
              className={`activity-refresh-button ${
                refreshing ? 'is-refreshing' : ''
              }`}
              onClick={handleRefresh}
              disabled={loading || refreshing}
              title="Refresh activity"
              aria-label="Refresh activity"
            >
              <RefreshCw size={18} />
            </button>

            <div className="activity-header-icon">
              <Activity size={28} />
            </div>
          </div>
        </div>

        <div className="activity-stats">

          <div className="activity-stat-card activity-stat-blue">
            <div className="activity-stat-icon">
              <Activity size={20} />
            </div>

            <div>
              <span>Total Activity</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="activity-stat-card activity-stat-cyan">
            <div className="activity-stat-icon">
              <Clock3 size={20} />
            </div>

            <div>
              <span>Today</span>
              <strong>{stats.today}</strong>
            </div>
          </div>

          <div className="activity-stat-card activity-stat-violet">
            <div className="activity-stat-icon">
              <CalendarCheck size={20} />
            </div>

            <div>
              <span>This Week</span>
              <strong>{stats.this_week}</strong>
            </div>
          </div>

          <div className="activity-stat-card activity-stat-emerald">
            <div className="activity-stat-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Important</span>
              <strong>{stats.important}</strong>
            </div>
          </div>

        </div>

        <div className="activity-toolbar">

          <div className="activity-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search activity..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="activity-filter-wrapper">
            <Filter size={16} />

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
            >
              <option value="all">
                All Activity
              </option>

              <option value="booking">
                Bookings
              </option>

              <option value="user">
                Account
              </option>

              <option value="announcement">
                Announcements
              </option>

              <option value="facility">
                Facilities
              </option>

              <option value="system">
                System
              </option>
            </select>
          </div>

        </div>

        <div className="activity-content">

          <div className="activity-list-header">
            <div>
              <h2>Recent Activity</h2>

              <p>
                {loading
                  ? 'Loading your activity...'
                  : `${filteredActivities.length} ${
                      filteredActivities.length === 1
                        ? 'activity'
                        : 'activities'
                    } found`}
              </p>
            </div>

            {!loading && (
              <span className="activity-live-indicator">
                <span />
                Live data
              </span>
            )}
          </div>

          {loading ? (
            <div className="activity-loading">
              <div className="activity-spinner">
                <RefreshCw size={24} />
              </div>

              <h3>Loading activity</h3>

              <p>
                Retrieving your latest activity from the
                server.
              </p>
            </div>
          ) : error ? (
            <div className="activity-empty activity-error">
              <div className="activity-empty-icon">
                <XCircle size={26} />
              </div>

              <h3>Unable to load activity</h3>

              <p>{error}</p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRefresh}
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          ) : filteredActivities.length > 0 ? (
            <div className="activity-timeline">

              {filteredActivities.map(
                (item, index) => {
                  const visual =
                    getActivityVisual(item);

                  const isBooking =
                    item.activity_type === 'booking';

                  return (
                    <article
                      className={`activity-item activity-${visual.type}`}
                      key={`${item.id}-${index}`}
                    >
                      <div className="activity-timeline-line" />

                      <div className="activity-icon">
                        {visual.icon}
                      </div>

                      <div className="activity-card">

                        <div className="activity-card-top">

                          <div>
                            <span className="activity-type">
                              {item.activity_type_display ||
                                'Activity'}
                            </span>

                            <h3>
                              {item.title ||
                                item.action_display ||
                                'Activity'}
                            </h3>
                          </div>

                          <span
                            className={`activity-status status-${visual.type}`}
                          >
                            {item.action_display ||
                              'Activity'}
                          </span>
                        </div>

                        {item.description && (
                          <p className="activity-purpose">
                            {item.description}
                          </p>
                        )}

                        {item.object_name && (
                          <div className="activity-object">
                            <span>
                              Related item
                            </span>

                            <strong>
                              {item.object_name}
                            </strong>
                          </div>
                        )}

                        <div className="activity-details">

                          <span
                            title={formatExactDate(
                              item.created_at,
                            )}
                          >
                            <CalendarCheck size={15} />

                            {formatRelativeTime(
                              item.created_at,
                            )}
                          </span>

                          <span>
                            <Clock3 size={15} />

                            {formatExactDate(
                              item.created_at,
                            )}
                          </span>

                          {item.id && (
                            <span>
                              <Activity size={15} />
                              #{item.id}
                            </span>
                          )}
                        </div>

                        {isBooking &&
                        item.object_id ? (
                          <Link
                            to={`/student/bookings/${item.object_id}`}
                            className="activity-view-link"
                          >
                            View booking
                          </Link>
                        ) : (
                          <span className="activity-system-label">
                            Recorded activity
                          </span>
                        )}

                      </div>
                    </article>
                  );
                },
              )}

            </div>
          ) : (
            <div className="activity-empty">

              <div className="activity-empty-icon">
                <Activity size={26} />
              </div>

              <h3>No activity found</h3>

              <p>
                {search || filter !== 'all'
                  ? 'There is no activity matching your current search or filter.'
                  : 'Your activity will appear here as you use the student portal.'}
              </p>

              {search || filter !== 'all' ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setSearch('');
                    setFilter('all');
                  }}
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  to="/student/bookings/new"
                  className="btn btn-primary"
                >
                  Make a Booking
                </Link>
              )}

            </div>
          )}

        </div>

      </div>
    </section>
  );
}

export default StudentActivity;