import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  MapPin,
  Save,
  Settings2,
  Users,
  Wifi,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import api from '../../config/api';
import './AdminFacilityForm.css';

const STATUS_OPTIONS = [
  {
    value: 'available',
    label: 'Available',
    description: 'Facility is operational and can be used.',
  },
  {
    value: 'maintenance',
    label: 'Under Maintenance',
    description: 'Facility is temporarily unavailable for maintenance.',
  },
  {
    value: 'inactive',
    label: 'Inactive',
    description: 'Facility is currently not in service.',
  },
];

const INITIAL_FORM = {
  name: '',
  description: '',
  location: '',
  capacity: 1,
  status: 'available',
  is_bookable: true,
};

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || 'Something went wrong. Please try again.';
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.message) {
    return data.message;
  }

  const messages = Object.entries(data)
    .map(([field, value]) => {
      const message = Array.isArray(value) ? value.join(', ') : String(value);
      return `${field}: ${message}`;
    })
    .filter(Boolean);

  return messages.length
    ? messages.join(' ')
    : 'Unable to save the facility.';
}

function getFacilityData(response) {
  if (response?.data?.data) {
    return response.data.data;
  }

  if (response?.data?.facility) {
    return response.data.facility;
  }

  return response?.data || {};
}

function getStatusLabel(status) {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label ||
    'Available'
  );
}

function AdminFacilityForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadFacility = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/facilities/management/${id}/`);
      const facility = getFacilityData(response);

      setForm({
        name: facility.name || '',
        description: facility.description || '',
        location: facility.location || '',
        capacity: facility.capacity ?? 1,
        status: facility.status || 'available',
        is_bookable:
          typeof facility.is_bookable === 'boolean'
            ? facility.is_bookable
            : true,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadFacility();
  }, [loadFacility]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === 'capacity' ? value : value,
    }));

    setError('');
    setSuccess('');
  };

  const handleStatusChange = (status) => {
    setForm((current) => ({
      ...current,
      status,
    }));

    setError('');
    setSuccess('');
  };

  const handleBookableChange = () => {
    setForm((current) => ({
      ...current,
      is_bookable: !current.is_bookable,
    }));

    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    const name = form.name.trim();
    const location = form.location.trim();
    const capacity = Number(form.capacity);

    if (!name) {
      return 'Facility name is required.';
    }

    if (name.length < 2) {
      return 'Facility name must contain at least 2 characters.';
    }

    if (location.length > 255) {
      return 'Location cannot exceed 255 characters.';
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
      return 'Capacity must be a whole number greater than 0.';
    }

    if (capacity > 100000) {
      return 'Please enter a realistic facility capacity.';
    }

    if (!STATUS_OPTIONS.some((option) => option.value === form.status)) {
      return 'Please select a valid facility status.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      capacity: Number(form.capacity),
      status: form.status,
      is_bookable: form.is_bookable,
    };

    try {
      if (isEditMode) {
        await api.patch(`/facilities/management/${id}/`, payload);
        setSuccess('Facility updated successfully.');

        setTimeout(() => {
          navigate('/admin/facilities');
        }, 700);
      } else {
        await api.post('/facilities/management/', payload);
        setSuccess('Facility created successfully.');

        setTimeout(() => {
          navigate('/admin/facilities');
        }, 700);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const selectedStatus = useMemo(
    () =>
      STATUS_OPTIONS.find((option) => option.value === form.status) ||
      STATUS_OPTIONS[0],
    [form.status],
  );

  if (loading) {
    return (
      <main className="admin-facility-form-page">
        <div className="admin-facility-form-shell">
          <div className="admin-form-loading">
            <div className="admin-form-spinner" />
            <h2>Loading facility</h2>
            <p>Retrieving facility information...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-facility-form-page">
      <div className="admin-facility-form-shell">
        {/* HEADER */}
        <header className="admin-facility-form-header">
          <div className="admin-facility-form-header-left">
            <Link
              to="/admin/facilities"
              className="admin-facility-back-button"
              aria-label="Back to facilities"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div className="admin-facility-eyebrow">
                <Settings2 size={14} />
                Facility Management
              </div>

              <h1>
                {isEditMode ? 'Edit facility' : 'Add new facility'}
              </h1>

              <p>
                {isEditMode
                  ? 'Update the facility information and availability settings.'
                  : 'Create a facility that students and officers can manage through the ICT Centre portal.'}
              </p>
            </div>
          </div>

          <Link
            to="/admin/facilities"
            className="admin-facility-cancel-button"
          >
            <X size={17} />
            Cancel
          </Link>
        </header>

        {/* ALERTS */}
        {error && (
          <div className="admin-facility-form-alert error">
            <div className="admin-facility-alert-icon">
              !
            </div>

            <div>
              <strong>Unable to save facility</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="admin-facility-form-alert success">
            <CheckCircle2 size={20} />

            <div>
              <strong>Success</strong>
              <p>{success}</p>
            </div>
          </div>
        )}

        <form
          className="admin-facility-form-layout"
          onSubmit={handleSubmit}
        >
          {/* MAIN FORM */}
          <section className="admin-facility-form-card">
            <div className="admin-facility-form-card-header">
              <div className="admin-facility-form-card-icon blue">
                <Building2 size={20} />
              </div>

              <div>
                <h2>Facility information</h2>
                <p>
                  Enter the basic information for this facility.
                </p>
              </div>
            </div>

            <div className="admin-facility-form-body">
              {/* NAME */}
              <div className="admin-form-field full">
                <label htmlFor="facility-name">
                  Facility name
                  <span>*</span>
                </label>

                <div className="admin-input-wrapper">
                  <Building2 size={18} />

                  <input
                    id="facility-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Main Computer Laboratory"
                    maxLength={150}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="admin-field-footer">
                  <small>
                    Use a clear and recognizable facility name.
                  </small>

                  <span>{form.name.length}/150</span>
                </div>
              </div>

              {/* LOCATION */}
              <div className="admin-form-field full">
                <label htmlFor="facility-location">
                  Location
                </label>

                <div className="admin-input-wrapper">
                  <MapPin size={18} />

                  <input
                    id="facility-location"
                    name="location"
                    type="text"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Main ICT Building, Ground Floor"
                    maxLength={255}
                  />
                </div>

                <div className="admin-field-footer">
                  <small>
                    Specify where users can find the facility.
                  </small>

                  <span>{form.location.length}/255</span>
                </div>
              </div>

              {/* CAPACITY */}
              <div className="admin-form-field">
                <label htmlFor="facility-capacity">
                  Capacity
                  <span>*</span>
                </label>

                <div className="admin-input-wrapper">
                  <Users size={18} />

                  <input
                    id="facility-capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    step="1"
                    value={form.capacity}
                    onChange={handleChange}
                    required
                  />

                  <span className="admin-input-suffix">
                    people
                  </span>
                </div>

                <small>
                  Maximum number of people the facility can accommodate.
                </small>
              </div>

              {/* STATUS */}
              <div className="admin-form-field">
                <label htmlFor="facility-status">
                  Status
                  <span>*</span>
                </label>

                <select
                  id="facility-status"
                  name="status"
                  value={form.status}
                  onChange={(event) =>
                    handleStatusChange(event.target.value)
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <small>{selectedStatus.description}</small>
              </div>

              {/* DESCRIPTION */}
              <div className="admin-form-field full">
                <label htmlFor="facility-description">
                  Description
                </label>

                <textarea
                  id="facility-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the facility, equipment, services or intended use..."
                  rows={6}
                />

                <div className="admin-field-footer">
                  <small>
                    Provide useful information for students and officers.
                  </small>
                </div>
              </div>
            </div>
          </section>

          {/* SETTINGS */}
          <section className="admin-facility-form-card">
            <div className="admin-facility-form-card-header">
              <div className="admin-facility-form-card-icon cyan">
                <Wifi size={20} />
              </div>

              <div>
                <h2>Booking settings</h2>
                <p>
                  Control whether users can request this facility.
                </p>
              </div>
            </div>

            <div className="admin-facility-settings-body">
              <button
                type="button"
                className={`admin-bookable-toggle ${
                  form.is_bookable ? 'active' : ''
                }`}
                onClick={handleBookableChange}
                aria-pressed={form.is_bookable}
              >
                <div className="admin-bookable-icon">
                  <Wifi size={18} />
                </div>

                <div className="admin-bookable-content">
                  <strong>Allow bookings</strong>
                  <span>
                    {form.is_bookable
                      ? 'Students can request this facility.'
                      : 'Students cannot request this facility.'}
                  </span>
                </div>

                <span
                  className={`admin-toggle ${
                    form.is_bookable ? 'active' : ''
                  }`}
                >
                  <span />
                </span>
              </button>
            </div>
          </section>

          {/* PREVIEW */}
          <aside className="admin-facility-preview-card">
            <div className="admin-preview-heading">
              <span>Live preview</span>
              <div className="admin-preview-dot" />
            </div>

            <div className="admin-preview-icon">
              <Building2 size={27} />
            </div>

            <div className="admin-preview-status">
              <span className={`status-dot ${form.status}`} />
              {getStatusLabel(form.status)}
            </div>

            <h3>
              {form.name.trim() || 'Facility name'}
            </h3>

            <p>
              {form.description.trim() ||
                'Your facility description will appear here.'}
            </p>

            <div className="admin-preview-details">
              <div>
                <MapPin size={16} />
                <span>
                  {form.location.trim() || 'Facility location'}
                </span>
              </div>

              <div>
                <Users size={16} />
                <span>
                  {form.capacity || 1} people capacity
                </span>
              </div>

              <div>
                <Wifi size={16} />
                <span>
                  {form.is_bookable
                    ? 'Bookings enabled'
                    : 'Bookings disabled'}
                </span>
              </div>
            </div>

            <div className="admin-preview-divider" />

            <div className="admin-preview-note">
              <CheckCircle2 size={16} />
              <span>
                Changes will be reflected across the facility management
                system.
              </span>
            </div>
          </aside>

          {/* FORM ACTIONS */}
          <div className="admin-facility-form-actions">
            <Link
              to="/admin/facilities"
              className="admin-form-secondary-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="admin-form-primary-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="admin-button-spinner" />
                  {isEditMode ? 'Saving changes...' : 'Creating facility...'}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditMode ? 'Save changes' : 'Create facility'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AdminFacilityForm;