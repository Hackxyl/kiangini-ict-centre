import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

import './OfficerSettings.css';

const OfficerSettings = () => {
  const { user, logout } = useAuth();

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState('');

  const [passwordSuccess, setPasswordSuccess] =
    useState('');

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [logoutError, setLogoutError] =
    useState('');

  const roleLabel =
    user?.role === 'admin'
      ? 'Administrator'
      : 'ICT Officer';

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));

    setPasswordError('');
    setPasswordSuccess('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const getPasswordStrength = () => {
    const password = passwordForm.new_password;

    if (!password) {
      return {
        label: '',
        level: 0,
      };
    }

    let score = 0;

    if (password.length >= 8) {
      score += 1;
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }

    if (score <= 2) {
      return {
        label: 'Weak',
        level: 1,
      };
    }

    if (score <= 3) {
      return {
        label: 'Fair',
        level: 2,
      };
    }

    if (score === 4) {
      return {
        label: 'Good',
        level: 3,
      };
    }

    return {
      label: 'Strong',
      level: 4,
    };
  };

  const passwordStrength =
    getPasswordStrength();

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.current_password) {
      setPasswordError(
        'Enter your current password.',
      );
      return;
    }

    if (!passwordForm.new_password) {
      setPasswordError(
        'Enter your new password.',
      );
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError(
        'Your new password must contain at least 8 characters.',
      );
      return;
    }

    if (
      passwordForm.new_password !==
      passwordForm.new_password_confirm
    ) {
      setPasswordError(
        'Your new passwords do not match.',
      );
      return;
    }

    if (
      passwordForm.current_password ===
      passwordForm.new_password
    ) {
      setPasswordError(
        'Your new password must be different from your current password.',
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const response =
        await authService.changePassword(
          passwordForm.current_password,
          passwordForm.new_password,
          passwordForm.new_password_confirm,
        );

      setPasswordSuccess(
        response.detail ||
          'Your password has been changed successfully.',
      );

      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirm: '',
      });

      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
    } catch (error) {
      console.error(
        'Unable to change password.',
        error,
      );

      const responseData =
        error.response?.data;

      if (
        typeof responseData === 'string'
      ) {
        setPasswordError(
          responseData,
        );
      } else if (
        responseData?.detail
      ) {
        setPasswordError(
          responseData.detail,
        );
      } else if (
        responseData &&
        typeof responseData === 'object'
      ) {
        const messages = Object.values(
          responseData,
        )
          .flat()
          .filter(Boolean);

        setPasswordError(
          messages[0] ||
            'Unable to change your password. Please check your details and try again.',
        );
      } else {
        setPasswordError(
          'Unable to change your password. Please try again.',
        );
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setLogoutError('');

      await logout();
    } catch (error) {
      console.error(
        'Unable to sign out.',
        error,
      );

      setLogoutError(
        'Unable to sign out completely. Please try again.',
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="officer-settings-page">
      <div className="officer-settings">
        <header className="settings-page-header">
          <div>
            <span className="settings-eyebrow">
              Account configuration
            </span>

            <h1>Settings</h1>

            <p>
              Manage your account, security and access
              preferences for the Kiangini ICT Centre
              platform.
            </p>
          </div>

          <div className="settings-header-badge">
            <ShieldCheck size={17} />

            <span>Secure account</span>
          </div>
        </header>

        {logoutError && (
          <div className="settings-alert settings-alert-error">
            <AlertCircle size={18} />

            <span>{logoutError}</span>
          </div>
        )}

        <div className="settings-layout">
          <section className="settings-main">
            {/* ACCOUNT */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-icon settings-card-icon-blue">
                  <UserRound size={19} />
                </div>

                <div>
                  <span>Account</span>

                  <h2>Account information</h2>

                  <p>
                    Basic information associated with your
                    Kiangini ICT Centre account.
                  </p>
                </div>
              </div>

              <div className="settings-info-grid">
                <div className="settings-info-item">
                  <div className="settings-info-icon">
                    <Mail size={17} />
                  </div>

                  <div>
                    <span>Email address</span>

                    <strong>
                      {user?.email || '—'}
                    </strong>
                  </div>
                </div>

                <div className="settings-info-item">
                  <div className="settings-info-icon settings-info-icon-indigo">
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <span>Access level</span>

                    <strong>
                      {roleLabel}
                    </strong>
                  </div>
                </div>

                <div className="settings-info-item">
                  <div className="settings-info-icon settings-info-icon-cyan">
                    <CheckCircle2 size={17} />
                  </div>

                  <div>
                    <span>Account status</span>

                    <strong className="settings-status">
                      <span className="settings-status-dot" />
                      Active
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* SECURITY */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-icon settings-card-icon-indigo">
                  <KeyRound size={19} />
                </div>

                <div>
                  <span>Security</span>

                  <h2>Password & security</h2>

                  <p>
                    Change your password and keep your
                    account protected.
                  </p>
                </div>
              </div>

              <div className="security-panel">
                <div className="security-panel-icon">
                  <ShieldCheck size={22} />
                </div>

                <div className="security-panel-content">
                  <h3>Your account is protected</h3>

                  <p>
                    Passwords are securely handled by the
                    Kiangini ICT Centre backend.
                  </p>
                </div>

                <span className="security-badge">
                  Protected
                </span>
              </div>

              <div className="settings-divider" />

              <div className="password-section">
                <div className="password-section-heading">
                  <div>
                    <h3>Change password</h3>

                    <p>
                      Use a strong password that you do not
                      use on another service.
                    </p>
                  </div>
                </div>

                {passwordError && (
                  <div className="password-alert password-alert-error">
                    <AlertCircle size={17} />

                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="password-alert password-alert-success">
                    <CheckCircle2 size={17} />

                    <span>
                      {passwordSuccess}
                    </span>
                  </div>
                )}

                <form
                  className="password-form"
                  onSubmit={handlePasswordSubmit}
                >
                  <div className="password-field">
                    <label htmlFor="current_password">
                      Current password
                    </label>

                    <div className="password-input-wrapper">
                      <KeyRound size={17} />

                      <input
                        id="current_password"
                        name="current_password"
                        type={
                          showPasswords.current
                            ? 'text'
                            : 'password'
                        }
                        value={
                          passwordForm.current_password
                        }
                        onChange={
                          handlePasswordChange
                        }
                        placeholder="Enter current password"
                        autoComplete="current-password"
                      />

                      <button
                        type="button"
                        className="password-visibility-button"
                        onClick={() =>
                          togglePasswordVisibility(
                            'current',
                          )
                        }
                        aria-label={
                          showPasswords.current
                            ? 'Hide current password'
                            : 'Show current password'
                        }
                      >
                        {showPasswords.current ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="password-field">
                    <label htmlFor="new_password">
                      New password
                    </label>

                    <div className="password-input-wrapper">
                      <KeyRound size={17} />

                      <input
                        id="new_password"
                        name="new_password"
                        type={
                          showPasswords.new
                            ? 'text'
                            : 'password'
                        }
                        value={
                          passwordForm.new_password
                        }
                        onChange={
                          handlePasswordChange
                        }
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        className="password-visibility-button"
                        onClick={() =>
                          togglePasswordVisibility(
                            'new',
                          )
                        }
                        aria-label={
                          showPasswords.new
                            ? 'Hide new password'
                            : 'Show new password'
                        }
                      >
                        {showPasswords.new ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    {passwordForm.new_password && (
                      <div className="password-strength">
                        <div className="password-strength-header">
                          <span>
                            Password strength
                          </span>

                          <strong
                            className={`strength-level-${passwordStrength.level}`}
                          >
                            {passwordStrength.label}
                          </strong>
                        </div>

                        <div className="strength-bars">
                          {[1, 2, 3, 4].map(
                            (bar) => (
                              <span
                                key={bar}
                                className={
                                  bar <=
                                  passwordStrength.level
                                    ? `strength-bar strength-active strength-${passwordStrength.level}`
                                    : 'strength-bar'
                                }
                              />
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="password-field">
                    <label htmlFor="new_password_confirm">
                      Confirm new password
                    </label>

                    <div className="password-input-wrapper">
                      <KeyRound size={17} />

                      <input
                        id="new_password_confirm"
                        name="new_password_confirm"
                        type={
                          showPasswords.confirm
                            ? 'text'
                            : 'password'
                        }
                        value={
                          passwordForm.new_password_confirm
                        }
                        onChange={
                          handlePasswordChange
                        }
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        className="password-visibility-button"
                        onClick={() =>
                          togglePasswordVisibility(
                            'confirm',
                          )
                        }
                        aria-label={
                          showPasswords.confirm
                            ? 'Hide password confirmation'
                            : 'Show password confirmation'
                        }
                      >
                        {showPasswords.confirm ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="password-form-footer">
                    <div className="password-requirements">
                      <span>
                        Password requirements
                      </span>

                      <p>
                        At least 8 characters. Django may
                        require additional strength rules.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="change-password-button"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <>
                          <span className="settings-button-spinner" />

                          Changing...
                        </>
                      ) : (
                        <>
                          <KeyRound size={17} />

                          Change password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* SESSION */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-icon settings-card-icon-cyan">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <span>Session</span>

                  <h2>Current session</h2>

                  <p>
                    Information about the session currently
                    active on this device.
                  </p>
                </div>
              </div>

              <div className="session-card">
                <div className="session-indicator">
                  <span />
                </div>

                <div className="session-content">
                  <h3>Current device</h3>

                  <p>
                    You are currently signed in to the
                    Kiangini ICT Centre platform.
                  </p>
                </div>

                <span className="session-active">
                  Active
                </span>
              </div>
            </div>

            {/* SIGN OUT */}
            <div className="settings-danger-card">
              <div className="danger-header">
                <div className="danger-icon">
                  <LogOut size={19} />
                </div>

                <div>
                  <span>Session control</span>

                  <h2>Sign out</h2>

                  <p>
                    End your current authenticated session
                    on this device.
                  </p>
                </div>
              </div>

              <div className="danger-content">
                <div>
                  <h3>
                    Sign out of Kiangini ICT Centre
                  </h3>

                  <p>
                    You will need to sign in again to access
                    officer features.
                  </p>
                </div>

                <button
                  type="button"
                  className="settings-logout-button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <>
                      <span className="settings-button-spinner" />

                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut size={17} />

                      Sign out
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* SIDEBAR */}
          <aside className="settings-sidebar">
            <div className="settings-security-card">
              <div className="settings-security-icon">
                <ShieldCheck size={23} />
              </div>

              <span>Security status</span>

              <h2>Your account is secure</h2>

              <p>
                Your account uses authenticated API requests
                and protected session tokens.
              </p>

              <div className="security-check-list">
                <div>
                  <CheckCircle2 size={16} />

                  <span>
                    Authenticated session
                  </span>
                </div>

                <div>
                  <CheckCircle2 size={16} />

                  <span>
                    Protected API access
                  </span>
                </div>

                <div>
                  <CheckCircle2 size={16} />

                  <span>
                    Role-based permissions
                  </span>
                </div>
              </div>
            </div>

            <div className="settings-help-card">
              <span>Need help?</span>

              <h3>Manage your profile</h3>

              <p>
                Update your name and phone number from your
                Officer Profile page.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OfficerSettings;