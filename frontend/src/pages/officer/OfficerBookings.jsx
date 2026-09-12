import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Search,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import officerBookingService from '../../services/officerBookingService';

import './OfficerBookings.css';

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

function getStatusIcon(status) {
  if (status === 'approved' || status === 'completed') {
    return CheckCircle2;
  }

  if (status === 'rejected' || status === 'cancelled') {
    return XCircle;
  }

  return Clock3;
}

function formatStatus(status) {
  return status?.charAt(0).toUpperCase() + status?.slice(1);
}

function OfficerBookings() {
  const [bookings, setBookings] = useState([]);
  const [activeStatus, setActiveStatus] = useState('');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data =
        await officerBookingService.getBookings(
          activeStatus,
        );

      setBookings(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error(
        'Unable to load officer bookings:',
        requestError,
      );

      setError(
        'Unable to load booking requests. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return bookings;
    }

    return bookings.filter((booking) => {
      const searchableText = [
        booking.user_name,
        booking.user_email,
        booking.facility_name,
        booking.purpose,
        booking.booking_date,
        booking.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [bookings, search]);

  return (
    <section className="officer-bookings-page">
      <div className="officer-bookings-container">
        <header className="officer-bookings-header">
          <div>
            <span className="dashboard-eyebrow">
              Booking Management
            </span>

            <h1>Booking Requests</h1>

            <p>
              Review and manage facility booking requests
              submitted by students.
            </p>
          </div>
        </header>

        <div className="officer-bookings-toolbar">
          <div className="officer-bookings-search">
            <Search size={18} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search student, facility or purpose..."
              aria-label="Search booking requests"
            />
          </div>

          <div className="officer-booking-filters">
            {statusFilters.map((filter) => (
              <button
                key={filter.value || 'all'}
                type="button"
                className={
                  activeStatus === filter.value
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveStatus(filter.value)
                }
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="officer-bookings-error">
            <XCircle size={19} />
            <span>{error}</span>

            <button
              type="button"
              onClick={loadBookings}
            >
              Try again
            </button>
          </div>
        )}

        <div className="officer-bookings-summary">
          <span>
            {loading
              ? 'Loading requests...'
              : `${filteredBookings.length} request${
                  filteredBookings.length === 1
                    ? ''
                    : 's'
                }`}
          </span>
        </div>

        {loading ? (
          <div className="officer-bookings-state">
            <div className="officer-bookings-spinner" />

            <strong>Loading booking requests</strong>

            <span>
              Please wait while we retrieve the latest
              requests.
            </span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="officer-bookings-state">
            <div className="officer-bookings-empty-icon">
              <CalendarCheck size={27} />
            </div>

            <strong>No booking requests found</strong>

            <span>
              {search
                ? 'Try changing your search terms.'
                : activeStatus
                  ? `There are no ${activeStatus} bookings.`
                  : 'There are currently no booking requests.'}
            </span>
          </div>
        ) : (
          <div className="officer-bookings-list">
            {filteredBookings.map((booking) => {
              const StatusIcon = getStatusIcon(
                booking.status,
              );

              return (
                <article
                  key={booking.id}
                  className="officer-booking-card"
                >
                  <div className="officer-booking-card-main">
                    <div className="officer-booking-icon">
                      <CalendarCheck size={21} />
                    </div>

                    <div className="officer-booking-info">
                      <div className="officer-booking-title-row">
                        <h2>
                          {booking.facility_name ||
                            'ICT Facility'}
                        </h2>

                        <span
                          className={`officer-booking-status status-${booking.status}`}
                        >
                          <StatusIcon size={14} />
                          {formatStatus(
                            booking.status,
                          )}
                        </span>
                      </div>

                      <div className="officer-booking-student">
                        <strong>
                          {booking.user_name ||
                            'Student'}
                        </strong>

                        <span>
                          {booking.user_email}
                        </span>
                      </div>

                      <p className="officer-booking-purpose">
                        {booking.purpose}
                      </p>

                      <div className="officer-booking-meta">
                        <span>
                          <strong>Date:</strong>{' '}
                          {booking.booking_date}
                        </span>

                        <span>
                          <strong>Time:</strong>{' '}
                          {booking.start_time} –{' '}
                          {booking.end_time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="officer-booking-card-action">
                    <Link
                      to={`/officer/bookings/${booking.id}`}
                      className="btn btn-outline"
                    >
                      Review
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default OfficerBookings;