import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  FileText,
  Save,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import announcementService from '../../services/announcementService';

import './OfficerAnnouncementForm.css';

const ANNOUNCEMENT_TYPES = [
  {
    value: 'general',
    label: 'General',
    description: 'General information and updates',
  },
  {
    value: 'important',
    label: 'Important',
    description: 'Important information for students',
  },
  {
    value: 'maintenance',
    label: 'Maintenance',
    description: 'System or facility maintenance',
  },
  {
    value: 'event',
    label: 'Event',
    description: 'Events, activities and programs',
  },
  {
    value: 'notice',
    label: 'Notice',
    description: 'Official notices and reminders',
  },
];

function EditOfficerAnnouncement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    message: '',
    announcement_type: 'general',
    is_published: false,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const loadAnnouncement = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');

      const announcement =
        await announcementService.getManagementAnnouncements();

      const items = Array.isArray(announcement)
        ? announcement
        : announcement?.results || [];

      const current = items.find(
        (item) => String(item.id) === String(id),
      );

      if (!current) {
        setLoadError(
          'The announcement could not be found.',
        );
        return;
      }

      setForm({
        title: current.title || '',
        message: current.message || '',
        announcement_type:
          current.announcement_type || 'general',
        is_published: Boolean(current.is_published),
      });
    } catch (error) {
      console.error(
        'Failed to load announcement:',
        error,
      );

      setLoadError(
        'Unable to load this announcement. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAnnouncement();
  }, [loadAnnouncement]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: '',
    }));

    setSubmitError('');
  };

  const handlePublishChange = (event) => {
    setForm((current) => ({
      ...current,
      is_published: event.target.checked,
    }));

    setSubmitError('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title =
        'Announcement title is required.';
    } else if (form.title.trim().length < 5) {
      nextErrors.title =
        'Title must contain at least 5 characters.';
    }

    if (!form.message.trim()) {
      nextErrors.message =
        'Announcement message is required.';
    } else if (form.message.trim().length < 10) {
      nextErrors.message =
        'Message must contain at least 10 characters.';
    }

    if (!form.announcement_type) {
      nextErrors.announcement_type =
        'Please select an announcement type.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');

      await announcementService.updateAnnouncement(id, {
        title: form.title.trim(),
        message: form.message.trim(),
        announcement_type: form.announcement_type,
        is_published: form.is_published,
      });

      navigate('/officer/announcements', {
        state: {
          success: form.is_published
            ? 'Announcement updated and published successfully.'
            : 'Announcement updated and saved as a draft.',
        },
      });
    } catch (error) {
      console.error(
        'Failed to update announcement:',
        error,
      );

      const responseData = error?.response?.data;

      if (
        responseData &&
        typeof responseData === 'object'
      ) {
        const apiErrors = {};

        Object.entries(responseData).forEach(
          ([field, value]) => {
            apiErrors[field] = Array.isArray(value)
              ? value.join(' ')
              : String(value);
          },
        );

        setErrors(apiErrors);
      }

      setSubmitError(
        'We could not update the announcement. Please check the form and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="officer-announcement-form-page">
        <div className="officer-form-container">
          <div className="officer-form-loading">
            <span className="officer-form-loading-spinner" />

            <strong>Loading announcement</strong>

            <span>
              Please wait while we retrieve the announcement.
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="officer-announcement-form-page">
        <div className="officer-form-container">
          <div className="officer-form-error-page">
            <div className="officer-error-icon">
              <AlertCircle size={24} />
            </div>

            <span className="officer-form-eyebrow">
              ANNOUNCEMENT MANAGEMENT
            </span>

            <h1>Unable to load announcement</h1>

            <p>{loadError}</p>

            <div className="officer-error-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={loadAnnouncement}
              >
                Try Again
              </button>

              <Link
                to="/officer/announcements"
                className="btn btn-outline"
              >
                Back to Announcements
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="officer-announcement-form-page">
      <div className="officer-form-container">
        <div className="officer-form-topbar">
          <Link
            to="/officer/announcements"
            className="officer-form-back"
          >
            <ArrowLeft size={17} />
            <span>Back to announcements</span>
          </Link>
        </div>

        <div className="officer-form-header">
          <div className="officer-form-header-icon">
            <Bell size={22} />
          </div>

          <div>
            <span className="officer-form-eyebrow">
              ANNOUNCEMENT MANAGEMENT
            </span>

            <h1>Edit Announcement</h1>

            <p>
              Update the announcement information and
              publication status.
            </p>
          </div>
        </div>

        {submitError && (
          <div className="officer-form-error">
            <AlertCircle size={18} />

            <div>
              <strong>
                Unable to update announcement
              </strong>

              <span>{submitError}</span>
            </div>
          </div>
        )}

        <form
          className="officer-announcement-form"
          onSubmit={handleSubmit}
        >
          <div className="officer-form-grid">
            <div className="officer-form-main">
              <section className="officer-form-card">
                <div className="officer-card-heading">
                  <div className="officer-card-heading-icon">
                    <FileText size={17} />
                  </div>

                  <div>
                    <h2>Announcement details</h2>

                    <p>
                      Update the information students will see.
                    </p>
                  </div>
                </div>

                <div className="officer-form-fields">
                  <div className="officer-field">
                    <label htmlFor="title">
                      Title
                      <span>*</span>
                    </label>

                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={form.title}
                      onChange={handleChange}
                      maxLength={255}
                      className={
                        errors.title
                          ? 'has-error'
                          : ''
                      }
                    />

                    <div className="officer-field-footer">
                      {errors.title ? (
                        <span className="officer-field-error">
                          {errors.title}
                        </span>
                      ) : (
                        <span>
                          Use a clear and descriptive title.
                        </span>
                      )}

                      <span>
                        {form.title.length}/255
                      </span>
                    </div>
                  </div>

                  <div className="officer-field">
                    <label htmlFor="message">
                      Message
                      <span>*</span>
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={10}
                      className={
                        errors.message
                          ? 'has-error'
                          : ''
                      }
                    />

                    <div className="officer-field-footer">
                      {errors.message ? (
                        <span className="officer-field-error">
                          {errors.message}
                        </span>
                      ) : (
                        <span>
                          Keep the message clear and useful.
                        </span>
                      )}

                      <span>
                        {form.message.length} characters
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="officer-form-sidebar">
              <section className="officer-form-card">
                <div className="officer-card-heading">
                  <div className="officer-card-heading-icon">
                    <Bell size={17} />
                  </div>

                  <div>
                    <h2>Classification</h2>

                    <p>
                      Choose the appropriate announcement type.
                    </p>
                  </div>
                </div>

                <div className="officer-type-list">
                  {ANNOUNCEMENT_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`officer-type-option ${
                        form.announcement_type ===
                        type.value
                          ? 'is-selected'
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="announcement_type"
                        value={type.value}
                        checked={
                          form.announcement_type ===
                          type.value
                        }
                        onChange={handleChange}
                      />

                      <span className="officer-type-radio" />

                      <span className="officer-type-content">
                        <strong>{type.label}</strong>
                        <small>
                          {type.description}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>

                {errors.announcement_type && (
                  <span className="officer-field-error officer-type-error">
                    {errors.announcement_type}
                  </span>
                )}
              </section>

              <section className="officer-form-card officer-publish-card">
                <div className="officer-publish-header">
                  <div>
                    <span className="officer-mini-label">
                      VISIBILITY
                    </span>

                    <h2>
                      {form.is_published
                        ? 'Published'
                        : 'Draft'}
                    </h2>
                  </div>

                  <div
                    className={`officer-publish-icon ${
                      form.is_published
                        ? 'is-published'
                        : 'is-draft'
                    }`}
                  >
                    {form.is_published ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <FileText size={19} />
                    )}
                  </div>
                </div>

                <label className="officer-switch-row">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={handlePublishChange}
                  />

                  <span className="officer-switch" />

                  <span>
                    Make visible to students
                  </span>
                </label>

                <p className="officer-publish-note">
                  {form.is_published
                    ? 'Students can currently see this announcement.'
                    : 'This announcement is currently hidden from students.'}
                </p>
              </section>
            </aside>
          </div>

          <div className="officer-form-actions">
            <Link
              to="/officer/announcements"
              className="btn btn-outline"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="btn btn-primary officer-submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="officer-submit-spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditOfficerAnnouncement;