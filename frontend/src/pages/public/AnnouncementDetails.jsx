
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  Megaphone,
} from 'lucide-react';

import announcementService from '../../services/announcementService';

import './AnnouncementDetails.css';

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
    month: 'long',
    year: 'numeric',
  });
}

function formatType(type) {
  if (!type) {
    return 'General';
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

function AnnouncementDetails() {
  const { id } = useParams();

  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnnouncement = async () => {
      setLoading(true);
      setError('');

      try {
        const data =
          await announcementService.getAnnouncement(id);

        setAnnouncement(data);
      } catch (requestError) {
        console.error(
          'Unable to load announcement:',
          requestError,
        );

        setAnnouncement(null);

        if (
          requestError?.response?.status === 404
        ) {
          setError(
            'The announcement you are looking for does not exist or is no longer available.',
          );
        } else {
          setError(
            'Unable to load this announcement. Please try again.',
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAnnouncement();
    }
  }, [id]);

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="announcement-details-page">
        <section className="announcement-details-state">
          <div className="container">
            <div className="announcement-state-card">
              <LoaderCircle
                size={28}
                className="announcement-loading-icon"
              />

              <strong>
                Loading announcement
              </strong>

              <span>
                Please wait while we retrieve the
                announcement details.
              </span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /*
   * Error / Not found
   */
  if (error || !announcement) {
    return (
      <div className="announcement-details-page">
        <section className="announcement-not-found">
          <div className="container">
            <div className="announcement-not-found-card">

              <div className="announcement-not-found-icon">
                <AlertCircle size={28} />
              </div>

              <span className="section-label">
                Announcement
              </span>

              <h1>
                {error
                  ? 'Announcement unavailable'
                  : 'Announcement not found'}
              </h1>

              <p>
                {error ||
                  'The announcement you are looking for may have been removed or is no longer available.'}
              </p>

              <div className="announcement-not-found-actions">
                <Link
                  to="/announcements"
                  className="btn btn-primary"
                >
                  Back to Announcements
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/"
                  className="btn btn-outline"
                >
                  Go Home
                </Link>
              </div>

            </div>
          </div>
        </section>
      </div>
    );
  }

  const announcementType =
    announcement.announcement_type || 'general';

  const publishedDate =
    announcement.published_at ||
    announcement.created_at;

  return (
    <div className="announcement-details-page">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="announcement-details-hero">
        <div className="container">

          <Link
            to="/announcements"
            className="announcement-back-link"
          >
            <ArrowLeft size={17} />
            Back to announcements
          </Link>

          <div className="announcement-details-hero-content">

            <div className="announcement-details-meta">

              <span
                className={`announcement-category announcement-category-${announcementType}`}
              >
                <Megaphone size={14} />
                {formatType(announcementType)}
              </span>

              {announcement.is_published && (
                <span className="announcement-important">
                  <CheckCircle2 size={14} />
                  Published
                </span>
              )}

            </div>

            <h1>
              {announcement.title}
            </h1>

            <div className="announcement-details-date">
              <CalendarDays size={17} />

              <span>
                Published {formatDate(publishedDate)}
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="section announcement-details-section">
        <div className="container">

          <div className="announcement-details-layout">

            {/* Main content */}

            <article className="announcement-details-content">

              <div className="announcement-details-intro">
                {announcement.message}
              </div>

              <div className="announcement-details-divider" />

              <div className="announcement-message">
                {announcement.message
                  ?.split('\n')
                  .map((paragraph, index) => (
                    <p key={index}>
                      {paragraph}
                    </p>
                  ))}
              </div>

              <div className="announcement-details-author">

                <div className="announcement-author-icon">
                  <Bell size={18} />
                </div>

                <div>
                  <span>
                    Published by
                  </span>

                  <strong>
                    {announcement.created_by_name ||
                      'Kiangini ICT Centre'}
                  </strong>
                </div>

              </div>

            </article>

            {/* Sidebar */}

            <aside className="announcement-details-sidebar">

              <div className="announcement-info-card">

                <div className="announcement-info-icon">
                  <Bell size={21} />
                </div>

                <span>
                  ANNOUNCEMENT
                </span>

                <h3>
                  Stay informed
                </h3>

                <p>
                  Keep checking the Kiangini ICT Centre
                  platform for the latest updates, notices,
                  events and important information.
                </p>

                <Link
                  to="/announcements"
                  className="announcement-sidebar-link"
                >
                  View all announcements
                  <ArrowRight size={15} />
                </Link>

              </div>

              <div className="announcement-help-card">

                <Megaphone size={19} />

                <div>
                  <strong>
                    Need assistance?
                  </strong>

                  <p>
                    Our ICT support team is ready to help.
                  </p>

                  <Link to="/contact">
                    Contact Support
                    <ArrowRight size={15} />
                  </Link>
                </div>

              </div>

            </aside>

          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="announcement-details-cta">
        <div className="container">

          <div className="announcement-details-cta-card">

            <div>
              <span>
                KIANGINI ICT CENTRE
              </span>

              <h2>
                Need more information?
              </h2>

              <p>
                Explore our services or contact the ICT
                Centre support team for assistance.
              </p>
            </div>

            <div className="announcement-details-cta-actions">

              <Link
                to="/services"
                className="btn btn-white"
              >
                Explore Services
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/contact"
                className="announcement-details-cta-contact"
              >
                Contact Us
              </Link>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

export default AnnouncementDetails;