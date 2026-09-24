import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Camera,
  CheckCircle2,
  Edit3,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  XCircle,
  RefreshCw,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

import './StudentProfile.css';

function getInitials(user) {
  if (!user) {
    return 'SU';
  }

  const firstName = user.first_name?.trim() || '';
  const lastName = user.last_name?.trim() || '';

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  }

  return (
    user.email
      ?.substring(0, 2)
      .toUpperCase() || 'SU'
  );
}

function getFullName(user) {
  if (!user) {
    return 'Student User';
  }

  const fullName =
    `${user.first_name || ''} ${user.last_name || ''}`.trim();

  return fullName || user.email || 'Student User';
}

function getYearLabel(year) {
  if (!year) {
    return 'Not provided';
  }

  const yearNumber = Number(year);

  if (!Number.isNaN(yearNumber)) {
    return `Year ${yearNumber}`;
  }

  return year;
}

function StudentProfile() {
  const {
    user,
    updateUser,
  } = useAuth();

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    student_id: '',
    course: '',
    year_of_study: '',
    role: 'student',
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const currentUser =
        await authService.getMe();

      setProfile({
        first_name:
          currentUser.first_name || '',
        last_name:
          currentUser.last_name || '',
        email:
          currentUser.email || '',
        phone:
          currentUser.phone || '',
        student_id:
          currentUser.student_id || '',
        course:
          currentUser.course || '',
        year_of_study:
          currentUser.year_of_study || '',
        role:
          currentUser.role || 'student',
      });

      updateUser(currentUser);
    } catch (requestError) {
      console.error(
        'Unable to load student profile.',
        requestError,
      );

      setError(
        'Unable to load your profile right now. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSaved(false);

      const updatedUser =
        await authService.updateMe({
          first_name:
            profile.first_name.trim(),

          last_name:
            profile.last_name.trim(),

          phone:
            profile.phone.trim(),
        });

      setProfile((current) => ({
        ...current,
        first_name:
          updatedUser.first_name ||
          current.first_name,

        last_name:
          updatedUser.last_name ||
          current.last_name,

        email:
          updatedUser.email ||
          current.email,

        phone:
          updatedUser.phone ||
          current.phone,

        student_id:
          updatedUser.student_id ||
          current.student_id,

        course:
          updatedUser.course ||
          current.course,

        year_of_study:
          updatedUser.year_of_study ??
          current.year_of_study,

        role:
          updatedUser.role ||
          current.role,
      }));

      updateUser(updatedUser);

      setEditing(false);
      setSaved(true);
    } catch (requestError) {
      console.error(
        'Unable to update student profile.',
        requestError,
      );

      const responseMessage =
        requestError?.response?.data?.detail ||
        requestError?.response?.data?.message;

      setError(
        responseMessage ||
          'Unable to update your profile. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadProfile();
    setEditing(false);
    setSaved(false);
    setError('');
  };

  const displayName =
    getFullName(profile);

  const initials =
    getInitials(profile);

  if (loading) {
    return (
      <section className="student-profile-page">
        <div className="student-page-container">
          <div className="profile-loading">
            <div className="profile-loading-icon">
              <RefreshCw size={24} />
            </div>

            <h2>Loading profile</h2>

            <p>
              Retrieving your account information...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="student-profile-page">
      <div className="student-page-container">

        {/* Header */}
        <div className="student-profile-header">

          <div>
            

            <h1>My Profile</h1>

            <p>
              Manage your personal information and
              view your student account details.
            </p>
          </div>

          <div className="profile-header-icon">
            <UserRound size={28} />
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="profile-alert profile-alert-error">
            <XCircle size={18} />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Profile Layout */}
        <div className="student-profile-layout">

          {/* Main Profile Card */}
          <div className="profile-main-card">

            <div className="profile-cover" />

            <div className="profile-main-content">

              <div className="profile-avatar-section">

                <div className="profile-avatar">
                  {initials}
                </div>

                <button
                  type="button"
                  className="profile-avatar-button"
                  aria-label="Change profile photo"
                  onClick={() => {
                    alert(
                      'Profile photo upload will be connected later.',
                    );
                  }}
                >
                  <Camera size={15} />
                </button>

              </div>

              <div className="profile-identity">

                <h2>{displayName}</h2>

                <p>
                  {profile.course ||
                    'Programme not provided'}
                </p>

                <span className="profile-status">
                  <CheckCircle2 size={14} />
                  Active Student
                </span>

              </div>

              <button
                type="button"
                className="btn btn-outline profile-edit-button"
                onClick={() => {
                  setEditing(true);
                  setSaved(false);
                  setError('');
                }}
                disabled={saving}
              >
                <Edit3 size={16} />
                Edit Profile
              </button>

            </div>

            {saved && (
              <div className="profile-save-message">
                <CheckCircle2 size={17} />
                Profile updated successfully.
              </div>
            )}

          </div>

          {/* Account Status */}
          <aside className="profile-side-card">

            <div className="profile-side-heading">
              <ShieldCheck size={19} />
              <h3>Account Status</h3>
            </div>

            <div className="profile-account-status">

              <div className="account-status-icon">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <strong>Active</strong>
                <span>
                  Your account is active
                </span>
              </div>

            </div>

            <div className="profile-side-divider" />

            <div className="profile-account-item">
              <span>Student ID</span>

              <strong>
                {profile.student_id ||
                  'Not provided'}
              </strong>
            </div>

            <div className="profile-account-item">
              <span>Account Type</span>

              <strong>
                {profile.role === 'admin'
                  ? 'Administrator'
                  : profile.role === 'officer'
                    ? 'Officer'
                    : 'Student'}
              </strong>
            </div>

            <div className="profile-account-item">
              <span>Year of Study</span>

              <strong>
                {getYearLabel(
                  profile.year_of_study,
                )}
              </strong>
            </div>

          </aside>

        </div>

        {/* Information */}
        <form
          className="profile-information-card"
          onSubmit={handleSubmit}
        >

          {/* Personal Information */}
          <div className="profile-section-heading">

            <div>
              <span className="profile-section-label">
                Personal Information
              </span>

              <h2>Account Details</h2>

              <p>
                Your basic student account information.
              </p>
            </div>

            {!editing && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setEditing(true);
                  setSaved(false);
                  setError('');
                }}
              >
                <Edit3 size={16} />
                Edit
              </button>
            )}

          </div>

          <div className="profile-fields">

            {/* First Name */}
            <div className="profile-field">

              <label htmlFor="first_name">
                First Name
              </label>

              {editing ? (
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={profile.first_name}
                  onChange={handleChange}
                  autoComplete="given-name"
                  required
                />
              ) : (
                <div className="profile-field-value">
                  <UserRound size={17} />

                  <span>
                    {profile.first_name ||
                      'Not provided'}
                  </span>
                </div>
              )}

            </div>

            {/* Last Name */}
            <div className="profile-field">

              <label htmlFor="last_name">
                Last Name
              </label>

              {editing ? (
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={profile.last_name}
                  onChange={handleChange}
                  autoComplete="family-name"
                  required
                />
              ) : (
                <div className="profile-field-value">
                  <UserRound size={17} />

                  <span>
                    {profile.last_name ||
                      'Not provided'}
                  </span>
                </div>
              )}

            </div>

            {/* Email */}
            <div className="profile-field">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="profile-field-value disabled">
                <Mail size={17} />

                <span>
                  {profile.email ||
                    'Not provided'}
                </span>
              </div>

            </div>

            {/* Phone */}
            <div className="profile-field">

              <label htmlFor="phone">
                Phone Number
              </label>

              {editing ? (
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              ) : (
                <div className="profile-field-value">
                  <Phone size={17} />

                  <span>
                    {profile.phone ||
                      'Not provided'}
                  </span>
                </div>
              )}

            </div>

          </div>

          {/* Academic Information */}
          <div className="profile-academic-section">

            <div className="profile-section-heading">

              <div>
                <span className="profile-section-label">
                  Academic Information
                </span>

                <h2>Student Details</h2>

                <p>
                  Information about your academic
                  profile.
                </p>
              </div>

            </div>

            <div className="profile-fields">

              {/* Student ID */}
              <div className="profile-field">

                <label>
                  Student ID
                </label>

                <div className="profile-field-value disabled">
                  <UserRound size={17} />

                  <span>
                    {profile.student_id ||
                      'Not provided'}
                  </span>
                </div>

              </div>

              {/* Programme */}
              <div className="profile-field">

                <label>
                  Programme
                </label>

                <div className="profile-field-value disabled">
                  <span>
                    {profile.course ||
                      'Not provided'}
                  </span>
                </div>

              </div>

              {/* Year */}
              <div className="profile-field">

                <label>
                  Year of Study
                </label>

                <div className="profile-field-value disabled">
                  <span>
                    {getYearLabel(
                      profile.year_of_study,
                    )}
                  </span>
                </div>

              </div>

              {/* Institution */}
              <div className="profile-field">

                <label>
                  Institution
                </label>

                <div className="profile-field-value disabled">
                  <span>
                    Taita Taveta University
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* Form Actions */}
          {editing && (
            <div className="profile-form-actions">

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="profile-button-spinner"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Save Changes
                  </>
                )}
              </button>

            </div>
          )}

        </form>

      </div>
    </section>
  );
}

export default StudentProfile;