import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserRound,
} from 'lucide-react';

import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

import './OfficerProfile.css';

const OfficerProfile = () => {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const profile = await authService.getMe();

        setForm({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone: profile.phone || '',
        });

        updateUser(profile);
      } catch (err) {
        console.error(
          'Unable to load officer profile.',
          err,
        );

        setError(
          err.response?.data?.detail ||
            'Unable to load your profile. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [updateUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.first_name.trim()) {
      setError('First name is required.');
      return;
    }

    if (!form.last_name.trim()) {
      setError('Last name is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updatedProfile =
        await authService.updateMe({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
        });

      setForm({
        first_name: updatedProfile.first_name || '',
        last_name: updatedProfile.last_name || '',
        phone: updatedProfile.phone || '',
      });

      updateUser(updatedProfile);

      setSuccess(
        'Your profile has been updated successfully.',
      );
    } catch (err) {
      console.error(
        'Unable to update officer profile.',
        err,
      );

      const responseData = err.response?.data;

      if (
        responseData &&
        typeof responseData === 'object'
      ) {
        const firstError = Object.values(responseData)
          .flat()
          .find(Boolean);

        setError(
          firstError ||
            'Unable to update your profile. Please try again.',
        );
      } else {
        setError(
          'Unable to update your profile. Please try again.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const getDisplayName = () => {
    const name =
      `${form.first_name} ${form.last_name}`.trim();

    return name || user?.email || 'Officer';
  };

  const getInitials = () => {
    const first =
      form.first_name?.charAt(0) || '';

    const last =
      form.last_name?.charAt(0) || '';

    const initials =
      `${first}${last}`.toUpperCase();

    return initials || 'O';
  };

  if (loading) {
    return (
      <div className="officer-profile-page">
        <div className="officer-profile-loading">
          <div className="profile-spinner" />

          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="officer-profile-page">
      <div className="officer-profile">
        <header className="profile-page-header">
          <div>
            <span className="profile-eyebrow">
              Account management
            </span>

            <h1>Officer Profile</h1>

            <p>
              Manage your personal information and keep
              your Kiangini ICT Centre account up to date.
            </p>
          </div>

          <div className="profile-header-badge">
            <ShieldCheck size={17} />

            <span>Officer account</span>
          </div>
        </header>

        {error && (
          <div className="profile-alert profile-alert-error">
            <AlertCircle size={18} />

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="profile-alert profile-alert-success">
            <CheckCircle2 size={18} />

            <span>{success}</span>
          </div>
        )}

        <div className="profile-grid">
          <aside className="profile-overview-card">
            <div className="profile-avatar">
              {getInitials()}
            </div>

            <h2>{getDisplayName()}</h2>

            <p className="profile-role">
              {user?.role === 'admin'
                ? 'Administrator'
                : 'ICT Officer'}
            </p>

            <div className="profile-status">
              <span className="status-dot" />

              <span>Active account</span>
            </div>

            <div className="profile-overview-divider" />

            <div className="profile-info-list">
              <div className="profile-info-item">
                <div className="profile-info-icon profile-info-icon-blue">
                  <Mail size={16} />
                </div>

                <div>
                  <span>Email address</span>

                  <strong>
                    {user?.email || '—'}
                  </strong>
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-icon profile-info-icon-cyan">
                  <Phone size={16} />
                </div>

                <div>
                  <span>Phone number</span>

                  <strong>
                    {form.phone || 'Not provided'}
                  </strong>
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-icon profile-info-icon-indigo">
                  <ShieldCheck size={16} />
                </div>

                <div>
                  <span>Access level</span>

                  <strong>
                    {user?.role === 'admin'
                      ? 'Administrator'
                      : 'Officer'}
                  </strong>
                </div>
              </div>
            </div>
          </aside>

          <section className="profile-form-card">
            <div className="profile-card-header">
              <div className="profile-card-icon">
                <UserRound size={19} />
              </div>

              <div>
                <span>Personal information</span>

                <h2>Profile details</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="profile-form-grid">
                <div className="profile-field">
                  <label htmlFor="first_name">
                    First name
                  </label>

                  <div className="profile-input-wrapper">
                    <User size={17} />

                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={form.first_name}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      autoComplete="given-name"
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="last_name">
                    Last name
                  </label>

                  <div className="profile-input-wrapper">
                    <User size={17} />

                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={form.last_name}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="email">
                    Email address
                  </label>

                  <div className="profile-input-wrapper profile-input-disabled">
                    <Mail size={17} />

                    <input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>

                  <small>
                    Your email address is used to sign in
                    and cannot be changed here.
                  </small>
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="phone">
                    Phone number
                  </label>

                  <div className="profile-input-wrapper">
                    <Phone size={17} />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-form-footer">
                <div className="profile-save-note">
                  <ShieldCheck size={15} />

                  <span>
                    Your profile changes are securely saved.
                  </span>
                </div>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="button-spinner" />

                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />

                      Save changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OfficerProfile;