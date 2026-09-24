import {
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../../config/api';

import './AdminBookings.css';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

const getResults = (data) => {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.results) ? data.results : [];
};

const getTotal = (data, fallback) => {
  if (typeof data?.count === 'number') return data.count;
  return fallback;
};

const getErrorMessage = (error) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  'Unable to load bookings. Please try again.';

const getStudentName = (booking) => {
  const user = booking?.user;

  if (typeof user === 'string') return user;

  if (user?.first_name || user?.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }

  return (
    user?.name ||
    user?.full_name ||
    user?.email ||
    booking?.user_name ||
    booking?.student_name ||
    'Unknown student'
  );
};

const getFacilityName = (booking) =>
  booking?.facility_name ||
  booking?.facility?.name ||
  booking?.facility?.title ||
  'Unknown facility';

const getStatus = (booking) =>
  String(booking?.status || 'pending').toLowerCase();

const getStatusLabel = (status) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return '—';

  const parts = String(value).split(':');

  if (parts.length < 2) return value;

  const hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) return value;

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
};

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [openMenu, setOpenMenu] = useState(null);

  const loadBookings = useCallback(async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {
        page,
        page_size: PAGE_SIZE,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status !== 'all') {
        params.status = status;
      }

      const response = await api.get('/bookings/management/', {
        params,
      });

      const data = response.data;

      setBookings(getResults(data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBookings();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadBookings]);

  const summary = useMemo(() => {
    return bookings.reduce(
      (stats, booking) => {
        const currentStatus = getStatus(booking);

        stats.total += 1;

        if (currentStatus === 'pending') stats.pending += 1;
        if (currentStatus === 'approved') stats.approved += 1;
        if (currentStatus === 'rejected') stats.rejected += 1;
        if (currentStatus === 'cancelled') stats.cancelled += 1;
        if (currentStatus === 'completed') stats.completed += 1;

        return stats;
      },
      {
        total: bookings.length,
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
        completed: 0,
      },
    );
  }, [bookings]);

  const handleStatusUpdate = async (id, nextStatus) => {
    try {
      setError('');

      await api.patch(`/bookings/management/${id}/`, {
        status: nextStatus,
      });

      setOpenMenu(null);
      await loadBookings(true);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          `Unable to ${nextStatus} this booking.`,
      );
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(
      getTotal(
        {
          count: bookings.length,
        },
        bookings.length,
      ) / PAGE_SIZE,
    ),
  );

  return (
    <main className="admin-bookings">
      <div className="admin-bookings-container">
        <header className="admin-bookings-header">
          <div>
            <span className="admin-bookings-eyebrow">
              <CalendarCheck size={15} />
              Operations
            </span>

            <h1>Bookings Management</h1>

            <p>
              Review, approve and manage ICT facility bookings across
              Kiangini ICT Centre.
            </p>
          </div>

          <button
            type="button"
            className="admin-bookings-refresh"
            onClick={() => loadBookings(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? 'admin-refresh-spinning' : ''}
            />
            Refresh
          </button>
        </header>

        {error && (
          <div className="admin-bookings-alert">
            <XCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="admin-booking-summary">
          <article className="admin-booking-stat total">
            <div className="admin-booking-stat-icon">
              <CalendarCheck size={19} />
            </div>
            <div>
              <strong>{summary.total}</strong>
              <span>Bookings</span>
            </div>
          </article>

          <article className="admin-booking-stat pending">
            <div className="admin-booking-stat-icon">
              <Clock3 size={19} />
            </div>
            <div>
              <strong>{summary.pending}</strong>
              <span>Pending</span>
            </div>
          </article>

          <article className="admin-booking-stat approved">
            <div className="admin-booking-stat-icon">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <strong>{summary.approved}</strong>
              <span>Approved</span>
            </div>
          </article>

          <article className="admin-booking-stat rejected">
            <div className="admin-booking-stat-icon">
              <XCircle size={19} />
            </div>
            <div>
              <strong>{summary.rejected}</strong>
              <span>Rejected</span>
            </div>
          </article>
        </section>

        <section className="admin-bookings-panel">
          <div className="admin-bookings-toolbar">
            <div className="admin-bookings-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search student, facility or purpose..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="admin-bookings-filter">
              <Filter size={17} />

              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-bookings-table-wrapper">
            <table className="admin-bookings-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Facility</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7">
                      <div className="admin-bookings-loading">
                        <RefreshCw className="admin-refresh-spinning" size={22} />
                        Loading bookings...
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="admin-bookings-empty">
                        <CalendarCheck size={28} />
                        <strong>No bookings found</strong>
                        <span>
                          Try changing your search or status filter.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => {
                    const currentStatus = getStatus(booking);

                    return (
                      <tr key={booking.id}>
                        <td>
                          <div className="admin-booking-student">
                            <span className="admin-booking-avatar">
                              {getStudentName(booking)
                                .charAt(0)
                                .toUpperCase()}
                            </span>

                            <div>
                              <strong>{getStudentName(booking)}</strong>
                              <small>
                                {booking?.user?.email ||
                                  booking?.user_email ||
                                  ''}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong>{getFacilityName(booking)}</strong>
                        </td>

                        <td>{formatDate(booking.booking_date)}</td>

                        <td>
                          {formatTime(booking.start_time)} –{' '}
                          {formatTime(booking.end_time)}
                        </td>

                        <td>
                          <span className="admin-booking-purpose">
                            {booking.purpose || '—'}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`admin-booking-status ${currentStatus}`}
                          >
                            <span />
                            {getStatusLabel(currentStatus)}
                          </span>
                        </td>

                        <td>
                          <div className="admin-booking-actions">
                            <Link
                              to={`/admin/bookings/${booking.id}`}
                              className="admin-booking-icon-button"
                              title="View booking"
                            >
                              <Eye size={17} />
                            </Link>

                            <button
                              type="button"
                              className="admin-booking-icon-button"
                              onClick={() =>
                                setOpenMenu(
                                  openMenu === booking.id
                                    ? null
                                    : booking.id,
                                )
                              }
                              title="Booking actions"
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {openMenu === booking.id && (
                              <div className="admin-booking-menu">
                                {currentStatus === 'pending' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          booking.id,
                                          'approved',
                                        )
                                      }
                                    >
                                      <CheckCircle2 size={16} />
                                      Approve
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          booking.id,
                                          'rejected',
                                        )
                                      }
                                    >
                                      <XCircle size={16} />
                                      Reject
                                    </button>
                                  </>
                                )}

                                {currentStatus === 'approved' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        booking.id,
                                        'completed',
                                      )
                                    }
                                  >
                                    <CheckCircle2 size={16} />
                                    Mark completed
                                  </button>
                                )}

                                {(currentStatus === 'pending' ||
                                  currentStatus === 'approved') && (
                                  <button
                                    type="button"
                                    className="danger"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        booking.id,
                                        'cancelled',
                                      )
                                    }
                                  >
                                    <XCircle size={16} />
                                    Cancel booking
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <footer className="admin-bookings-pagination">
            <span>
              Page {page}
              {totalPages > 1 ? ` of ${totalPages}` : ''}
            </span>

            <div>
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <button
                type="button"
                disabled={
                  loading || bookings.length < PAGE_SIZE
                }
                onClick={() => setPage((current) => current + 1)}
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default AdminBookings;