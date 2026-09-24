import {
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  Filter,
  Megaphone,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../../config/api';
import './AdminAnnouncements.css';

const PAGE_SIZE = 10;

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'general', label: 'General' },
  { value: 'academic', label: 'Academic' },
  { value: 'system', label: 'System' },
  { value: 'event', label: 'Event' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'urgent', label: 'Urgent' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

const TYPE_META = {
  general: {
    label: 'General',
    className: 'general',
  },
  academic: {
    label: 'Academic',
    className: 'academic',
  },
  system: {
    label: 'System',
    className: 'system',
  },
  event: {
    label: 'Event',
    className: 'event',
  },
  maintenance: {
    label: 'Maintenance',
    className: 'maintenance',
  },
  urgent: {
    label: 'Urgent',
    className: 'urgent',
  },
};

function getResults(response) {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data?.announcements)) {
    return response.data.announcements;
  }

  return [];
}

function getTotalCount(response, fallback) {
  if (typeof response?.data?.count === 'number') {
    return response.data.count;
  }

  if (typeof response?.data?.total === 'number') {
    return response.data.total;
  }

  return fallback;
}

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || 'Unable to complete the request.';
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.message) {
    return data.message;
  }

  const messages = Object.entries(data)
    .map(([field, value]) => {
      const message = Array.isArray(value)
        ? value.join(', ')
        : String(value);

      return `${field}: ${message}`;
    })
    .filter(Boolean);

  return messages.length
    ? messages.join(' ')
    : 'Unable to complete the request.';
}

function getTypeMeta(type) {
  return TYPE_META[type] || TYPE_META.general;
}

function getAnnouncementExcerpt(message, length = 150) {
  if (!message) return 'No announcement message available.';

  const text = String(message).trim();

  return text.length > length
    ? `${text.slice(0, length).trim()}…`
    : text;
}

function formatDate(date) {
  if (!date) return 'Not published';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date';
  }

  return parsed.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(date) {
  if (!date) return 'Not published';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date';
  }

  return parsed.toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [openMenu, setOpenMenu] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAnnouncements = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
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
          params.announcement_type = typeFilter;
        }

        if (statusFilter === 'published') {
          params.is_published = true;
        }

        if (statusFilter === 'draft') {
          params.is_published = false;
        }

        const response = await api.get(
          '/announcements/management/',
          { params },
        );

        const results = getResults(response);

        setAnnouncements(results);
        setTotalCount(getTotalCount(response, results.length));
      } catch (requestError) {
        setError(getErrorMessage(requestError));
        setAnnouncements([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, typeFilter, statusFilter],
  );

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    const closeMenu = () => setOpenMenu(null);

    if (openMenu !== null) {
      document.addEventListener('click', closeMenu);
    }

    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, [openMenu]);

  const stats = useMemo(() => {
    const published = announcements.filter(
      (item) => item.is_published,
    ).length;

    const drafts = announcements.filter(
      (item) => !item.is_published,
    ).length;

    const urgent = announcements.filter(
      (item) => item.announcement_type === 'urgent',
    ).length;

    const events = announcements.filter(
      (item) => item.announcement_type === 'event',
    ).length;

    return {
      total: totalCount,
      published,
      drafts,
      urgent,
      events,
    };
  }, [announcements, totalCount]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE),
  );

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleTypeChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handlePublishToggle = async (announcement) => {
    const id = announcement.id;

    try {
      setActionLoading(id);
      setOpenMenu(null);
      setError('');

      await api.patch(
        `/announcements/management/${id}/`,
        {
          is_published: !announcement.is_published,
        },
      );

      await fetchAnnouncements(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoading(deleteTarget.id);
      setError('');

      await api.delete(
        `/announcements/management/${deleteTarget.id}/`,
      );

      setDeleteTarget(null);

      if (
        announcements.length === 1 &&
        page > 1
      ) {
        setPage((current) => current - 1);
      } else {
        await fetchAnnouncements(true);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="admin-announcements-page">
      <div className="admin-announcements-container">
        {/* HEADER */}
        <header className="admin-announcements-header">
          <div>
            <div className="admin-announcements-eyebrow">
              <Megaphone size={14} />
              Communication management
            </div>

            <h1>Announcements</h1>

            <p>
              Create, publish and manage important information
              across the Kiangini ICT Centre portal.
            </p>
          </div>

          <div className="admin-announcements-header-actions">
            <button
              type="button"
              className="admin-announcements-refresh"
              onClick={() => fetchAnnouncements(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? 'admin-announcements-refresh-spin'
                    : ''
                }
              />
              Refresh
            </button>

            <Link
              to="/admin/announcements/new"
              className="admin-announcements-create"
            >
              <Plus size={18} />
              New announcement
            </Link>
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <div className="admin-announcements-alert">
            <AlertCircle size={19} />

            <div>
              <strong>Something went wrong</strong>
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* STATS */}
        <section className="admin-announcement-stats">
          <div className="admin-announcement-stat total">
            <div className="admin-announcement-stat-icon">
              <FileText size={20} />
            </div>

            <div>
              <strong>{stats.total}</strong>
              <span>Total announcements</span>
            </div>
          </div>

          <div className="admin-announcement-stat published">
            <div className="admin-announcement-stat-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <strong>{stats.published}</strong>
              <span>Published on this page</span>
            </div>
          </div>

          <div className="admin-announcement-stat drafts">
            <div className="admin-announcement-stat-icon">
              <Bell size={20} />
            </div>

            <div>
              <strong>{stats.drafts}</strong>
              <span>Drafts on this page</span>
            </div>
          </div>

          <div className="admin-announcement-stat urgent">
            <div className="admin-announcement-stat-icon">
              <AlertCircle size={20} />
            </div>

            <div>
              <strong>{stats.urgent}</strong>
              <span>Urgent on this page</span>
            </div>
          </div>
        </section>

        {/* TOOLBAR */}
        <section className="admin-announcement-toolbar">
          <div className="admin-announcement-search">
            <Search size={18} />

            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search announcements..."
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

          <div className="admin-announcement-filter">
            <Filter size={16} />

            <select
              value={typeFilter}
              onChange={handleTypeChange}
              aria-label="Filter by announcement type"
            >
              {TYPE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-announcement-filter">
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              aria-label="Filter by announcement status"
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* LIST */}
        <section className="admin-announcement-panel">
          <div className="admin-announcement-panel-header">
            <div>
              <span className="admin-announcement-panel-kicker">
                Content library
              </span>

              <h2>All announcements</h2>
            </div>

            <span className="admin-announcement-result-count">
              {totalCount} total
            </span>
          </div>

          {loading ? (
            <div className="admin-announcement-loading">
              <div className="admin-announcement-loader" />
              <strong>Loading announcements...</strong>
              <span>Retrieving communication records.</span>
            </div>
          ) : announcements.length === 0 ? (
            <div className="admin-announcement-empty">
              <div className="admin-announcement-empty-icon">
                <Megaphone size={26} />
              </div>

              <h3>No announcements found</h3>

              <p>
                Try changing your search or filters, or create
                your first announcement.
              </p>

              <Link
                to="/admin/announcements/new"
                className="admin-announcement-empty-button"
              >
                <Plus size={17} />
                Create announcement
              </Link>
            </div>
          ) : (
            <div className="admin-announcement-list">
              {announcements.map((announcement) => {
                const type = getTypeMeta(
                  announcement.announcement_type,
                );

                const isActionLoading =
                  actionLoading === announcement.id;

                return (
                  <article
                    className={`admin-announcement-item ${type.className}`}
                    key={announcement.id}
                  >
                    <div className="admin-announcement-type-icon">
                      <Megaphone size={19} />
                    </div>

                    <div className="admin-announcement-main">
                      <div className="admin-announcement-item-top">
                        <div className="admin-announcement-badges">
                          <span
                            className={`admin-announcement-type-badge ${type.className}`}
                          >
                            {type.label}
                          </span>

                          {announcement.is_published ? (
                            <span className="admin-announcement-status published">
                              <CheckCircle2 size={13} />
                              Published
                            </span>
                          ) : (
                            <span className="admin-announcement-status draft">
                              <XCircle size={13} />
                              Draft
                            </span>
                          )}
                        </div>

                        <div className="admin-announcement-menu-wrap">
                          <button
                            type="button"
                            className="admin-announcement-menu-button"
                            onClick={(event) => {
                              event.stopPropagation();

                              setOpenMenu(
                                openMenu === announcement.id
                                  ? null
                                  : announcement.id,
                              );
                            }}
                            aria-label="Announcement actions"
                          >
                            <MoreHorizontal size={19} />
                          </button>

                          {openMenu === announcement.id && (
                            <div
                              className="admin-announcement-menu"
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            >
                              <Link
                                to={`/admin/announcements/${announcement.id}`}
                              >
                                <Eye size={15} />
                                View
                              </Link>

                              <Link
                                to={`/admin/announcements/${announcement.id}/edit`}
                              >
                                <Edit3 size={15} />
                                Edit
                              </Link>

                              <button
                                type="button"
                                onClick={() =>
                                  handlePublishToggle(
                                    announcement,
                                  )
                                }
                                disabled={isActionLoading}
                              >
                                {announcement.is_published ? (
                                  <>
                                    <XCircle size={15} />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={15} />
                                    Publish
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                className="danger"
                                onClick={() => {
                                  setDeleteTarget(
                                    announcement,
                                  );
                                  setOpenMenu(null);
                                }}
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <Link
                        to={`/admin/announcements/${announcement.id}`}
                        className="admin-announcement-title"
                      >
                        {announcement.title}
                      </Link>

                      <p className="admin-announcement-message">
                        {getAnnouncementExcerpt(
                          announcement.message,
                        )}
                      </p>

                      <div className="admin-announcement-meta">
                        <span>
                          <CalendarDays size={14} />
                          {announcement.is_published
                            ? `Published ${formatDate(
                                announcement.published_at,
                              )}`
                            : `Created ${formatDate(
                                announcement.created_at,
                              )}`}
                        </span>

                        <span>
                          <Bell size={14} />
                          {announcement.created_by_name ||
                            'Kiangini ICT Centre'}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}
          {!loading &&
            announcements.length > 0 &&
            totalPages > 1 && (
              <div className="admin-announcement-pagination">
                <span>
                  Page {page} of {totalPages}
                </span>

                <div>
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1),
                      )
                    }
                  >
                    <ChevronLeft size={17} />
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          totalPages,
                          current + 1,
                        ),
                      )
                    }
                  >
                    Next
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            )}
        </section>

        {/* DELETE MODAL */}
        {deleteTarget && (
          <div className="admin-announcement-modal-backdrop">
            <div
              className="admin-announcement-delete-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-announcement-title"
            >
              <button
                type="button"
                className="admin-announcement-modal-close"
                onClick={() => setDeleteTarget(null)}
              >
                <X size={18} />
              </button>

              <div className="admin-delete-icon">
                <Trash2 size={22} />
              </div>

              <h2 id="delete-announcement-title">
                Delete announcement?
              </h2>

              <p>
                This will permanently delete{' '}
                <strong>{deleteTarget.title}</strong>.
                This action cannot be undone.
              </p>

              <div className="admin-delete-actions">
                <button
                  type="button"
                  className="admin-delete-cancel"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="admin-delete-confirm"
                  onClick={handleDelete}
                  disabled={actionLoading === deleteTarget.id}
                >
                  {actionLoading === deleteTarget.id
                    ? 'Deleting...'
                    : 'Delete announcement'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminAnnouncements;