import {
  Activity,
  AlertCircle,
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Database,
  Eye,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
  XCircle,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import api from '../../config/api';

import './AdminActivity.css';

const PAGE_SIZE = 15;

const TYPE_OPTIONS = [
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

const ACTION_OPTIONS = [
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
    label: 'Profile updated',
  },
  {
    value: 'password_changed',
    label: 'Password changed',
  },
];

function getResults(response) {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.activities)) {
    return data.activities;
  }

  return [];
}

function getTotal(response, fallbackLength) {
  const data = response?.data;

  if (typeof data?.count === 'number') {
    return data.count;
  }

  if (typeof data?.total === 'number') {
    return data.total;
  }

  return fallbackLength;
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    'Unable to load activity records.'
  );
}

function getActivityType(activity) {
  return (
    activity?.activity_type ||
    'system'
  );
}

function getActivityTypeLabel(activity) {
  return (
    activity?.activity_type_display ||
    activity?.activity_type ||
    'System'
  );
}

function getAction(activity) {
  return (
    activity?.action ||
    'updated'
  );
}

function getActionLabel(activity) {
  return (
    activity?.action_display ||
    activity?.action ||
    'Updated'
  );
}

function getUserName(activity) {
  return (
    activity?.user_name ||
    activity?.user?.full_name ||
    activity?.user?.email ||
    'System'
  );
}

function getObjectName(activity) {
  return (
    activity?.object_name ||
    activity?.title ||
    'System activity'
  );
}

function formatDateTime(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'en-KE',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  ).format(date);
}

function formatRelativeTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const difference =
    Date.now() - date.getTime();

  const seconds = Math.floor(
    difference / 1000
  );

  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatDateTime(value);
}

function getTypeIcon(type) {
  switch (type) {
    case 'announcement':
      return Bell;

    case 'booking':
      return CalendarCheck;

    case 'facility':
      return Database;

    case 'user':
      return Users;

    default:
      return Activity;
  }
}

function getActionIcon(action) {
  switch (action) {
    case 'created':
    case 'registered':
      return CheckCircle2;

    case 'deleted':
      return Trash2;

    case 'rejected':
    case 'cancelled':
      return XCircle;

    case 'login':
    case 'logout':
      return ShieldCheck;

    case 'profile_updated':
    case 'password_changed':
      return UserCog;

    default:
      return Activity;
  }
}

function getTypeClass(type) {
  return `activity-type activity-type-${type}`;
}

function getActionClass(action) {
  return `activity-action activity-action-${action}`;
}

export default function AdminActivity() {
  const [activities, setActivities] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  const [selectedActivity, setSelectedActivity] =
    useState(null);

  const fetchActivities = useCallback(
    async ({
      showLoader = true,
      showRefresh = false,
    } = {}) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        if (showRefresh) {
          setRefreshing(true);
        }

        setError('');

        const params = {
          page,
          page_size: PAGE_SIZE,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (typeFilter !== 'all') {
          params.activity_type =
            typeFilter;
        }

        if (actionFilter !== 'all') {
          params.action =
            actionFilter;
        }

        const response = await api.get(
          '/core/admin/activities/',
          {
            params,
          }
        );

        const results =
          getResults(response);

        setActivities(results);

        setTotalCount(
          getTotal(
            response,
            results.length
          )
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      search,
      typeFilter,
      actionFilter,
    ]
  );

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const stats = useMemo(() => {
    const total =
      totalCount ||
      activities.length;

    const announcements =
      activities.filter(
        (item) =>
          item.activity_type ===
          'announcement'
      ).length;

    const bookings =
      activities.filter(
        (item) =>
          item.activity_type ===
          'booking'
      ).length;

    const users =
      activities.filter(
        (item) =>
          item.activity_type ===
          'user'
      ).length;

    const system =
      activities.filter(
        (item) =>
          item.activity_type ===
          'system'
      ).length;

    return {
      total,
      announcements,
      bookings,
      users,
      system,
    };
  }, [activities, totalCount]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalCount / PAGE_SIZE
    )
  );

  const handleSearchChange = (
    event
  ) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleTypeChange = (
    event
  ) => {
    setTypeFilter(
      event.target.value
    );
    setPage(1);
  };

  const handleActionChange = (
    event
  ) => {
    setActionFilter(
      event.target.value
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setActionFilter('all');
    setPage(1);
  };

  const hasFilters =
    Boolean(search) ||
    typeFilter !== 'all' ||
    actionFilter !== 'all';

  const handleRefresh = () => {
    fetchActivities({
      showLoader: false,
      showRefresh: true,
    });
  };

  const goToPage = (
    nextPage
  ) => {
    if (
      nextPage < 1 ||
      nextPage > totalPages
    ) {
      return;
    }

    setPage(nextPage);
  };

  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    const pages = [];

    const start = Math.max(
      1,
      page - 2
    );

    const end = Math.min(
      totalPages,
      page + 2
    );

    for (
      let current = start;
      current <= end;
      current += 1
    ) {
      pages.push(current);
    }

    return (
      <div className="admin-activity-pagination">
        <button
          type="button"
          className="activity-pagination-button"
          onClick={() =>
            goToPage(page - 1)
          }
          disabled={page === 1}
        >
          <ChevronLeft size={17} />
        </button>

        {pages.map(
          (pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={`activity-pagination-button ${
                pageNumber === page
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                goToPage(
                  pageNumber
                )
              }
            >
              {pageNumber}
            </button>
          )
        )}

        <button
          type="button"
          className="activity-pagination-button"
          onClick={() =>
            goToPage(page + 1)
          }
          disabled={
            page === totalPages
          }
        >
          <ChevronRight size={17} />
        </button>
      </div>
    );
  };

  return (
    <div className="admin-activity-page">
      <div className="admin-activity-shell">

        {/* Header */}
        <header className="admin-activity-header">
          <div>
            <div className="admin-activity-eyebrow">
              <Activity size={16} />
              <span>
                System monitoring
              </span>
            </div>

            <h1>
              Activity
            </h1>

            <p>
              Monitor actions and
              events happening across
              the Kiangini ICT Centre
              platform.
            </p>
          </div>

          <button
            type="button"
            className="admin-activity-refresh"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? 'activity-spin'
                  : ''
              }
            />

            Refresh activity
          </button>
        </header>

        {/* Error */}
        {error && (
          <div className="admin-activity-alert">
            <AlertCircle size={19} />

            <div>
              <strong>
                Activity request failed
              </strong>

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setError('')
              }
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Stats */}
        <section className="admin-activity-stats">
          <article className="activity-stat-card total">
            <div className="activity-stat-icon">
              <Activity size={21} />
            </div>

            <div>
              <span>
                Total activity
              </span>

              <strong>
                {stats.total}
              </strong>

              <small>
                Recorded system events
              </small>
            </div>
          </article>

          <article className="activity-stat-card announcement">
            <div className="activity-stat-icon">
              <Bell size={21} />
            </div>

            <div>
              <span>
                Announcements
              </span>

              <strong>
                {stats.announcements}
              </strong>

              <small>
                Announcement activity
              </small>
            </div>
          </article>

          <article className="activity-stat-card booking">
            <div className="activity-stat-icon">
              <CalendarCheck
                size={21}
              />
            </div>

            <div>
              <span>
                Bookings
              </span>

              <strong>
                {stats.bookings}
              </strong>

              <small>
                Booking activity
              </small>
            </div>
          </article>

          <article className="activity-stat-card users">
            <div className="activity-stat-icon">
              <Users size={21} />
            </div>

            <div>
              <span>
                User activity
              </span>

              <strong>
                {stats.users}
              </strong>

              <small>
                Account activity
              </small>
            </div>
          </article>
        </section>

        {/* Toolbar */}
        <section className="admin-activity-toolbar">

          <div className="admin-activity-search">
            <Search size={18} />

            <input
              type="search"
              value={search}
              onChange={
                handleSearchChange
              }
              placeholder="Search activity..."
              aria-label="Search activity"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="admin-activity-filter">
            <Filter size={17} />

            <select
              value={typeFilter}
              onChange={
                handleTypeChange
              }
              aria-label="Filter activity type"
            >
              {TYPE_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="admin-activity-filter">
            <Activity size={17} />

            <select
              value={actionFilter}
              onChange={
                handleActionChange
              }
              aria-label="Filter action"
            >
              {ACTION_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          {hasFilters && (
            <button
              type="button"
              className="admin-activity-clear"
              onClick={clearFilters}
            >
              <X size={15} />
              Clear
            </button>
          )}
        </section>

        {/* Activity content */}
        <section className="admin-activity-content">

          {loading ? (
            <div className="admin-activity-loading">
              <div className="activity-loading-icon">
                <RefreshCw
                  size={25}
                  className="activity-spin"
                />
              </div>

              <strong>
                Loading activity
              </strong>

              <span>
                Retrieving recent
                system activity...
              </span>
            </div>
          ) : activities.length === 0 ? (
            <div className="admin-activity-empty">
              <div className="activity-empty-icon">
                <Activity size={29} />
              </div>

              <h2>
                No activity found
              </h2>

              <p>
                There are no activity
                records matching your
                current filters.
              </p>
            </div>
          ) : (
            <>
              <div className="admin-activity-table-wrap">
                <table className="admin-activity-table">
                  <thead>
                    <tr>
                      <th>
                        Activity
                      </th>

                      <th>
                        Type
                      </th>

                      <th>
                        Action
                      </th>

                      <th>
                        User
                      </th>

                      <th>
                        Object
                      </th>

                      <th>
                        Date & time
                      </th>

                      <th>
                        View
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {activities.map(
                      (activity) => {
                        const type =
                          getActivityType(
                            activity
                          );

                        const action =
                          getAction(
                            activity
                          );

                        const TypeIcon =
                          getTypeIcon(
                            type
                          );

                        const ActionIcon =
                          getActionIcon(
                            action
                          );

                        return (
                          <tr
                            key={
                              activity.id
                            }
                          >
                            <td>
                              <div className="activity-main-cell">
                                <div
                                  className={`activity-row-icon ${type}`}
                                >
                                  <TypeIcon
                                    size={18}
                                  />
                                </div>

                                <div className="activity-main-copy">
                                  <strong>
                                    {
                                      activity.title ||
                                      getActionLabel(
                                        activity
                                      )
                                    }
                                  </strong>

                                  <span>
                                    {
                                      activity.description ||
                                      'System activity recorded.'
                                    }
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span
                                className={getTypeClass(
                                  type
                                )}
                              >
                                <TypeIcon
                                  size={13}
                                />

                                {
                                  getActivityTypeLabel(
                                    activity
                                  )
                                }
                              </span>
                            </td>

                            <td>
                              <span
                                className={getActionClass(
                                  action
                                )}
                              >
                                <ActionIcon
                                  size={13}
                                />

                                {
                                  getActionLabel(
                                    activity
                                  )
                                }
                              </span>
                            </td>

                            <td>
                              <div className="activity-user">
                                <div className="activity-user-avatar">
                                  {getUserName(
                                    activity
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <span>
                                  {
                                    getUserName(
                                      activity
                                    )
                                  }
                                </span>
                              </div>
                            </td>

                            <td>
                              <span className="activity-object">
                                {
                                  getObjectName(
                                    activity
                                  )
                                }
                              </span>
                            </td>

                            <td>
                              <div className="activity-time">
                                <Clock3
                                  size={14}
                                />

                                <div>
                                  <strong>
                                    {formatRelativeTime(
                                      activity.created_at
                                    )}
                                  </strong>

                                  <span>
                                    {formatDateTime(
                                      activity.created_at
                                    )}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="activity-view-button"
                                onClick={() =>
                                  setSelectedActivity(
                                    activity
                                  )
                                }
                                title="View activity details"
                              >
                                <Eye
                                  size={16}
                                />

                                View
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <footer className="admin-activity-footer">
                <span>
                  Showing{' '}
                  <strong>
                    {activities.length}
                  </strong>{' '}
                  of{' '}
                  <strong>
                    {totalCount}
                  </strong>{' '}
                  activity records
                </span>

                {renderPagination()}
              </footer>
            </>
          )}
        </section>
      </div>

      {/* Activity details modal */}
      {selectedActivity && (
        <div
          className="admin-activity-modal-backdrop"
          onClick={() =>
            setSelectedActivity(null)
          }
        >
          <div
            className="admin-activity-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-activity-modal-header">
              <div>
                <span className="modal-eyebrow">
                  <Activity size={14} />
                  Activity details
                </span>

                <h2>
                  {
                    selectedActivity.title ||
                    'System activity'
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedActivity(
                    null
                  )
                }
                aria-label="Close activity details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="activity-detail-summary">
              <div
                className={`activity-detail-icon ${
                  getActivityType(
                    selectedActivity
                  )
                }`}
              >
                {(() => {
                  const Icon =
                    getTypeIcon(
                      getActivityType(
                        selectedActivity
                      )
                    );

                  return (
                    <Icon size={23} />
                  );
                })()}
              </div>

              <div>
                <strong>
                  {
                    selectedActivity.description ||
                    'System activity recorded.'
                  }
                </strong>

                <span>
                  {
                    formatDateTime(
                      selectedActivity.created_at
                    )
                  }
                </span>
              </div>
            </div>

            <div className="activity-detail-grid">
              <div className="activity-detail-item">
                <span>
                  Activity type
                </span>

                <strong>
                  {
                    getActivityTypeLabel(
                      selectedActivity
                    )
                  }
                </strong>
              </div>

              <div className="activity-detail-item">
                <span>
                  Action
                </span>

                <strong>
                  {
                    getActionLabel(
                      selectedActivity
                    )
                  }
                </strong>
              </div>

              <div className="activity-detail-item">
                <span>
                  User
                </span>

                <strong>
                  {
                    getUserName(
                      selectedActivity
                    )
                  }
                </strong>
              </div>

              <div className="activity-detail-item">
                <span>
                  Object
                </span>

                <strong>
                  {
                    getObjectName(
                      selectedActivity
                    )
                  }
                </strong>
              </div>

              <div className="activity-detail-item">
                <span>
                  Object ID
                </span>

                <strong>
                  {
                    selectedActivity.object_id ||
                    '—'
                  }
                </strong>
              </div>

              <div className="activity-detail-item">
                <span>
                  Activity ID
                </span>

                <strong>
                  {
                    selectedActivity.id
                  }
                </strong>
              </div>
            </div>

            <div className="activity-detail-description">
              <span>
                Description
              </span>

              <p>
                {
                  selectedActivity.description ||
                  'No additional description was recorded.'
                }
              </p>
            </div>

            <button
              type="button"
              className="activity-modal-close"
              onClick={() =>
                setSelectedActivity(
                  null
                )
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}