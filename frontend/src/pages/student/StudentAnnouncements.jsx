import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  CalendarDays,
  ChevronRight,
  RefreshCw,
  Search,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import announcementService from '../../services/announcementService';

import './StudentAnnouncements.css';

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

function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

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
          await announcementService.getAnnouncements();

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        setAnnouncements(items);
      } catch (requestError) {
        console.error(
          'Unable to load student announcements:',
          requestError,
        );

        setAnnouncements([]);

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

  /*
   * Announcement categories
   */
  const categories = useMemo(() => {
    const types = announcements
      .map(
        (announcement) =>
          announcement.announcement_type,
      )
      .filter(Boolean)
      .map(formatType);

    return ['All', ...new Set(types)];
  }, [announcements]);

  /*
   * Filter announcements
   */
  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return announcements
      .filter((announcement) => {
        const announcementType =
          formatType(
            announcement.announcement_type,
          );

        const title =
          announcement.title?.toLowerCase() || '';

        const message =
          announcement.message?.toLowerCase() || '';

        const type =
          announcementType.toLowerCase();

        const matchesCategory =
          category === 'All' ||
          announcementType === category;

        const matchesSearch =
          !query ||
          title.includes(query) ||
          message.includes(query) ||
          type.includes(query);

        return (
          announcement.is_published &&
          matchesCategory &&
          matchesSearch
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
  }, [announcements, search, category]);

  /*
   * Statistics
   */
  const publishedCount = useMemo(() => {
    return announcements.filter(
      (announcement) =>
        announcement.is_published,
    ).length;
  }, [announcements]);

  const importantCount = useMemo(() => {
    return announcements.filter(
      (announcement) =>
        announcement.announcement_type ===
          'important' ||
        announcement.announcement_type ===
          'urgent',
    ).length;
  }, [announcements]);

  return (
    <section className="student-announcements-page">
      <div className="student-page-container">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="student-announcements-header">

          <div>
            <span className="dashboard-eyebrow">
              Student Portal
            </span>

            <h1>
              Announcements
            </h1>

            <p>
              Stay updated with important notices,
              ICT services, facility updates and other
              information from Kiangini ICT Centre.
            </p>
          </div>

          <div className="announcements-header-actions">

            <button
              type="button"
              className="announcements-refresh-btn"
              onClick={() =>
                loadAnnouncements(true)
              }
              disabled={refreshing}
              aria-label="Refresh announcements"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? 'announcements-refreshing'
                    : ''
                }
              />

              <span>
                {refreshing
                  ? 'Refreshing...'
                  : 'Refresh'}
              </span>
            </button>

            <div className="announcements-header-icon">
              <Bell size={28} />
            </div>

          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="student-announcements-error">

            <AlertCircle size={19} />

            <div>
              <strong>
                Unable to load announcements
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
          <div className="announcement-stats">

            <div className="announcement-stat-card announcement-stat-blue">
              <div className="announcement-stat-icon">
                <Bell size={20} />
              </div>

              <div>
                <span>
                  Total Announcements
                </span>

                <strong>
                  {announcements.length}
                </strong>
              </div>
            </div>

            <div className="announcement-stat-card announcement-stat-emerald">
              <div className="announcement-stat-icon">
                <CalendarDays size={20} />
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

            <div className="announcement-stat-card announcement-stat-amber">
              <div className="announcement-stat-icon">
                <Star size={20} />
              </div>

              <div>
                <span>
                  Important
                </span>

                <strong>
                  {importantCount}
                </strong>
              </div>
            </div>

          </div>
        )}

        {/* =====================================================
            TOOLBAR
        ====================================================== */}

        {!loading && !error && (
          <div className="announcements-toolbar">

            <div className="announcement-search">

              <Search size={19} />

              <input
                type="search"
                placeholder="Search announcements..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  className="announcement-search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}

            </div>

            <div className="announcement-filters">

              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={
                    category === item
                      ? 'announcement-filter active'
                      : 'announcement-filter'
                  }
                  onClick={() =>
                    setCategory(item)
                  }
                >
                  {item}
                </button>
              ))}

            </div>

          </div>
        )}

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading ? (
          <div className="student-announcements-loading">

            <div className="announcements-loading-spinner" />

            <strong>
              Loading announcements
            </strong>

            <span>
              Please wait while we retrieve the
              latest updates.
            </span>

          </div>
        ) : (
          <>
            {/* =================================================
                RESULTS HEADER
            ================================================== */}

            {!error && (
              <div className="announcements-results-header">

                <div>
                  <h2>
                    Latest Updates
                  </h2>

                  <p>
                    {filteredAnnouncements.length}{' '}
                    {filteredAnnouncements.length === 1
                      ? 'announcement'
                      : 'announcements'}{' '}
                    available
                  </p>
                </div>

              </div>
            )}

            {/* =================================================
                RESULTS
            ================================================== */}

            {!error &&
              filteredAnnouncements.length > 0 ? (
              <div className="student-announcements-list">

                {filteredAnnouncements.map(
                  (announcement) => {
                    const type =
                      announcement.announcement_type ||
                      'general';

                    const date =
                      announcement.published_at ||
                      announcement.created_at;

                    const isImportant =
                      type === 'important' ||
                      type === 'urgent';

                    return (
                      <article
                        className={`student-announcement-card ${
                          isImportant
                            ? 'is-important'
                            : ''
                        }`}
                        key={announcement.id}
                      >

                        <div
                          className={`student-announcement-card-icon announcement-icon-${type}`}
                        >
                          <Bell size={21} />
                        </div>

                        <div className="student-announcement-content">

                          <div className="student-announcement-meta">

                            <span className="announcement-category">
                              {formatType(type)}
                            </span>

                            {isImportant && (
                              <span className="announcement-priority">
                                <Star size={12} />
                                Important
                              </span>
                            )}

                            <span className="announcement-date">
                              <CalendarDays size={14} />

                              {formatDate(date)}
                            </span>

                          </div>

                          <h3>
                            {announcement.title}
                          </h3>

                          <p>
                            {announcement.message}
                          </p>

                          <Link
                            to={`/announcements/${announcement.id}`}
                            className="announcement-read-more"
                          >
                            Read announcement
                            <ChevronRight size={17} />
                          </Link>

                        </div>

                      </article>
                    );
                  },
                )}

              </div>
            ) : (
              !error && (
                <div className="announcements-empty">

                  <div className="announcements-empty-icon">
                    <Search size={25} />
                  </div>

                  <h3>
                    No announcements found
                  </h3>

                  <p>
                    We couldn't find any announcements
                    matching your search or selected
                    category.
                  </p>

                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setSearch('');
                      setCategory('All');
                    }}
                  >
                    Clear Filters
                  </button>

                </div>
              )
            )}
          </>
        )}

      </div>
    </section>
  );
}

export default StudentAnnouncements;