import { useEffect, useState } from 'react';
import facilityService from '../../services/facilityService';
import bookingService from '../../services/bookingService';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './NewBooking.css';

function NewBooking() {
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [facilitiesError, setFacilitiesError] = useState('');

  const [formData, setFormData] = useState({
    facility: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    people: '1',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  const [selectedFacility, setSelectedFacility] = useState(null);

  /*
   * Load available facilities from Django.
   */
  useEffect(() => {
    const loadFacilities = async () => {
      setFacilitiesLoading(true);
      setFacilitiesError('');

      try {
        const data = await facilityService.getFacilities();

        setFacilities(data);
      } catch (error) {
        console.error('Unable to load facilities:', error);

        setFacilitiesError(
          'Unable to load available facilities. Please try again.',
        );
      } finally {
        setFacilitiesLoading(false);
      }
    };

    loadFacilities();
  }, []);

  /*
   * Update selected facility whenever the facility
   * selected in the form changes.
   */
  useEffect(() => {
    if (!formData.facility) {
      setSelectedFacility(null);
      return;
    }

    const facility = facilities.find(
      (item) => String(item.id) === String(formData.facility),
    );

    setSelectedFacility(facility || null);

    /*
     * If the selected facility has a smaller capacity
     * than the current number of people, reset people
     * to 1 so the form remains valid.
     */
    if (
      facility &&
      Number(formData.people) > facility.capacity
    ) {
      setFormData((current) => ({
        ...current,
        people: '1',
      }));

      setErrors((current) => ({
        ...current,
        people: '',
      }));
    }
  }, [formData.facility, facilities]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: '',
      submit: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.facility) {
      newErrors.facility = 'Please select a facility.';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a booking date.';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Please select a start time.';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Please select an end time.';
    }

    if (
      formData.startTime &&
      formData.endTime &&
      formData.startTime >= formData.endTime
    ) {
      newErrors.endTime =
        'End time must be later than start time.';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose =
        'Please enter the purpose of your booking.';
    }

    const people = Number(formData.people);

    if (!people || people < 1) {
      newErrors.people = 'Enter at least 1 person.';
    }

    if (
      selectedFacility &&
      people > selectedFacility.capacity
    ) {
      newErrors.people = `This facility supports up to ${selectedFacility.capacity} people.`;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const getApiErrorMessage = (error) => {
    const data = error?.response?.data;

    if (!data) {
      return 'Something went wrong while submitting your booking.';
    }

    if (typeof data === 'string') {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    const fieldMessages = [];

    Object.entries(data).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        messages.forEach((message) => {
          fieldMessages.push(message);
        });
      } else if (typeof messages === 'string') {
        fieldMessages.push(messages);
      }
    });

    if (fieldMessages.length > 0) {
      return fieldMessages.join(' ');
    }

    return 'Unable to submit your booking. Please check your details and try again.';
  };

  const applyApiErrors = (error) => {
    const data = error?.response?.data;

    if (!data || typeof data !== 'object') {
      return;
    }

    const apiErrors = {};

    const fieldMap = {
      facility: 'facility',
      booking_date: 'date',
      start_time: 'startTime',
      end_time: 'endTime',
      purpose: 'purpose',
      notes: 'notes',
    };

    Object.entries(fieldMap).forEach(
      ([backendField, frontendField]) => {
        if (data[backendField]) {
          const messages = Array.isArray(
            data[backendField],
          )
            ? data[backendField]
            : [data[backendField]];

          apiErrors[frontendField] =
            messages.join(' ');
        }
      },
    );

    if (data.detail) {
      apiErrors.submit = data.detail;
    }

    setErrors((current) => ({
      ...current,
      ...apiErrors,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    setErrors((current) => ({
      ...current,
      submit: '',
    }));

    try {
      /*
       * Convert the frontend form structure into the
       * exact structure expected by Django.
       *
       * `people` is intentionally not sent because the
       * current Booking model does not have a people field.
       */
      const bookingData = {
        facility: Number(formData.facility),
        booking_date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        purpose: formData.purpose.trim(),
      };

      const booking = await bookingService.createBooking(
        bookingData,
      );

      setCreatedBooking(booking);
      setSubmitted(true);
    } catch (error) {
      console.error('Unable to create booking:', error);

      applyApiErrors(error);

      const message = getApiErrorMessage(error);

      setErrors((current) => ({
        ...current,
        submit: message,
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      facility: '',
      date: '',
      startTime: '',
      endTime: '',
      purpose: '',
      people: '1',
    });

    setErrors({});
    setSubmitted(false);
    setCreatedBooking(null);
  };

  if (submitted) {
    return (
      <div className="booking-success-page">
        <div className="booking-success-card">
          <div className="booking-success-icon">
            <CheckCircle2 size={42} />
          </div>

          <span className="dashboard-eyebrow">
            Booking Submitted
          </span>

          <h1>Booking request received</h1>

          <p>
            Your facility booking request has been
            submitted successfully. It is currently
            waiting for approval.
          </p>

          <div className="success-summary">
            <div>
              <span>Facility</span>
              <strong>
                {createdBooking?.facility_name ||
                  selectedFacility?.name}
              </strong>
            </div>

            <div>
              <span>Date</span>
              <strong>
                {createdBooking?.booking_date ||
                  formData.date}
              </strong>
            </div>

            <div>
              <span>Time</span>
              <strong>
                {createdBooking?.start_time &&
                createdBooking?.end_time
                  ? `${createdBooking.start_time} – ${createdBooking.end_time}`
                  : `${formData.startTime} – ${formData.endTime}`}
              </strong>
            </div>

            <div>
              <span>People</span>
              <strong>{formData.people}</strong>
            </div>

            {createdBooking?.id && (
              <div>
                <span>Booking ID</span>
                <strong>#{createdBooking.id}</strong>
              </div>
            )}
          </div>

          <div className="success-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleReset}
            >
              Make Another Booking
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate('/student/bookings')
              }
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="new-booking-page">
      <div className="new-booking-top">
        <Link
          to="/student/bookings"
          className="booking-back-link"
        >
          <ArrowLeft size={17} />
          Back to My Bookings
        </Link>
      </div>

      <section className="new-booking-header">
        <div>
          

          <h1>Book an ICT Facility</h1>

          <p>
            Request an available facility for your
            academic, research or approved ICT activities.
          </p>
        </div>
      </section>

      <div className="new-booking-layout">
        <form
          className="booking-form-card"
          onSubmit={handleSubmit}
        >
          <div className="booking-form-section">
            <div className="booking-form-section-heading">
              <span className="form-step">01</span>

              <div>
                <h2>Facility details</h2>
                <p>
                  Select the facility you would like to
                  reserve.
                </p>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="facility">
                Facility <span>*</span>
              </label>

              <select
                id="facility"
                name="facility"
                value={formData.facility}
                onChange={handleChange}
                disabled={facilitiesLoading}
                className={
                  errors.facility ? 'input-error' : ''
                }
              >
                <option value="">
                  {facilitiesLoading
                    ? 'Loading facilities...'
                    : 'Select a facility'}
                </option>

                {facilities.map((facility) => (
                  <option
                    key={facility.id}
                    value={facility.id}
                  >
                    {facility.name}
                  </option>
                ))}
              </select>

              {errors.facility && (
                <small className="field-error">
                  {errors.facility}
                </small>
              )}

              {facilitiesError && (
                <small className="field-error">
                  {facilitiesError}
                </small>
              )}

              {selectedFacility && (
                <div className="facility-info">
                  <strong>
                    {selectedFacility.name}
                  </strong>

                  <p>
                    {selectedFacility.description ||
                      'No description available.'}
                  </p>

                  <span>
                    <Users size={14} />
                    Capacity:{' '}
                    {selectedFacility.capacity} people
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="booking-form-section">
            <div className="booking-form-section-heading">
              <span className="form-step">02</span>

              <div>
                <h2>Date and time</h2>
                <p>
                  Choose when you need the facility.
                </p>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="date">
                Booking Date <span>*</span>
              </label>

              <div className="input-with-icon">
                <CalendarDays size={17} />

                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={
                    new Date()
                      .toISOString()
                      .split('T')[0]
                  }
                  className={
                    errors.date ? 'input-error' : ''
                  }
                />
              </div>

              {errors.date && (
                <small className="field-error">
                  {errors.date}
                </small>
              )}
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="startTime">
                  Start Time <span>*</span>
                </label>

                <div className="input-with-icon">
                  <Clock3 size={17} />

                  <input
                    id="startTime"
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className={
                      errors.startTime
                        ? 'input-error'
                        : ''
                    }
                  />
                </div>

                {errors.startTime && (
                  <small className="field-error">
                    {errors.startTime}
                  </small>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="endTime">
                  End Time <span>*</span>
                </label>

                <div className="input-with-icon">
                  <Clock3 size={17} />

                  <input
                    id="endTime"
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className={
                      errors.endTime
                        ? 'input-error'
                        : ''
                    }
                  />
                </div>

                {errors.endTime && (
                  <small className="field-error">
                    {errors.endTime}
                  </small>
                )}
              </div>
            </div>
          </div>

          <div className="booking-form-section">
            <div className="booking-form-section-heading">
              <span className="form-step">03</span>

              <div>
                <h2>Booking information</h2>
                <p>
                  Tell us what the facility will be used
                  for.
                </p>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="purpose">
                Purpose of Booking <span>*</span>
              </label>

              <textarea
                id="purpose"
                name="purpose"
                rows="5"
                placeholder="e.g. Software development practical, research, group project..."
                value={formData.purpose}
                onChange={handleChange}
                className={
                  errors.purpose ? 'input-error' : ''
                }
              />

              {errors.purpose && (
                <small className="field-error">
                  {errors.purpose}
                </small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="people">
                Number of People <span>*</span>
              </label>

              <div className="input-with-icon">
                <Users size={17} />

                <input
                  id="people"
                  type="number"
                  name="people"
                  min="1"
                  max={
                    selectedFacility?.capacity || 100
                  }
                  value={formData.people}
                  onChange={handleChange}
                  className={
                    errors.people ? 'input-error' : ''
                  }
                />
              </div>

              {errors.people && (
                <small className="field-error">
                  {errors.people}
                </small>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="booking-submit-error">
              {errors.submit}
            </div>
          )}

          <div className="booking-form-actions">
            <Link
              to="/student/bookings"
              className="btn btn-outline"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                submitting || facilitiesLoading
              }
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="booking-spinner"
                  />
                  Submitting...
                </>
              ) : (
                'Submit Booking'
              )}
            </button>
          </div>
        </form>

        <aside className="booking-summary-panel">
          <div className="booking-summary-header">
            <span>Booking Summary</span>
            <CalendarDays size={19} />
          </div>

          <div className="booking-summary-content">
            <div className="summary-item">
              <span>Facility</span>

              <strong>
                {selectedFacility?.name ||
                  'Not selected'}
              </strong>
            </div>

            <div className="summary-item">
              <span>Date</span>

              <strong>
                {formData.date || 'Not selected'}
              </strong>
            </div>

            <div className="summary-item">
              <span>Time</span>

              <strong>
                {formData.startTime &&
                formData.endTime
                  ? `${formData.startTime} – ${formData.endTime}`
                  : 'Not selected'}
              </strong>
            </div>

            <div className="summary-item">
              <span>People</span>

              <strong>
                {formData.people || '0'}
              </strong>
            </div>

            <div className="summary-item summary-purpose">
              <span>Purpose</span>

              <strong>
                {formData.purpose ||
                  'No purpose provided'}
              </strong>
            </div>
          </div>

          <div className="booking-notice">
            <CheckCircle2 size={18} />

            <p>
              Your request will be reviewed by an ICT
              Centre officer before the booking is
              approved.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default NewBooking;