import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileEdit,
  Filter,
  RefreshCw,
  Search,
  Settings2,
  Trash2,
  UserPlus,
  X,
  XCircle,
} from 'lucide-react';

import api from '../../config/api';

import './OfficerActivity.css';


const ACTIVITY_TYPES = [
  {
    value: 'all',
    label: 'All activity',
  },
  {
    value: 'announcement',
    label: 'Announcements',
  },
  {
    value: 'booking',
    label: 'Bookings',
  },
  {
    value: 'facility',
    label: 'Facilities',
  },
  {
    value: 'user',
    label: 'Users',
  },
  {
    value: 'system',
    label: 'System',
  },
];


const ACTIONS_BY_TYPE = {
  all: [
    {
      value: 'all',
      label: 'All actions',
    },
    {
      value: 'created',
      label: 'Created',
    },
    {
      value: 'updated',
      label: 'Updated',
    },
    {
      value: 'deleted',
      label: 'Deleted',
    },
    {
      value: 'published',
      label: 'Published',
    },
    {
      value: 'approved',
      label: 'Approved',
    },
    {
      value: 'rejected',
      label: 'Rejected',
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
    },
    {
      value: 'registered',
      label: 'Registered',
    },
    {
      value: 'login',
      label: 'Login',
    },
    {
      value: 'logout',
      label: 'Logout',
    },
    {
      value: 'profile_updated',
      label: 'Profile Updated',
    },
  ],

  announcement: [
    {
      value: 'all',
      label: 'All announcement actions',
    },
    {
      value: 'created',
      label: 'Created',
    },
    {
      value: 'updated',
      label: 'Updated',
    },
    {
      value: 'published',
      label: 'Published',
    },
    {
      value: 'deleted',
      label: 'Deleted',
    },
  ],

  booking: [
    {
      value: 'all',
      label: 'All booking actions',
    },
    {
      value: 'created',
      label: 'Created',
    },
    {
      value: 'approved',
      label: 'Approved',
    },
    {
      value: 'rejected',
      label: 'Rejected',
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
    },
  ],

  facility: [
    {
      value: 'all',
      label: 'All facility actions',
    },
    {
      value: 'created',
      label: 'Created',
    },
    {
      value: 'updated',
      label: 'Updated',
    },
    {
      value: 'deleted',
      label: 'Deleted',
    },
  ],

  user: [
    {
      value: 'all',
      label: 'All user actions',
    },
    {
      value: 'registered',
      label: 'Registered',
    },
    {
      value: 'login',
      label: 'Login',
    },
    {
      value: 'logout',
      label: 'Logout',
    },
    {
      value: 'profile_updated',
      label: 'Profile Updated',
    },
  ],

  system: [
    {
      value: 'all',
      label: 'All system actions',
    },
    {
      value: 'created',
      label: 'Created',
    },
    {
      value: 'updated',
      label: 'Updated',
    },
    {
      value: 'deleted',
      label: 'Deleted',
    },
  ],
};


function formatDate(dateString) {
  if (!dateString) {
    return 'Unknown date';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}


function getActivityIcon(activity) {
  if (activity.action === 'deleted') {
    return Trash2;
  }

  if (activity.action === 'published') {
    return CheckCircle2;
  }

  if (activity.action === 'approved') {
    return CheckCircle2;
  }

  if (activity.action === 'rejected') {
    return XCircle;
  }

  if (
    activity.action === 'updated' ||
    activity.action === 'profile_updated'
  ) {
    return FileEdit;
  }

  if (activity.action === 'registered') {
    return UserPlus;
  }

  if (
    activity.action === 'login' ||
    activity.action === 'logout'
  ) {
    return activity.action === 'login'
      ? CheckCircle2
      : X;
  }

  if (activity.activity_type === 'announcement') {
    return Bell;
  }

  if (activity.activity_type === 'booking') {
    return CalendarDays;
  }

  if (activity.activity_type === 'facility') {
    return Settings2;
  }

  if (activity.activity_type === 'user') {
    return UserPlus;
  }

  return Activity;
}


function getActivityTone(activity) {
  if (
    activity.action === 'deleted' ||
    activity.action === 'rejected'
  ) {
    return 'danger';
  }

  if (
    activity.action === 'approved' ||
    activity.action === 'published'
  ) {
    return 'success';
  }

  if (
    activity.action === 'registered' ||
    activity.action === 'login'
  ) {
    return 'info';
  }

  if (
    activity.action === 'updated' ||
    activity.action === 'profile_updated'
  ) {
    return 'indigo';
  }

  if (activity.action === 'logout') {
    return 'neutral';
  }

  if (activity.action === 'created') {
    return 'info';
  }

  return 'neutral';
}


function OfficerActivity() {
  const [activities, setActivities] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    this_week: 0,
    important: 0,
  });

  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [action, setAction] = useState('all');

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);


  const availableActions = useMemo(
    () => ACTIONS_BY_TYPE[type] || ACTIONS_BY_TYPE.all,
    [type],
  );


  useEffect(() => {
    const isValidAction = availableActions.some(
      (item) => item.value === action,
    );

    if (!isValidAction) {
      setAction('all');
    }
  }, [availableActions, action]);


  const loadActivity = useCallback(
    async () => {
      try {
        setLoading(true);
        setError('');

        const params = {};

        if (type !== 'all') {
          params.type = type;
        }

        if (action !== 'all') {
          params.action = action;
        }

        if (search.trim()) {
          params.search = search.trim();
        }

        const response = await api.get(
          '/core/activities/',
          { params },
        );

        const data = response.data;

        setActivities(
          Array.isArray(data)
            ? data
            : data?.results || [],
        );
      } catch (err) {
        console.error(
          'Failed to load activity:',
          err,
        );

        setError(
          'Unable to load activity history.',
        );
      } finally {
        setLoading(false);
      }
    },
    [type, action, search],
  );


  const loadStats = useCallback(
    async () => {
      try {
        setStatsLoading(true);

        const response = await api.get(
          '/core/activities/stats/',
        );

        setStats(response.data);
      } catch (err) {
        console.error(
          'Failed to load activity stats:',
          err,
        );
      } finally {
        setStatsLoading(false);
      }
    },
    [],
  );


  useEffect(() => {
    loadActivity();
  }, [loadActivity]);


  useEffect(() => {
    loadStats();
  }, [loadStats]);


  const visibleActivities = useMemo(
    () => activities,
    [activities],
  );


  const handleRefresh = async () => {
    await Promise.all([
      loadActivity(),
      loadStats(),
    ]);
  };


  const clearFilters = () => {
    setSearch('');
    setType('all');
    setAction('all');
  };


  const handleTypeChange = (event) => {
    const nextType = event.target.value;

    setType(nextType);

    const nextActions =
      ACTIONS_BY_TYPE[nextType] ||
      ACTIONS_BY_TYPE.all;

    const actionStillValid =
      nextActions.some(
        (item) => item.value === action,
      );

    if (!actionStillValid) {
      setAction('all');
    }
  };


  const hasFilters =
    search.trim() ||
    type !== 'all' ||
    action !== 'all';


  return (
    <div className="officer-activity">
      <div className="officer-activity__header">
        <div>
          <div className="officer-activity__eyebrow">
            <Activity size={14} />
            Audit & activity
          </div>

          <h1>
            Activity history
          </h1>

          <p>
            Monitor important actions and
            changes across the ICT Centre
            platform.
          </p>
        </div>

        <button
          type="button"
          className="officer-activity__refresh"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? 'is-spinning'
                : ''
            }
          />
          Refresh
        </button>
      </div>


      <div className="activity-stats">
        <div className="activity-stat activity-stat--blue">
          <div className="activity-stat__icon">
            <Activity size={18} />
          </div>

          <div>
            <span>Total actions</span>

            <strong>
              {statsLoading
                ? '—'
                : stats.total}
            </strong>
          </div>
        </div>


        <div className="activity-stat activity-stat--cyan">
          <div className="activity-stat__icon">
            <Clock3 size={18} />
          </div>

          <div>
            <span>Today</span>

            <strong>
              {statsLoading
                ? '—'
                : stats.today}
            </strong>
          </div>
        </div>


        <div className="activity-stat activity-stat--indigo">
          <div className="activity-stat__icon">
            <CalendarDays size={18} />
          </div>

          <div>
            <span>This week</span>

            <strong>
              {statsLoading
                ? '—'
                : stats.this_week}
            </strong>
          </div>
        </div>


        <div className="activity-stat activity-stat--amber">
          <div className="activity-stat__icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Important</span>

            <strong>
              {statsLoading
                ? '—'
                : stats.important}
            </strong>
          </div>
        </div>
      </div>


      <div className="activity-toolbar">
        <div className="activity-search">
          <Search size={17} />

          <input
            type="search"
            placeholder="Search activity..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>


        <button
          type="button"
          className={`activity-filter-toggle ${
            showFilters
              ? 'is-active'
              : ''
          }`}
          onClick={() =>
            setShowFilters(
              (current) => !current,
            )
          }
        >
          <Filter size={16} />
          Filters
        </button>


        <div className="activity-toolbar__selects">
          <select
            value={type}
            onChange={handleTypeChange}
          >
            {ACTIVITY_TYPES.map(
              (item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ),
            )}
          </select>

          <select
            value={action}
            onChange={(event) =>
              setAction(event.target.value)
            }
          >
            {availableActions.map(
              (item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ),
            )}
          </select>
        </div>
      </div>


      {showFilters && (
        <div className="activity-mobile-filters">
          <div>
            <label htmlFor="activity-type">
              Activity type
            </label>

            <select
              id="activity-type"
              value={type}
              onChange={handleTypeChange}
            >
              {ACTIVITY_TYPES.map(
                (item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label htmlFor="activity-action">
              Action
            </label>

            <select
              id="activity-action"
              value={action}
              onChange={(event) =>
                setAction(event.target.value)
              }
            >
              {availableActions.map(
                (item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      )}


      {hasFilters && (
        <div className="activity-filter-summary">
          <span>
            Showing filtered activity
          </span>

          <button
            type="button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      )}


      {error && (
        <div className="activity-alert activity-alert--error">
          <AlertCircle size={18} />

          <div>
            <strong>
              Something went wrong
            </strong>

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
          >
            Retry
          </button>
        </div>
      )}


      <section className="activity-panel">
        <div className="activity-panel__header">
          <div>
            <span>
              Recent activity
            </span>

            <h2>
              Platform timeline
            </h2>
          </div>

          <span className="activity-count">
            {visibleActivities.length}{' '}
            {visibleActivities.length === 1
              ? 'event'
              : 'events'}
          </span>
        </div>


        {loading ? (
          <div className="activity-loading">
            <RefreshCw
              size={24}
              className="is-spinning"
            />

            <span>
              Loading activity...
            </span>
          </div>
        ) : visibleActivities.length === 0 ? (
          <div className="activity-empty">
            <div className="activity-empty__icon">
              <Activity size={24} />
            </div>

            <h3>
              No activity found
            </h3>

            <p>
              Activity generated by officers
              and administrators will appear
              here.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="activity-timeline">
            {visibleActivities.map(
              (item) => {
                const Icon =
                  getActivityIcon(item);

                const tone =
                  getActivityTone(item);

                return (
                  <article
                    className="activity-item"
                    key={item.id}
                  >
                    <div
                      className={`activity-item__icon activity-item__icon--${tone}`}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="activity-item__content">
                      <div className="activity-item__top">
                        <div>
                          <h3>
                            {item.title}
                          </h3>

                          <span className="activity-item__type">
                            {item.activity_type_display ||
                              item.activity_type}
                          </span>
                        </div>

                        <time>
                          {formatDate(
                            item.created_at,
                          )}
                        </time>
                      </div>

                      {item.description && (
                        <p>
                          {item.description}
                        </p>
                      )}

                      <div className="activity-item__meta">
                        <span>
                          By{' '}
                          <strong>
                            {item.user_name ||
                              'System'}
                          </strong>
                        </span>

                        <span>
                          {item.action_display ||
                            item.action}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}


export default OfficerActivity;