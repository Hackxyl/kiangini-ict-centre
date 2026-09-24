import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileText,
  Megaphone,
  Save,
  Send,
  Settings2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import api from '../../config/api';
import './AdminAnnouncementForm.css';

const TYPE_OPTIONS = [
  {
    value: 'general',
    label: 'General',
    description: 'General information and updates.',
    className: 'general',
  },
  {
    value: 'academic',
    label: 'Academic',
    description: 'Academic notices, deadlines and student information.',
    className: 'academic',
  },
  {
    value: 'system',
    label: 'System',
    description: 'ICT systems, portal and technical updates.',
    className: 'system',
  },
  {
    value: 'event',
    label: 'Event',
    description: 'Events, activities, meetings and programmes.',
    className: 'event',
  },
  {
    value: 'maintenance',
    label: 'Maintenance',
    description: 'Maintenance schedules and service interruptions.',
    className: 'maintenance',
  },
  {
    value: 'urgent',
    label: 'Urgent',
    description: 'Important information requiring immediate attention.',
    className: 'urgent',
  },
];

const INITIAL_FORM = {
  title: '',
  message: '',
  announcement_type: 'general',
  is_published: true,
};

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || 'Unable to complete the request.';
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
      const message = Array.isArray(value)
        ? value.join(', ')
        : String(value);

      return `${field}: ${message}`;
    })
    .filter(Boolean);

  return messages.length
    ? messages.join(' ')
    : 'Unable to save the announcement.';
}

function getAnnouncementData(response) {
  if (response?.data?.data) {
    return response.data.data;
  }

  if (response?.data?.announcement) {
    return response.data.announcement;
  }

  return response?.data || {};
}

function AdminAnnouncementForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadAnnouncement = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.get(
        `/announcements/management/${id}/`,
      );

      const announcement = getAnnouncementData(response);

      setForm({
        title: announcement.title || '',
        message: announcement.message || '',
        announcement_type:
          announcement.announcement_type || 'general',
        is_published:
          typeof announcement.is_published === 'boolean'
            ? announcement.is_published
            : true,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAnnouncement();
  }, [loadAnnouncement]);

  const selectedType = useMemo(
    () =>
      TYPE_OPTIONS.find(
        (option) => option.value === form.announcement_type,
      ) || TYPE_OPTIONS[0],
    [form.announcement_type],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError('');
    setSuccess('');
  };

  const handleTypeChange = (value) => {
    setForm((current) => ({
      ...current,
      announcement_type: value,
    }));

    setError('');
    setSuccess('');
  };

  const handlePublishChange = (value) => {
    setForm((current) => ({
      ...current,
      is_published: value,
    }));

    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    const title = form.title.trim();
    const message = form.message.trim();

    if (!title) {
      return 'Announcement title is required.';
    }

    if (title.length < 3) {
      return 'Announcement title must contain at least 3 characters.';
    }

    if (!message) {
      return 'Announcement message is required.';
    }

    if (message.length < 5) {
      return 'Announcement message must contain more information.';
    }

    if (
      !TYPE_OPTIONS.some(
        (option) =>
          option.value === form.announcement_type,
      )
    ) {
      return 'Please select a valid announcement type.';
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
      title: form.title.trim(),
      message: form.message.trim(),
      announcement_type: form.announcement_type,
      is_published: form.is_published,
    };

    try {
      if (isEditMode) {
        await api.patch(
          `/announcements/management/${id}/`,
          payload,
        );

        setSuccess('Announcement updated successfully.');

        setTimeout(() => {
          navigate(`/admin/announcements/${id}`);
        }, 700);
      } else {
        const response = await api.post(
          '/announcements/management/',
          payload,
        );

        const announcement = getAnnouncementData(response);

        setSuccess('Announcement created successfully.');

        setTimeout(() => {
          if (announcement?.id) {
            navigate(
              `/admin/announcements/${announcement.id}`,
            );
          } else {
            navigate('/admin/announcements');
          }
        }, 700);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="admin-announcement-form-page">
        <div className="admin-announcement-form-shell">
          <div className="admin-announcement-form-loading">
            <div className="admin-announcement-form-spinner" />
            <h2>Loading announcement</h2>
            <p>Retrieving announcement information...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-announcement-form-page">
      <div className="admin-announcement-form-shell">
        {/* HEADER */}
        <header className="admin-announcement-form-header">
          <div className="admin-announcement-form-heading">
            <Link
              to="/admin/announcements"
              className="admin-announcement-back"
              aria-label="Back to announcements"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div className="admin-announcement-form-eyebrow">
                <Settings2 size={14} />
                Communication management
              </div>

              <h1>
                {isEditMode
                  ? 'Edit announcement'
                  : 'Create announcement'}
              </h1>

              <p>
                {isEditMode
                  ? 'Update the announcement information and publishing settings.'
                  : 'Create an announcement to communicate important information to the Kiangini ICT Centre community.'}
              </p>
            </div>
          </div>

          <Link
            to="/admin/announcements"
            className="admin-announcement-form-cancel-top"
          >
            <X size={17} />
            Cancel
          </Link>
        </header>

        {/* ALERTS */}
        {error && (
          <div className="admin-announcement-form-alert error">
            <AlertCircle size={20} />

            <div>
              <strong>Unable to save announcement</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="admin-announcement-form-alert success">
            <CheckCircle2 size={20} />

            <div>
              <strong>Success</strong>
              <p>{success}</p>
            </div>
          </div>
        )}

        <form
          className="admin-announcement-form-layout"
          onSubmit={handleSubmit}
        >
          {/* MAIN */}
          <section className="admin-announcement-editor-card">
            <div className="admin-announcement-editor-header">
              <div className="admin-announcement-editor-icon">
                <FileText size={20} />
              </div>

              <div>
                <h2>Announcement content</h2>
                <p>
                  Write the information you want users to receive.
                </p>
              </div>
            </div>

            <div className="admin-announcement-editor-body">
              {/* TITLE */}
              <div className="admin-announcement-field full">
                <label htmlFor="announcement-title">
                  Announcement title
                  <span>*</span>
                </label>

                <input
                  id="announcement-title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. ICT Lab Maintenance Notice"
                  maxLength={255}
                  required
                />

                <div className="admin-announcement-field-footer">
                  <small>
                    Use a clear title that immediately explains the
                    announcement.
                  </small>

                  <span>
                    {form.title.length}/255
                  </span>
                </div>
              </div>

              {/* MESSAGE */}
              <div className="admin-announcement-field full">
                <label htmlFor="announcement-message">
                  Message
                  <span>*</span>
                </label>

                <textarea
                  id="announcement-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write the full announcement message here..."
                  rows={12}
                  required
                />

                <div className="admin-announcement-field-footer">
                  <small>
                    Include dates, locations, instructions and other
                    relevant details where necessary.
                  </small>

                  <span>
                    {form.message.length} characters
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* TYPE */}
          <section className="admin-announcement-editor-card">
            <div className="admin-announcement-editor-header">
              <div className="admin-announcement-editor-icon purple">
                <Bell size={20} />
              </div>

              <div>
                <h2>Announcement type</h2>
                <p>
                  Choose a category that best describes the message.
                </p>
              </div>
            </div>

            <div className="admin-announcement-type-options">
              {TYPE_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`admin-announcement-type-option ${option.className} ${
                    form.announcement_type === option.value
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() =>
                    handleTypeChange(option.value)
                  }
                >
                  <span className="admin-announcement-type-option-icon">
                    <Megaphone size={17} />
                  </span>

                  <span className="admin-announcement-type-option-content">
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>

                  <span className="admin-announcement-type-radio">
                    <span />
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* PUBLISHING */}
          <section className="admin-announcement-editor-card">
            <div className="admin-announcement-editor-header">
              <div className="admin-announcement-editor-icon cyan">
                <Send size={20} />
              </div>

              <div>
                <h2>Publishing</h2>
                <p>
                  Control whether the announcement is visible to users.
                </p>
              </div>
            </div>

            <div className="admin-announcement-publishing-body">
              <button
                type="button"
                className={`admin-announcement-publish-option ${
                  form.is_published ? 'active' : ''
                }`}
                onClick={() =>
                  handlePublishChange(true)
                }
              >
                <div className="admin-publish-option-icon published">
                  <CheckCircle2 size={19} />
                </div>

                <div>
                  <strong>Publish immediately</strong>
                  <span>
                    The announcement will be visible on the public
                    announcements page.
                  </span>
                </div>

                <span className="admin-publish-radio">
                  <span />
                </span>
              </button>

              <button
                type="button"
                className={`admin-announcement-publish-option ${
                  !form.is_published ? 'active' : ''
                }`}
                onClick={() =>
                  handlePublishChange(false)
                }
              >
                <div className="admin-publish-option-icon draft">
                  <FileText size={19} />
                </div>

                <div>
                  <strong>Save as draft</strong>
                  <span>
                    The announcement will remain hidden until it is
                    published.
                  </span>
                </div>

                <span className="admin-publish-radio">
                  <span />
                </span>
              </button>
            </div>
          </section>

          {/* PREVIEW */}
          <aside
            className={`admin-announcement-preview ${selectedType.className}`}
          >
            <div className="admin-announcement-preview-top">
              <span>Live preview</span>

              <Eye size={16} />
            </div>

            <div className="admin-announcement-preview-icon">
              <Megaphone size={25} />
            </div>

            <div className="admin-announcement-preview-badges">
              <span
                className={`admin-announcement-preview-type ${selectedType.className}`}
              >
                {selectedType.label}
              </span>

              <span
                className={`admin-announcement-preview-status ${
                  form.is_published
                    ? 'published'
                    : 'draft'
                }`}
              >
                {form.is_published
                  ? 'Published'
                  : 'Draft'}
              </span>
            </div>

            <h3>
              {form.title.trim() ||
                'Announcement title'}
            </h3>

            <p>
              {form.message.trim() ||
                'Your announcement message will appear here.'}
            </p>

            <div className="admin-announcement-preview-meta">
              <span>
                <CalendarDays size={14} />
                {form.is_published
                  ? 'Published immediately'
                  : 'Saved as draft'}
              </span>

              <span>
                <Bell size={14} />
                Kiangini ICT Centre
              </span>
            </div>

            <div className="admin-announcement-preview-divider" />

            <div className="admin-announcement-preview-note">
              <CheckCircle2 size={15} />
              <span>
                Publishing date will be assigned automatically by
                the server.
              </span>
            </div>
          </aside>

          {/* ACTIONS */}
          <div className="admin-announcement-form-actions">
            <Link
              to="/admin/announcements"
              className="admin-announcement-secondary-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="admin-announcement-primary-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="admin-announcement-button-spinner" />
                  {isEditMode
                    ? 'Saving changes...'
                    : 'Creating announcement...'}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditMode
                    ? 'Save changes'
                    : form.is_published
                      ? 'Publish announcement'
                      : 'Save draft'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AdminAnnouncementForm;