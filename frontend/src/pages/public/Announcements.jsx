import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  CalendarDays,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import announcementService from '../../services/announcementService';

import './Announcements.css';

function formatDate(date) {
  if (!date) {
    return '—';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
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

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
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

        setAnnouncements(
          Array.isArray(data) ? data : [],
        );
      } catch (requestError) {
        console.error(
          'Unable to load announcements:',
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

  const sortedAnnouncements = useMemo(() => {
    return [...announcements].sort((a, b) => {
      const dateA = new Date(
        a.published_at || a.created_at || 0,
      );

      const dateB = new Date(
        b.published_at || b.created_at || 0,
      );

      return dateB - dateA;
    });
  }, [announcements]);

  return (
    <section className="announcements-page">
      <div className="container">
        <header className="announcements-header">
          <div>
            <span className="section-label">
              <Bell size={15} />
              Centre Updates
            </span>

            <h1 className="section-title">
              Announcements
            </h1>

            <p className="section-description">
              Stay updated with the latest news,
              system updates, events and important
              information from Kiangini ICT Centre.
            </p>
          </div>

          {!loading && announcements.length > 0 && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => loadAnnouncements(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? 'announcements-refreshing'
                    : ''
                }
              />

              {refreshing
                ? 'Refreshing...'
                : 'Refresh'}
            </button>
          )}
        </header>

        {error && (
          <div className="announcements-error">
            <AlertCircle size={19} />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadAnnouncements()}
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="announcements-state">
            <div className="announcements-spinner" />

            <strong>
              Loading announcements
            </strong>

            <span>
              Please wait while we retrieve the
              latest updates.
            </span>
          </div>
        ) : sortedAnnouncements.length === 0 ? (
          <div className="announcements-state">
            <div className="announcements-empty-icon">
              <Bell size={26} />
            </div>

            <strong>
              No announcements yet
            </strong>

            <span>
              There are currently no published
              announcements from the ICT Centre.
            </span>
          </div>
        ) : (
          <div className="announcements-grid">
            {sortedAnnouncements.map(
              (announcement) => (
                <article
                  key={announcement.id}
                  className="announcement-card"
                >
                  <div className="announcement-card-top">
                    <span
                      className={`announcement-type announcement-type-${announcement.announcement_type}`}
                    >
                      {formatType(
                        announcement.announcement_type,
                      )}
                    </span>

                    <span className="announcement-date">
                      <CalendarDays size={14} />

                      {formatDate(
                        announcement.published_at ||
                          announcement.created_at,
                      )}
                    </span>
                  </div>

                  <h2>
                    {announcement.title}
                  </h2>

                  <p>
                    {announcement.message}
                  </p>

                  <div className="announcement-card-footer">
                    <span>
                      {announcement.created_by_name ||
                        'Kiangini ICT Centre'}
                    </span>

                    <Link
                      to={`/announcements/${announcement.id}`}
                      className="announcement-read-more"
                    >
                      Read more
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Announcements;