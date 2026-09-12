import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import announcementService from '../../services/announcementService';

import './OfficerAnnouncements.css';

function formatDate(date) {
  if (!date) {
    return 'Not specified';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not specified';
  }

  return parsedDate.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatType(type) {
  if (!type) {
    return 'General';
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

function OfficerAnnouncements() {
  const navigate = useNavigate();
  const location = useLocation();

  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [successMessage, setSuccessMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadAnnouncements = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const data =
          await announcementService.getManagementAnnouncements();

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        setAnnouncements(items);
      } catch (requestError) {
        console.error(
          'Unable to load officer announcements:',
          requestError,
        );

        setError(
          'Unable to load announcements. Please try again.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const types = useMemo(() => {
    const values = announcements
      .map(
        (announcement) =>
          announcement.announcement_type,
      )
      .filter(Boolean)
      .map(formatType);

    return ['All', ...new Set(values)];
  }, [announcements]);

  const publishedCount = useMemo(
    () =>
      announcements.filter(
        (announcement) =>
          announcement.is_published,
      ).length,
    [announcements],
  );

  const draftCount = useMemo(
    () =>
      announcements.filter(
        (announcement) =>
          !announcement.is_published,
      ).length,
    [announcements],
  );

  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...announcements]
      .filter((announcement) => {
        const title =
          announcement.title?.toLowerCase() || '';

        const message =
          announcement.message?.toLowerCase() || '';

        const type = formatType(
          announcement.announcement_type,
        );

        const matchesSearch =
          !query ||
          title.includes(query) ||
          message.includes(query) ||
          type.toLowerCase().includes(query);

        const matchesType =
          typeFilter === 'All' ||
          type === typeFilter;

        const matchesStatus =
          statusFilter === 'All' ||
          (statusFilter === 'Published' &&
            announcement.is_published) ||
          (statusFilter === 'Draft' &&
            !announcement.is_published);

        return (
          matchesSearch &&
          matchesType &&
          matchesStatus
        );
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.published_at ||
            a.created_at ||
            0,
        );

        const dateB = new Date(
          b.published_at ||
            b.created_at ||
            0,
        );

        return dateB - dateA;
      });
  }, [
    announcements,
    search,
    typeFilter,
    statusFilter,
  ]);

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);

    try {
      await announcementService.deleteAnnouncement(
        deleteTarget.id,
      );

      setAnnouncements((current) =>
        current.filter(
          (announcement) =>
            announcement.id !==
            deleteTarget.id,
        ),
      );

      setDeleteTarget(null);
    } catch (requestError) {
      console.error(
        'Unable to delete announcement:',
        requestError,
      );

      setError(
        'Unable to delete this announcement. Please try again.',
      );
    } finally {
      setDeleting(false);
    }
  };

useEffect(() => {
  const message = location.state?.success;

  if (!message) {
    return undefined;
  }

  setSuccessMessage(message);

  navigate(location.pathname, {
    replace: true,
    state: {},
  });

  const timer = setTimeout(() => {
    setSuccessMessage('');
  }, 5000);

  return () => clearTimeout(timer);
}, [location, navigate]);

  return (
    <section className="officer-announcements-page">
      <div className="officer-page-container">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="officer-announcements-header">

          <div>
            <span className="officer-dashboard-eyebrow">
              Officer Portal
            </span>

            <h1>
              Announcement Management
            </h1>

            <p>
              Create, manage and publish important
              updates for students and the Kiangini
              ICT Centre community.
            </p>
          </div>

          <div className="officer-announcements-header-actions">

            <button
              type="button"
              className="officer-refresh-button"
              onClick={() =>
                loadAnnouncements(true)
              }
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? 'officer-refreshing'
                    : ''
                }
              />

              {refreshing
                ? 'Refreshing...'
                : 'Refresh'}
            </button>

            <button
              type="button"
              className="btn btn-primary officer-create-button"
              onClick={() =>
                navigate(
                  '/officer/announcements/new',
                )
              }
            >
              <Plus size={17} />
              New Announcement
            </button>

          </div>
        </header>

        {successMessage && (
  <div className="officer-success-alert">
    <div className="officer-success-icon">
      <CheckCircle2 size={18} />
    </div>

    <div className="officer-success-content">
      <strong>Success</strong>
      <span>{successMessage}</span>
    </div>

    <button
      type="button"
      className="officer-success-close"
      onClick={() => setSuccessMessage('')}
      aria-label="Dismiss success message"
    >
      <X size={17} />
    </button>
  </div>
)}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="officer-announcements-error">

            <AlertCircle size={19} />

            <div>
              <strong>
                Something went wrong
              </strong>

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                loadAnnouncements()
              }
            >
              Try again
            </button>

          </div>
        )}

        {/* =====================================================
            STATISTICS
        ====================================================== */}

        {!loading && (
          <div className="officer-announcement-stats">

            <div className="officer-announcement-stat stat-blue">

              <div className="officer-stat-icon">
                <Bell size={20} />
              </div>

              <div>
                <span>
                  Total
                </span>

                <strong>
                  {announcements.length}
                </strong>
              </div>

            </div>

            <div className="officer-announcement-stat stat-emerald">

              <div className="officer-stat-icon">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <span>
                  Published
                </span>

                <strong>
                  {publishedCount}
                </strong>
              </div>

            </div>

            <div className="officer-announcement-stat stat-amber">

              <div className="officer-stat-icon">
                <Edit3 size={20} />
              </div>

              <div>
                <span>
                  Drafts
                </span>

                <strong>
                  {draftCount}
                </strong>
              </div>

            </div>

          </div>
        )}

        {/* =====================================================
            TOOLBAR
        ====================================================== */}

        {!loading && !error && (
          <div className="officer-announcements-toolbar">

            <div className="officer-announcement-search">

              <Search size={18} />

              <input
                type="search"
                value={search}
                placeholder="Search announcements..."
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  className="officer-search-clear"
                  onClick={() =>
                    setSearch('')
                  }
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}

            </div>

            <div className="officer-announcement-filters">

              <div className="officer-filter-group">

                <span>
                  Type
                </span>

                <div className="officer-filter-buttons">
                  {types.map((type) => (
                    <button
                      type="button"
                      key={type}
                      className={
                        typeFilter === type
                          ? 'officer-filter active'
                          : 'officer-filter'
                      }
                      onClick={() =>
                        setTypeFilter(type)
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>

              </div>

              <div className="officer-filter-group">

                <span>
                  Status
                </span>

                <div className="officer-filter-buttons">
                  {[
                    'All',
                    'Published',
                    'Draft',
                  ].map((status) => (
                    <button
                      type="button"
                      key={status}
                      className={
                        statusFilter === status
                          ? 'officer-filter active'
                          : 'officer-filter'
                      }
                      onClick={() =>
                        setStatusFilter(status)
                      }
                    >
                      {status}
                    </button>
                  ))}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =====================================================
            RESULTS
        ====================================================== */}

        {loading ? (
          <div className="officer-announcements-loading">

            <div className="officer-loading-spinner" />

            <strong>
              Loading announcements
            </strong>

            <span>
              Retrieving announcement management
              data...
            </span>

          </div>
        ) : (
          !error && (
            <>
              <div className="officer-results-header">

                <div>
                  <h2>
                    All Announcements
                  </h2>

                  <p>
                    {filteredAnnouncements.length}{' '}
                    {filteredAnnouncements.length === 1
                      ? 'announcement'
                      : 'announcements'}{' '}
                    shown
                  </p>
                </div>

              </div>

              {filteredAnnouncements.length > 0 ? (
                <div className="officer-announcement-list">

                  {filteredAnnouncements.map(
                    (announcement) => {
                      const type =
                        announcement.announcement_type ||
                        'general';

                      return (
                        <article
                          className={`officer-announcement-card ${
                            !announcement.is_published
                              ? 'is-draft'
                              : ''
                          }`}
                          key={announcement.id}
                        >

                          <div
                            className={`officer-announcement-icon announcement-icon-${type}`}
                          >
                            <Bell size={21} />
                          </div>

                          <div className="officer-announcement-main">

                            <div className="officer-announcement-meta">

                              <span className="officer-type-badge">
                                {formatType(type)}
                              </span>

                              {announcement.is_published ? (
                                <span className="officer-status-badge published">
                                  <CheckCircle2
                                    size={12}
                                  />
                                  Published
                                </span>
                              ) : (
                                <span className="officer-status-badge draft">
                                  <Edit3
                                    size={12}
                                  />
                                  Draft
                                </span>
                              )}

                              <span className="officer-announcement-date">
                                <CalendarDays
                                  size={13}
                                />

                                {formatDate(
                                  announcement.published_at ||
                                    announcement.created_at,
                                )}
                              </span>

                            </div>

                            <h3>
                              {announcement.title}
                            </h3>

                            <p>
                              {announcement.message}
                            </p>

                            <div className="officer-announcement-footer">

                              <span>
                                By{' '}
                                {announcement.created_by_name ||
                                  'Kiangini ICT Centre'}
                              </span>

                              <Link
                                to={`/announcements/${announcement.id}`}
                                className="officer-view-link"
                              >
                                View
                                <ChevronRight
                                  size={15}
                                />
                              </Link>

                            </div>

                          </div>

                          <div className="officer-announcement-actions">

                            <button
                              type="button"
                              className="officer-action edit"
                              onClick={() =>
                                navigate(
                                  `/officer/announcements/${announcement.id}/edit`,
                                )
                              }
                              title="Edit announcement"
                              aria-label="Edit announcement"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              className="officer-action delete"
                              onClick={() =>
                                setDeleteTarget(
                                  announcement,
                                )
                              }
                              title="Delete announcement"
                              aria-label="Delete announcement"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                        </article>
                      );
                    },
                  )}

                </div>
              ) : (
                <div className="officer-announcements-empty">

                  <div className="officer-empty-icon">
                    <Search size={25} />
                  </div>

                  <h3>
                    No announcements found
                  </h3>

                  <p>
                    No announcements match your
                    current search and filters.
                  </p>

                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setSearch('');
                      setTypeFilter('All');
                      setStatusFilter('All');
                    }}
                  >
                    Clear Filters
                  </button>

                </div>
              )}
            </>
          )
        )}

      </div>

      {/* =======================================================
          DELETE CONFIRMATION
      ======================================================== */}

      {deleteTarget && (
        <div
          className="officer-delete-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deleting
            ) {
              setDeleteTarget(null);
            }
          }}
        >

          <div className="officer-delete-modal">

            <button
              type="button"
              className="officer-modal-close"
              onClick={() =>
                !deleting &&
                setDeleteTarget(null)
              }
              aria-label="Close confirmation"
              disabled={deleting}
            >
              <XCircle size={19} />
            </button>

            <div className="officer-delete-icon">
              <Trash2 size={23} />
            </div>

            <span>
              Delete announcement
            </span>

            <h2>
              Are you sure?
            </h2>

            <p>
              You are about to permanently delete
              <strong>
                {' '}
                “{deleteTarget.title}”
              </strong>
              . This action cannot be undone.
            </p>

            <div className="officer-delete-actions">

              <button
                type="button"
                className="btn btn-outline"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="officer-delete-confirm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <RefreshCw
                      size={15}
                      className="officer-refreshing"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Delete
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}
    </section>
  );
}

export default OfficerAnnouncements;