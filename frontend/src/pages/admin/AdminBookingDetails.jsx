import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  User,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import api from '../../config/api';

import './AdminBookingDetails.css';

const getStatus = (booking) =>
  String(booking?.status || 'pending').toLowerCase();

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

const getStudentEmail = (booking) =>
  booking?.user?.email ||
  booking?.user_email ||
  booking?.student_email ||
  'Not provided';

const getFacilityName = (booking) =>
  booking?.facility_name ||
  booking?.facility?.name ||
  booking?.facility?.title ||
  'Unknown facility';

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-KE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
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

const getErrorMessage = (error) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  'Unable to load booking details.';

function AdminBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBooking = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/bookings/management/${id}/`);

      setBooking(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const updateStatus = async (status) => {
    try {
      setActionLoading(true);
      setError('');

      const response = await api.patch(`/bookings/management/${id}/`, {
        status,
      });

      setBooking(response.data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          `Unable to ${status} this booking.`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="admin-booking-details">
        <div className="admin-booking-details-loading">
          <Clock3 className="admin-booking-spin" size={25} />
          <span>Loading booking details...</span>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="admin-booking-details">
        <div className="admin-booking-details-container">
          <Link to="/admin/bookings" className="admin-booking-back">
            <ArrowLeft size={17} />
            Back to bookings
          </Link>

          <div className="admin-booking-details-error">
            <XCircle size={30} />
            <h2>Booking not found</h2>
            <p>{error || 'The requested booking could not be found.'}</p>
          </div>
        </div>
      </main>
    );
  }

  const status = getStatus(booking);
  const studentName = getStudentName(booking);
  const studentEmail = getStudentEmail(booking);

  return (
    <main className="admin-booking-details">
      <div className="admin-booking-details-container">
        <div className="admin-booking-details-top">
          <Link to="/admin/bookings" className="admin-booking-back">
            <ArrowLeft size={17} />
            Back to bookings
          </Link>

          <span className={`admin-booking-detail-status ${status}`}>
            <span />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {error && (
          <div className="admin-booking-detail-alert">
            <XCircle size={18} />
            {error}
          </div>
        )}

        <header className="admin-booking-detail-header">
          <div>
            <span className="admin-booking-detail-kicker">
              Booking #{booking.id}
            </span>

            <h1>Booking Request</h1>

            <p>
              Review the booking information and manage its approval status.
            </p>
          </div>

          <div className="admin-booking-detail-actions">
            {status === 'pending' && (
              <>
                <button
                  type="button"
                  className="admin-booking-action reject"
                  disabled={actionLoading}
                  onClick={() => updateStatus('rejected')}
                >
                  <XCircle size={17} />
                  Reject
                </button>

                <button
                  type="button"
                  className="admin-booking-action approve"
                  disabled={actionLoading}
                  onClick={() => updateStatus('approved')}
                >
                  <CheckCircle2 size={17} />
                  Approve
                </button>
              </>
            )}

            {status === 'approved' && (
              <>
                <button
                  type="button"
                  className="admin-booking-action cancel"
                  disabled={actionLoading}
                  onClick={() => updateStatus('cancelled')}
                >
                  <XCircle size={17} />
                  Cancel
                </button>

                <button
                  type="button"
                  className="admin-booking-action approve"
                  disabled={actionLoading}
                  onClick={() => updateStatus('completed')}
                >
                  <CheckCircle2 size={17} />
                  Mark completed
                </button>
              </>
            )}
          </div>
        </header>

        <div className="admin-booking-detail-grid">
          <section className="admin-booking-detail-main">
            <article className="admin-booking-detail-card">
              <div className="admin-detail-card-heading">
                <div className="admin-detail-card-icon blue">
                  <CalendarDays size={19} />
                </div>

                <div>
                  <h2>Booking information</h2>
                  <span>Schedule and facility details</span>
                </div>
              </div>

              <div className="admin-booking-info-grid">
                <div className="admin-booking-info-item">
                  <span>Date</span>
                  <strong>{formatDate(booking.booking_date)}</strong>
                </div>

                <div className="admin-booking-info-item">
                  <span>Time</span>
                  <strong>
                    {formatTime(booking.start_time)} –{' '}
                    {formatTime(booking.end_time)}
                  </strong>
                </div>

                <div className="admin-booking-info-item">
                  <span>Facility</span>
                  <strong>{getFacilityName(booking)}</strong>
                </div>

                <div className="admin-booking-info-item">
                  <span>Booking ID</span>
                  <strong>#{booking.id}</strong>
                </div>
              </div>
            </article>

            <article className="admin-booking-detail-card">
              <div className="admin-detail-card-heading">
                <div className="admin-detail-card-icon cyan">
                  <FileText size={19} />
                </div>

                <div>
                  <h2>Purpose</h2>
                  <span>Reason provided for this booking</span>
                </div>
              </div>

              <div className="admin-booking-purpose-box">
                {booking.purpose || 'No purpose was provided.'}
              </div>
            </article>

            {booking.notes && (
              <article className="admin-booking-detail-card">
                <div className="admin-detail-card-heading">
                  <div className="admin-detail-card-icon amber">
                    <FileText size={19} />
                  </div>

                  <div>
                    <h2>Additional notes</h2>
                    <span>Extra information from the requester</span>
                  </div>
                </div>

                <div className="admin-booking-purpose-box">
                  {booking.notes}
                </div>
              </article>
            )}
          </section>

          <aside className="admin-booking-detail-sidebar">
            <article className="admin-booking-detail-card">
              <div className="admin-detail-card-heading">
                <div className="admin-detail-card-icon indigo">
                  <User size={19} />
                </div>

                <div>
                  <h2>Requester</h2>
                  <span>Student account</span>
                </div>
              </div>

              <div className="admin-requester">
                <div className="admin-requester-avatar">
                  {studentName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{studentName}</strong>
                  <span>{studentEmail}</span>
                </div>
              </div>

              <div className="admin-requester-meta">
                {booking?.user?.student_id && (
                  <div>
                    <span>Student ID</span>
                    <strong>{booking.user.student_id}</strong>
                  </div>
                )}

                {booking?.user?.course && (
                  <div>
                    <span>Course</span>
                    <strong>{booking.user.course}</strong>
                  </div>
                )}

                {booking?.user?.phone && (
                  <div>
                    <span>Phone</span>
                    <strong>{booking.user.phone}</strong>
                  </div>
                )}
              </div>
            </article>

            <article className="admin-booking-detail-card">
              <div className="admin-detail-card-heading">
                <div className="admin-detail-card-icon emerald">
                  <MapPin size={19} />
                </div>

                <div>
                  <h2>Facility</h2>
                  <span>Requested ICT resource</span>
                </div>
              </div>

              <div className="admin-facility-preview">
                <strong>{getFacilityName(booking)}</strong>

                {booking?.facility?.description && (
                  <p>{booking.facility.description}</p>
                )}

                <div>
                  <MapPin size={15} />
                  {booking?.facility?.location ||
                    booking?.facility?.room ||
                    'Kiangini ICT Centre'}
                </div>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default AdminBookingDetails;