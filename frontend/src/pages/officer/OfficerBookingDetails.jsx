import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Mail,
  MapPin,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import officerBookingService from '../../services/officerBookingService';

import './OfficerBookingDetails.css';

function formatStatus(status) {
  if (!status) {
    return '';
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(date) {
  if (!date) {
    return '—';
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  return parsedDate.toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function OfficerBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadBooking = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data =
        await officerBookingService.getBooking(id);

      setBooking(data);
    } catch (requestError) {
      console.error(
        'Unable to load booking:',
        requestError,
      );

      setError(
        'Unable to load this booking request. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const handleApprove = async () => {
    if (!booking) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to approve this booking request?',
    );

    if (!confirmed) {
      return;
    }

    setProcessing(true);
    setActionError('');
    setSuccessMessage('');

    try {
      const updatedBooking =
        await officerBookingService.approveBooking(
          booking.id,
        );

      setBooking(updatedBooking);
      setSuccessMessage(
        'Booking request approved successfully.',
      );
    } catch (requestError) {
      console.error(
        'Unable to approve booking:',
        requestError,
      );

      const detail =
        requestError.response?.data?.detail;

      setActionError(
        detail ||
          'Unable to approve this booking. Please try again.',
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();

    const reason = rejectionReason.trim();

    if (!reason) {
      setActionError(
        'Please provide a reason for rejecting this booking.',
      );

      return;
    }

    setProcessing(true);
    setActionError('');
    setSuccessMessage('');

    try {
      const updatedBooking =
        await officerBookingService.rejectBooking(
          booking.id,
          reason,
        );

      setBooking(updatedBooking);
      setShowRejectModal(false);
      setRejectionReason('');

      setSuccessMessage(
        'Booking request rejected successfully.',
      );
    } catch (requestError) {
      console.error(
        'Unable to reject booking:',
        requestError,
      );

      const responseError =
        requestError.response?.data;

      setActionError(
        responseError?.rejection_reason ||
          responseError?.detail ||
          'Unable to reject this booking. Please try again.',
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <section className="officer-booking-details-page">
        <div className="officer-booking-details-container">
          <div className="officer-details-state">
            <div className="officer-details-spinner" />

            <strong>Loading booking request</strong>

            <span>
              Retrieving the latest booking information...
            </span>
          </div>
        </div>
      </section>
    );
  }

  if (error || !booking) {
    return (
      <section className="officer-booking-details-page">
        <div className="officer-booking-details-container">
          <Link
            to="/officer/bookings"
            className="officer-details-back"
          >
            <ArrowLeft size={17} />
            Back to booking requests
          </Link>

          <div className="officer-details-state officer-details-error-state">
            <div className="officer-details-error-icon">
              <XCircle size={27} />
            </div>

            <strong>
              Unable to load booking
            </strong>

            <span>
              {error ||
                'The requested booking could not be found.'}
            </span>

            <button
              type="button"
              className="btn btn-primary"
              onClick={loadBooking}
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const isPending = booking.status === 'pending';

  return (
    <section className="officer-booking-details-page">
      <div className="officer-booking-details-container">
        <Link
          to="/officer/bookings"
          className="officer-details-back"
        >
          <ArrowLeft size={17} />
          Back to booking requests
        </Link>

        <header className="officer-details-header">
          <div>
            <span className="dashboard-eyebrow">
              Booking Request #{booking.id}
            </span>

            <h1>Review Booking</h1>

            <p>
              Review the student's request before taking
              an action.
            </p>
          </div>

          <span
            className={`officer-details-status status-${booking.status}`}
          >
            {formatStatus(booking.status)}
          </span>
        </header>

        {successMessage && (
          <div className="officer-details-success">
            <CheckCircle2 size={19} />
            <span>{successMessage}</span>
          </div>
        )}

        {actionError && (
          <div className="officer-details-action-error">
            <XCircle size={19} />
            <span>{actionError}</span>
          </div>
        )}

        <div className="officer-details-layout">
          <main className="officer-details-main">
            <section className="officer-details-card">
              <div className="officer-details-card-header">
                <div>
                  <span className="officer-details-label">
                    Request Information
                  </span>

                  <h2>Booking Details</h2>
                </div>

                <div className="officer-details-card-icon">
                  <CalendarDays size={21} />
                </div>
              </div>

              <div className="officer-details-grid">
                <div className="officer-detail-item">
                  <span className="officer-detail-item-label">
                    Facility
                  </span>

                  <strong>
                    {booking.facility_name ||
                      'ICT Facility'}
                  </strong>
                </div>

                <div className="officer-detail-item">
                  <span className="officer-detail-item-label">
                    Booking Date
                  </span>

                  <strong>
                    {formatDate(
                      booking.booking_date,
                    )}
                  </strong>
                </div>

                <div className="officer-detail-item">
                  <span className="officer-detail-item-label">
                    Start Time
                  </span>

                  <strong>
                    <Clock3 size={15} />
                    {booking.start_time}
                  </strong>
                </div>

                <div className="officer-detail-item">
                  <span className="officer-detail-item-label">
                    End Time
                  </span>

                  <strong>
                    <Clock3 size={15} />
                    {booking.end_time}
                  </strong>
                </div>
              </div>
            </section>

            <section className="officer-details-card">
              <div className="officer-details-card-header">
                <div>
                  <span className="officer-details-label">
                    Purpose
                  </span>

                  <h2>Reason for Booking</h2>
                </div>

                <div className="officer-details-card-icon">
                  <FileText size={21} />
                </div>
              </div>

              <div className="officer-purpose-box">
                {booking.purpose || 'No purpose provided.'}
              </div>

              {booking.notes && (
                <div className="officer-notes-section">
                  <span className="officer-detail-item-label">
                    Additional Notes
                  </span>

                  <p>{booking.notes}</p>
                </div>
              )}

              {booking.rejection_reason && (
                <div className="officer-rejection-box">
                  <span>
                    Rejection Reason
                  </span>

                  <p>
                    {booking.rejection_reason}
                  </p>
                </div>
              )}
            </section>

            {isPending && (
              <section className="officer-action-card">
                <div>
                  <span className="officer-details-label">
                    Decision
                  </span>

                  <h2>What would you like to do?</h2>

                  <p>
                    Approve the request if the facility
                    is available, or reject it with a
                    clear reason.
                  </p>
                </div>

                <div className="officer-action-buttons">
                  <button
                    type="button"
                    className="officer-approve-button"
                    onClick={handleApprove}
                    disabled={processing}
                  >
                    <CheckCircle2 size={18} />

                    {processing
                      ? 'Processing...'
                      : 'Approve Booking'}
                  </button>

                  <button
                    type="button"
                    className="officer-reject-button"
                    onClick={() => {
                      setActionError('');
                      setShowRejectModal(true);
                    }}
                    disabled={processing}
                  >
                    <XCircle size={18} />
                    Reject Booking
                  </button>
                </div>
              </section>
            )}
          </main>

          <aside className="officer-details-sidebar">
            <section className="officer-details-card">
              <div className="officer-details-card-header">
                <div>
                  <span className="officer-details-label">
                    Student
                  </span>

                  <h2>Requester</h2>
                </div>

                <div className="officer-details-card-icon">
                  <UserRound size={21} />
                </div>
              </div>

              <div className="officer-requester">
                <div className="officer-requester-avatar">
                  {booking.user_name
                    ?.charAt(0)
                    ?.toUpperCase() || 'S'}
                </div>

                <strong>
                  {booking.user_name || 'Student'}
                </strong>

                <span>
                  {booking.user_email ||
                    'No email available'}
                </span>
              </div>

              <div className="officer-requester-contact">
                <div>
                  <Mail size={15} />
                  <span>
                    {booking.user_email || '—'}
                  </span>
                </div>
              </div>
            </section>

            <section className="officer-details-card">
              <div className="officer-details-card-header">
                <div>
                  <span className="officer-details-label">
                    Status
                  </span>

                  <h2>Request Status</h2>
                </div>
              </div>

              <div
                className={`officer-status-large status-${booking.status}`}
              >
                {formatStatus(booking.status)}
              </div>

              <div className="officer-created-info">
                <span>Submitted</span>

                <strong>
                  {booking.created_at
                    ? new Date(
                        booking.created_at,
                      ).toLocaleString('en-KE')
                    : '—'}
                </strong>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {showRejectModal && (
        <div
          className="officer-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !processing
            ) {
              setShowRejectModal(false);
            }
          }}
        >
          <div
            className="officer-reject-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-booking-title"
          >
            <div className="officer-modal-header">
              <div>
                <span className="officer-details-label">
                  Booking Decision
                </span>

                <h2 id="reject-booking-title">
                  Reject Booking
                </h2>
              </div>

              <button
                type="button"
                className="officer-modal-close"
                onClick={() =>
                  setShowRejectModal(false)
                }
                disabled={processing}
                aria-label="Close rejection dialog"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleReject}>
              <div className="officer-modal-body">
                <p>
                  Please provide a clear reason for
                  rejecting this booking request. The
                  student will be able to see this reason.
                </p>

                <label htmlFor="rejection-reason">
                  Rejection reason
                </label>

                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(
                      event.target.value,
                    )
                  }
                  placeholder="e.g. The facility is already reserved for another approved activity."
                  rows={5}
                  maxLength={500}
                  autoFocus
                  disabled={processing}
                />

                <div className="officer-character-count">
                  {rejectionReason.length}/500
                </div>

                {actionError && (
                  <div className="officer-modal-error">
                    <XCircle size={17} />
                    <span>{actionError}</span>
                  </div>
                )}
              </div>

              <div className="officer-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setShowRejectModal(false)
                  }
                  disabled={processing}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="officer-reject-submit"
                  disabled={
                    processing ||
                    !rejectionReason.trim()
                  }
                >
                  <XCircle size={17} />

                  {processing
                    ? 'Rejecting...'
                    : 'Reject Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default OfficerBookingDetails;