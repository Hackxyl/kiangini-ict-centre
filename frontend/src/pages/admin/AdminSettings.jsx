import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Database,
  Globe2,
  KeyRound,
  LockKeyhole,
  Mail,
  RefreshCw,
  Save,
  Server,
  ShieldCheck,
  User,
  UserCog,
  X,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import api from '../../config/api';

import { useAuth } from '../../context/AuthContext';

import './AdminSettings.css';

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  if (typeof data?.message === 'string') {
    return data.message;
  }

  if (typeof data?.error === 'string') {
    return data.error;
  }

  if (data && typeof data === 'object') {
    const firstError = Object.values(data)[0];

    if (Array.isArray(firstError)) {
      return firstError[0];
    }

    if (typeof firstError === 'string') {
      return firstError;
    }
  }

  return 'Something went wrong. Please try again.';
}

function getHealthStatus(data) {
  if (!data) {
    return 'unknown';
  }

  return data.status === 'ok' ||
    data.status === 'healthy'
    ? 'healthy'
    : 'error';
}

export default function AdminSettings() {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const [password, setPassword] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [health, setHealth] = useState(null);

  const [loadingHealth, setLoadingHealth] =
    useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState('');

  const [passwordMessage, setPasswordMessage] =
    useState('');

  const [profileError, setProfileError] =
    useState('');

  const [passwordError, setPasswordError] =
    useState('');

  const [healthError, setHealthError] =
    useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfile({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  }, [user]);

  const loadHealth = useCallback(
    async ({
      showLoader = true,
    } = {}) => {
      try {
        if (showLoader) {
          setLoadingHealth(true);
        }

        setHealthError('');

        const response = await api.get(
          '/core/health/'
        );

        setHealth(response.data);
      } catch (error) {
        setHealth(null);
        setHealthError(
          getErrorMessage(error)
        );
      } finally {
        setLoadingHealth(false);
      }
    },
    []
  );

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPassword((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    setProfileMessage('');
    setProfileError('');

    if (!profile.first_name.trim()) {
      setProfileError(
        'First name is required.'
      );
      return;
    }

    if (!profile.last_name.trim()) {
      setProfileError(
        'Last name is required.'
      );
      return;
    }

    try {
      setSavingProfile(true);

      const response = await api.patch(
        '/auth/me/',
        {
          first_name:
            profile.first_name.trim(),
          last_name:
            profile.last_name.trim(),
          phone:
            profile.phone.trim(),
        }
      );

      const updatedUser =
        response?.data?.user ||
        response?.data?.data ||
        response?.data;

      if (updatedUser) {
        setUser?.(updatedUser);
      }

      setProfileMessage(
        'Profile information updated successfully.'
      );
    } catch (error) {
      setProfileError(
        getErrorMessage(error)
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    setPasswordMessage('');
    setPasswordError('');

    if (
      !password.current_password
    ) {
      setPasswordError(
        'Enter your current password.'
      );
      return;
    }

    if (
      password.new_password.length < 8
    ) {
      setPasswordError(
        'Your new password must contain at least 8 characters.'
      );
      return;
    }

    if (
      password.new_password !==
      password.confirm_password
    ) {
      setPasswordError(
        'The new passwords do not match.'
      );
      return;
    }

    try {
      setChangingPassword(true);

      await api.post(
        '/auth/change-password/',
        {
          current_password:
            password.current_password,
          new_password:
            password.new_password,
          confirm_password:
            password.confirm_password,
        }
      );

      setPassword({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });

      setPasswordMessage(
        'Password changed successfully.'
      );
    } catch (error) {
      setPasswordError(
        getErrorMessage(error)
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const healthStatus =
    getHealthStatus(health);

  return (
    <div className="admin-settings-page">
      <div className="admin-settings-shell">

        <header className="admin-settings-header">
          <div>
            <div className="admin-settings-eyebrow">
              <UserCog size={16} />
              <span>
                Administration
              </span>
            </div>

            <h1>
              Settings
            </h1>

            <p>
              Manage your administrator
              account and monitor the
              Kiangini ICT Centre system.
            </p>
          </div>
        </header>

        {/* PROFILE */}
        <section className="admin-settings-section">
          <div className="admin-settings-section-heading">
            <div className="settings-heading-icon profile">
              <User size={20} />
            </div>

            <div>
              <h2>
                Administrator profile
              </h2>

              <p>
                Update the personal information
                associated with your account.
              </p>
            </div>
          </div>

          <form
            className="admin-settings-card"
            onSubmit={saveProfile}
          >
            {profileError && (
              <div className="settings-alert error">
                <AlertCircle size={17} />
                <span>
                  {profileError}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setProfileError('')
                  }
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {profileMessage && (
              <div className="settings-alert success">
                <CheckCircle2 size={17} />
                <span>
                  {profileMessage}
                </span>
              </div>
            )}

            <div className="settings-profile-banner">
              <div className="settings-avatar">
                {(
                  profile.first_name ||
                  profile.email ||
                  'A'
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {profile.first_name ||
                    profile.last_name
                    ? `${profile.first_name} ${profile.last_name}`.trim()
                    : 'Administrator'}
                </strong>

                <span>
                  {profile.email ||
                    'Administrator account'}
                </span>

                <small>
                  Administrator
                </small>
              </div>
            </div>

            <div className="settings-form-grid">
              <label>
                <span>
                  First name
                </span>

                <div className="settings-input">
                  <User size={16} />

                  <input
                    name="first_name"
                    value={
                      profile.first_name
                    }
                    onChange={
                      handleProfileChange
                    }
                    placeholder="First name"
                  />
                </div>
              </label>

              <label>
                <span>
                  Last name
                </span>

                <div className="settings-input">
                  <User size={16} />

                  <input
                    name="last_name"
                    value={
                      profile.last_name
                    }
                    onChange={
                      handleProfileChange
                    }
                    placeholder="Last name"
                  />
                </div>
              </label>

              <label>
                <span>
                  Email address
                </span>

                <div className="settings-input disabled">
                  <Mail size={16} />

                  <input
                    value={
                      profile.email
                    }
                    disabled
                  />
                </div>

                <small>
                  Email is managed as the
                  account login identifier.
                </small>
              </label>

              <label>
                <span>
                  Phone number
                </span>

                <div className="settings-input">
                  <User size={16} />

                  <input
                    name="phone"
                    value={
                      profile.phone
                    }
                    onChange={
                      handleProfileChange
                    }
                    placeholder="+254..."
                  />
                </div>
              </label>
            </div>

            <div className="settings-card-footer">
              <span>
                Changes are saved to your
                administrator account.
              </span>

              <button
                type="submit"
                className="settings-primary-button"
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <RefreshCw
                    size={16}
                    className="settings-spin"
                  />
                ) : (
                  <Save size={16} />
                )}

                Save profile
              </button>
            </div>
          </form>
        </section>

        {/* PASSWORD */}
        <section className="admin-settings-section">
          <div className="admin-settings-section-heading">
            <div className="settings-heading-icon security">
              <LockKeyhole size={20} />
            </div>

            <div>
              <h2>
                Security
              </h2>

              <p>
                Change your administrator
                account password.
              </p>
            </div>
          </div>

          <form
            className="admin-settings-card"
            onSubmit={changePassword}
          >
            {passwordError && (
              <div className="settings-alert error">
                <AlertCircle size={17} />

                <span>
                  {passwordError}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPasswordError('')
                  }
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {passwordMessage && (
              <div className="settings-alert success">
                <CheckCircle2 size={17} />

                <span>
                  {passwordMessage}
                </span>
              </div>
            )}

            <div className="security-note">
              <ShieldCheck size={19} />

              <div>
                <strong>
                  Keep your administrator
                  account secure
                </strong>

                <span>
                  Use a strong password that
                  you do not reuse on other
                  services.
                </span>
              </div>
            </div>

            <div className="settings-form-grid security-grid">
              <label>
                <span>
                  Current password
                </span>

                <div className="settings-input">
                  <KeyRound size={16} />

                  <input
                    type={
                      showCurrentPassword
                        ? 'text'
                        : 'password'
                    }
                    name="current_password"
                    value={
                      password.current_password
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="Current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (value) => !value
                      )
                    }
                    className="password-toggle"
                  >
                    {showCurrentPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>
                </div>
              </label>

              <div />

              <label>
                <span>
                  New password
                </span>

                <div className="settings-input">
                  <KeyRound size={16} />

                  <input
                    type={
                      showNewPassword
                        ? 'text'
                        : 'password'
                    }
                    name="new_password"
                    value={
                      password.new_password
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="New password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (value) => !value
                      )
                    }
                    className="password-toggle"
                  >
                    {showNewPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>
                </div>
              </label>

              <label>
                <span>
                  Confirm new password
                </span>

                <div className="settings-input">
                  <KeyRound size={16} />

                  <input
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    name="confirm_password"
                    value={
                      password.confirm_password
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="Confirm new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    className="password-toggle"
                  >
                    {showConfirmPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>
                </div>
              </label>
            </div>

            <div className="settings-card-footer">
              <span>
                Minimum recommended length:
                8 characters.
              </span>

              <button
                type="submit"
                className="settings-primary-button"
                disabled={
                  changingPassword
                }
              >
                {changingPassword ? (
                  <RefreshCw
                    size={16}
                    className="settings-spin"
                  />
                ) : (
                  <LockKeyhole
                    size={16}
                  />
                )}

                Change password
              </button>
            </div>
          </form>
        </section>

        {/* SYSTEM HEALTH */}
        <section className="admin-settings-section">
          <div className="admin-settings-section-heading">
            <div className="settings-heading-icon system">
              <Server size={20} />
            </div>

            <div>
              <h2>
                System status
              </h2>

              <p>
                Monitor the health of the
                Kiangini ICT Centre platform.
              </p>
            </div>
          </div>

          <div className="admin-settings-card">
            <div className="system-status-header">
              <div>
                <span className="system-status-label">
                  Overall status
                </span>

                <div
                  className={`system-status-value ${healthStatus}`}
                >
                  {healthStatus ===
                  'healthy' ? (
                    <CheckCircle2
                      size={18}
                    />
                  ) : (
                    <AlertCircle
                      size={18}
                    />
                  )}

                  {healthStatus ===
                  'healthy'
                    ? 'All systems operational'
                    : 'System requires attention'}
                </div>
              </div>

              <button
                type="button"
                className="settings-outline-button"
                onClick={() =>
                  loadHealth()
                }
                disabled={
                  loadingHealth
                }
              >
                <RefreshCw
                  size={16}
                  className={
                    loadingHealth
                      ? 'settings-spin'
                      : ''
                  }
                />

                Refresh status
              </button>
            </div>

            {healthError && (
              <div className="settings-alert error">
                <AlertCircle size={17} />

                <span>
                  {healthError}
                </span>
              </div>
            )}

            <div className="system-health-grid">
              <div className="health-item">
                <div className="health-item-icon api">
                  <Globe2 size={18} />
                </div>

                <div>
                  <strong>
                    API
                  </strong>

                  <span>
                    REST API service
                  </span>
                </div>

                <HealthBadge
                  value={
                    health?.api
                  }
                />
              </div>

              <div className="health-item">
                <div className="health-item-icon database">
                  <Database size={18} />
                </div>

                <div>
                  <strong>
                    Database
                  </strong>

                  <span>
                    PostgreSQL database
                  </span>
                </div>

                <HealthBadge
                  value={
                    health?.database
                  }
                />
              </div>

              <div className="health-item">
                <div className="health-item-icon auth">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <strong>
                    Authentication
                  </strong>

                  <span>
                    JWT authentication
                  </span>
                </div>

                <HealthBadge
                  value={
                    health?.authentication
                  }
                />
              </div>

              <div className="health-item">
                <div className="health-item-icon application">
                  <Activity size={18} />
                </div>

                <div>
                  <strong>
                    Application
                  </strong>

                  <span>
                    Django application
                  </span>
                </div>

                <HealthBadge
                  value={
                    health?.application
                  }
                />
              </div>
            </div>

            <div className="system-information">
              <div>
                <span>
                  Service
                </span>

                <strong>
                  {health?.service ||
                    'Kiangini ICT Centre API'}
                </strong>
              </div>

              <div>
                <span>
                  Environment
                </span>

                <strong>
                  Production API
                </strong>
              </div>

              <div>
                <span>
                  Authentication
                </span>

                <strong>
                  JWT
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* ADMIN ACCOUNT */}
        <section className="admin-settings-section">
          <div className="admin-settings-section-heading">
            <div className="settings-heading-icon account">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h2>
                Account information
              </h2>

              <p>
                Information about your
                current administrator account.
              </p>
            </div>
          </div>

          <div className="admin-settings-card account-card">
            <div className="account-row">
              <span>
                Account role
              </span>

              <strong>
                Administrator
              </strong>
            </div>

            <div className="account-row">
              <span>
                Email
              </span>

              <strong>
                {user?.email || '—'}
              </strong>
            </div>

            <div className="account-row">
              <span>
                Account status
              </span>

              <strong className="account-active">
                <CheckCircle2
                  size={15}
                />
                Active
              </strong>
            </div>

            <div className="account-row">
              <span>
                Access level
              </span>

              <strong>
                Full administration
              </strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HealthBadge({ value }) {
  const healthy =
    value === 'ok' ||
    value === 'healthy';

  return (
    <span
      className={`health-badge ${
        healthy
          ? 'healthy'
          : 'unavailable'
      }`}
    >
      {healthy ? (
        <CheckCircle2 size={13} />
      ) : (
        <AlertCircle size={13} />
      )}

      {healthy
        ? 'Operational'
        : 'Unavailable'}
    </span>
  );
}