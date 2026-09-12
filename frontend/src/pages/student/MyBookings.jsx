import { useCallback, useEffect, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Computer,
  FileText,
  LoaderCircle,
  Plus,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import './MyBookings.css';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const loadBookings = useCallback(
    async (showRefreshState = false) => {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const data = await bookingService.getBookings();

        setBookings(Array.isArray(data) ? data : []);
      } catch (requestError) {
        console.error(
          'Unable to load bookings:',
          requestError,
        );

        if (requestError?.response?.status === 401) {
          setError(
            'Your session has expired. Please log in again.',
          );
        } else {
          setError(
            'Unable to load your bookings. Please try again.',
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const formatDate = (date) => {
    if (!date) {
      return '—';
    }

    const formattedDate = new Date(
      `${date}T00:00:00`,
    );

    if (Number.isNaN(formattedDate.getTime())) {
      return date;
    }

    return formattedDate.toLocaleDateString(
      'en-US',
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      },
    );
  };

  const formatTime = (time) => {
    if (!time) {
      return '—';
    }

    const [hours, minutes] = time.split(':');

    if (
      hours === undefined ||
      minutes === undefined
    ) {
      return time;
    }

    const formattedTime = new Date();

    formattedTime.setHours(
      Number(hours),
      Number(minutes),
      0,
      0,
    );

    return formattedTime.toLocaleTimeString(
      'en-US',
      {
        hour: 'numeric',
        minute: '2-digit',
      },
    );
  };

  const formatTimeRange = (booking) => {
    if (
      !booking.start_time ||
      !booking.end_time
    ) {
      return 'Time not specified';
    }

    return `${formatTime(
      booking.start_time,
    )} – ${formatTime(booking.end_time)}`;
  };

  const formatStatus = (status) => {
    if (!status) {
      return 'Unknown';
    }

    return status
      .charAt(0)
      .toUpperCase() + status.slice(1);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 size={15} />;

      case 'rejected':
        return <XCircle size={15} />;

      case 'cancelled':
        return <XCircle size={15} />;

      case 'completed':
        return <CheckCircle2 size={15} />;

      case 'pending':
      default:
        return <Clock3 size={15} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'approved';

      case 'rejected':
        return 'rejected';

      case 'cancelled':
        return 'cancelled';

      case 'completed':
        return 'completed';

      case 'pending':
      default:
        return 'pending';
    }
  };

  const canCancel = (booking) => {
    return (
      booking.status === 'pending' ||
      booking.status === 'approved'
    );
  };

  const handleCancel = async (booking) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel booking #${booking.id}?`,
    );

    if (!confirmed) {
      return;
    }

    setCancellingId(booking.id);
    setError('');

    try {
      const updatedBooking =
        await bookingService.cancelBooking(
          booking.id,
        );

      setBookings((currentBookings) =>
        currentBookings.map((currentBooking) =>
          currentBooking.id === booking.id
            ? updatedBooking
            : currentBooking,
        ),
      );
    } catch (requestError) {
      console.error(
        'Unable to cancel booking:',
        requestError,
      );

      const message =
        requestError?.response?.data?.detail ||
        'Unable to cancel this booking. Please try again.';

      setError(message);
    } finally {
      setCancellingId(null);
    }
  };

  const pendingCount = bookings.filter(
    (booking) => booking.status === 'pending',
  ).length;

  const approvedCount = bookings.filter(
    (booking) => booking.status === 'approved',
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === 'completed',
  ).length;

  return (
    <section className="my-bookings-page">
      <div className="my-bookings-container">

        {/* Header */}
        <div className="my-bookings-header">
          <div>
            <span className="dashboard-eyebrow">
              Student Portal
            </span>

            <h1>My Bookings</h1>

            <p>
              View and manage your ICT Centre facility
              booking requests.
            </p>
          </div>

          <div className="my-bookings-header-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => loadBookings(true)}
              disabled={loading || refreshing}
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? 'my-bookings-refresh-icon'
                    : ''
                }
              />

              {refreshing
                ? 'Refreshing...'
                : 'Refresh'}
            </button>

            <Link
              to="/student/bookings/new"
              className="btn btn-primary"
            >
              <Plus size={18} />
              New Booking
            </Link>
          </div>
        </div>

        {/* Statistics */}
        {!loading && !error && (
          <div className="my-bookings-stats">

            <div className="booking-stat-card">
              <div className="booking-stat-icon total">
                <CalendarDays size={19} />
              </div>

              <div>
                <span>Total Bookings</span>
                <strong>{bookings.length}</strong>
              </div>
            </div>

            <div className="booking-stat-card">
              <div className="booking-stat-icon pending">
                <Clock3 size={19} />
              </div>

              <div>
                <span>Pending</span>
                <strong>{pendingCount}</strong>
              </div>
            </div>

            <div className="booking-stat-card">
              <div className="booking-stat-icon approved">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <span>Approved</span>
                <strong>{approvedCount}</strong>
              </div>
            </div>

            <div className="booking-stat-card">
              <div className="booking-stat-icon completed">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
              </div>
            </div>

          </div>
        )}

        {/* Error */}
        {error && (
          <div className="my-bookings-error">
            <div>
              <XCircle size={20} />

              <div>
                <strong>
                  Unable to load bookings
                </strong>

                <p>{error}</p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => loadBookings()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="my-bookings-loading">
            <LoaderCircle
              size={30}
              className="my-bookings-loader"
            />

            <strong>
              Loading your bookings...
            </strong>

            <p>
              Please wait while we retrieve your
              booking history.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          bookings.length === 0 && (
            <div className="my-bookings-empty">

              <div className="my-bookings-empty-icon">
                <CalendarDays size={34} />
              </div>

              <span className="dashboard-eyebrow">
                No bookings yet
              </span>

              <h2>
                You haven't made any bookings
              </h2>

              <p>
                When you request an ICT facility,
                your booking will appear here so you
                can track its status.
              </p>

              <Link
                to="/student/bookings/new"
                className="btn btn-primary"
              >
                <Plus size={18} />
                Make Your First Booking
              </Link>

            </div>
          )}

        {/* Booking List */}
        {!loading &&
          !error &&
          bookings.length > 0 && (
            <div className="my-bookings-content">

              <div className="my-bookings-list-header">
                <div>
                  <h2>Booking History</h2>

                  <p>
                    {bookings.length}{' '}
                    {bookings.length === 1
                      ? 'booking'
                      : 'bookings'}{' '}
                    found
                  </p>
                </div>
              </div>

              <div className="my-bookings-list">

                {bookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="booking-history-card"
                  >

                    {/* Card top */}
                    <div className="booking-history-top">

                      <div className="booking-history-facility">

                        <div className="booking-history-icon">
                          <Computer size={21} />
                        </div>

                        <div>
                          <span>
                            Facility
                          </span>

                          <h3>
                            {booking.facility_name ||
                              'ICT Facility'}
                          </h3>
                        </div>

                      </div>

                      <div
                        className={`booking-status ${getStatusClass(
                          booking.status,
                        )}`}
                      >
                        {getStatusIcon(
                          booking.status,
                        )}

                        <span>
                          {formatStatus(
                            booking.status,
                          )}
                        </span>
                      </div>

                    </div>

                    {/* Details */}
                    <div className="booking-history-details">

                      <div className="booking-detail-item">
                        <CalendarDays size={17} />

                        <div>
                          <span>
                            Date
                          </span>

                          <strong>
                            {formatDate(
                              booking.booking_date,
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="booking-detail-item">
                        <Clock3 size={17} />

                        <div>
                          <span>
                            Time
                          </span>

                          <strong>
                            {formatTimeRange(
                              booking,
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="booking-detail-item">
                        <FileText size={17} />

                        <div>
                          <span>
                            Purpose
                          </span>

                          <strong>
                            {booking.purpose ||
                              'No purpose provided'}
                          </strong>
                        </div>
                      </div>

                    </div>

                    {/* Rejection reason */}
                    {booking.status ===
                      'rejected' &&
                      booking.rejection_reason && (
                        <div className="booking-rejection">
                          <XCircle size={18} />

                          <div>
                            <strong>
                              Rejection reason
                            </strong>

                            <p>
                              {
                                booking.rejection_reason
                              }
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Footer */}
                    <div className="booking-history-footer">

                      <span className="booking-reference">
                        Booking #
                        {booking.id}
                      </span>

                      <div className="booking-history-actions">

                        {canCancel(booking) && (
                          <button
                            type="button"
                            className="booking-cancel-button"
                            onClick={() =>
                              handleCancel(
                                booking,
                              )
                            }
                            disabled={
                              cancellingId ===
                              booking.id
                            }
                          >
                            {cancellingId ===
                            booking.id ? (
                              <>
                                <LoaderCircle
                                  size={16}
                                  className="my-bookings-loader"
                                />

                                Cancelling...
                              </>
                            ) : (
                              <>
                                <XCircle
                                  size={16}
                                />

                                Cancel Booking
                              </>
                            )}
                          </button>
                        )}

                      </div>

                    </div>

                  </article>
                ))}

              </div>

            </div>
          )}

      </div>
    </section>
  );
}

export default MyBookings;