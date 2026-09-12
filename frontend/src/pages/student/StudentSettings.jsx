import { useEffect, useState } from 'react';

import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  GraduationCap,
  Hash,
  LogOut,
  AlertCircle,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

import './StudentSettings.css';


/*
|--------------------------------------------------------------------------
| Student Settings
|--------------------------------------------------------------------------
*/

function StudentSettings() {
  const {
    user,
    updateUser,
    logout,
  } = useAuth();


  /*
  |--------------------------------------------------------------------------
  | Profile state
  |--------------------------------------------------------------------------
  */

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });


  /*
  |--------------------------------------------------------------------------
  | Password state
  |--------------------------------------------------------------------------
  */

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });


  /*
  |--------------------------------------------------------------------------
  | Password visibility
  |--------------------------------------------------------------------------
  */

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | Loading states
  |--------------------------------------------------------------------------
  */

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | Messages
  |--------------------------------------------------------------------------
  */

  const [profileMessage, setProfileMessage] =
    useState('');

  const [profileError, setProfileError] =
    useState('');

  const [passwordMessage, setPasswordMessage] =
    useState('');

  const [passwordError, setPasswordError] =
    useState('');

  const [logoutLoading, setLogoutLoading] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | Load authenticated user
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfile({
      first_name:
        user.first_name || '',

      last_name:
        user.last_name || '',

      phone:
        user.phone || '',
    });
  }, [user]);


  /*
  |--------------------------------------------------------------------------
  | Profile input
  |--------------------------------------------------------------------------
  */

  const handleProfileChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setProfileMessage('');
    setProfileError('');
  };


  /*
  |--------------------------------------------------------------------------
  | Password input
  |--------------------------------------------------------------------------
  */

  const handlePasswordChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setPasswordForm(
      (current) => ({
        ...current,
        [name]: value,
      }),
    );

    setPasswordMessage('');
    setPasswordError('');
  };


  /*
  |--------------------------------------------------------------------------
  | Save profile
  |--------------------------------------------------------------------------
  */

  const handleProfileSave = async (
    event,
  ) => {
    event.preventDefault();

    setProfileMessage('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const updatedUser =
        await authService.updateMe(
          profile,
        );

      updateUser(updatedUser);

      setProfileMessage(
        'Your profile has been updated successfully.',
      );
    } catch (error) {
      console.error(
        'Unable to update student profile:',
        error,
      );

      const responseData =
        error?.response?.data;

      const backendMessage =
        responseData?.detail ||
        responseData?.message ||
        responseData?.error;

      setProfileError(
        backendMessage ||
          'Unable to update your profile. Please check your information and try again.',
      );
    } finally {
      setProfileLoading(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Password validation
  |--------------------------------------------------------------------------
  */

  const validatePassword = () => {
    if (
      !passwordForm.currentPassword
    ) {
      return 'Enter your current password.';
    }

    if (
      !passwordForm.newPassword
    ) {
      return 'Enter your new password.';
    }

    if (
      passwordForm.newPassword.length <
      8
    ) {
      return 'Your new password must contain at least 8 characters.';
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      return 'Your new passwords do not match.';
    }

    if (
      passwordForm.currentPassword ===
      passwordForm.newPassword
    ) {
      return 'Your new password must be different from your current password.';
    }

    return '';
  };


  /*
  |--------------------------------------------------------------------------
  | Password strength
  |--------------------------------------------------------------------------
  */

  const getPasswordStrength =
    () => {
      const password =
        passwordForm.newPassword;

      if (!password) {
        return {
          label: '',
          level: 0,
        };
      }

      let score = 0;

      if (
        password.length >= 8
      ) {
        score += 1;
      }

      if (
        /[A-Z]/.test(password)
      ) {
        score += 1;
      }

      if (
        /[0-9]/.test(password)
      ) {
        score += 1;
      }

      if (
        /[^A-Za-z0-9]/.test(password)
      ) {
        score += 1;
      }

      if (score <= 1) {
        return {
          label: 'Weak',
          level: 1,
        };
      }

      if (score === 2) {
        return {
          label: 'Fair',
          level: 2,
        };
      }

      if (score === 3) {
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


  /*
  |--------------------------------------------------------------------------
  | Change password
  |--------------------------------------------------------------------------
  */

  const handlePasswordChangeSubmit =
    async (event) => {
      event.preventDefault();

      setPasswordMessage('');
      setPasswordError('');

      const validationError =
        validatePassword();

      if (validationError) {
        setPasswordError(
          validationError,
        );

        return;
      }

      setPasswordLoading(true);

      try {
        await authService.changePassword(
          passwordForm.currentPassword,
          passwordForm.newPassword,
          passwordForm.confirmPassword,
        );

        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        setPasswordMessage(
          'Your password has been changed successfully.',
        );
      } catch (error) {
        console.error(
          'Unable to change password:',
          error,
        );

        const responseData =
          error?.response?.data;

        let message =
          responseData?.detail ||
          responseData?.message ||
          responseData?.error;

        if (
          !message &&
          typeof responseData ===
            'object'
        ) {
          const firstField =
            Object.values(
              responseData,
            )[0];

          if (
            Array.isArray(
              firstField,
            )
          ) {
            message =
              firstField[0];
          } else if (
            typeof firstField ===
            'string'
          ) {
            message =
              firstField;
          }
        }

        setPasswordError(
          message ||
            'Unable to change your password. Please check your current password and try again.',
        );
      } finally {
        setPasswordLoading(false);
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = async () => {
    setLogoutLoading(true);

    try {
      await logout();
    } catch (error) {
      console.error(
        'Unable to log out:',
        error,
      );
    } finally {
      setLogoutLoading(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <section className="student-settings-page">

      <div className="student-page-container">


        {/* =========================================================
            HEADER
        ========================================================== */}

        <div className="student-settings-header">

          <div>

            <span className="dashboard-eyebrow">
              STUDENT PORTAL
            </span>

            <h1>
              Settings
            </h1>

            <p>
              Manage your student profile,
              account security and
              authentication settings.
            </p>

          </div>

          <div className="settings-header-icon">
            <ShieldCheck
              size={27}
            />
          </div>

        </div>


        {/* =========================================================
            PROFILE
        ========================================================== */}

        <section className="settings-card settings-profile-card">

          <div className="settings-card-header">

            <div className="settings-card-icon blue">
              <UserRound
                size={19}
              />
            </div>

            <div>

              <h2>
                Student profile
              </h2>

              <p>
                Update the personal
                information associated
                with your account.
              </p>

            </div>

          </div>


          <form
            className="student-profile-form"
            onSubmit={
              handleProfileSave
            }
          >

            <div className="student-settings-fields">


              {/* First name */}

              <div className="student-settings-field">

                <label htmlFor="first_name">
                  First name
                </label>

                <div className="settings-input-wrap">

                  <UserRound
                    size={16}
                  />

                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={
                      profile.first_name
                    }
                    onChange={
                      handleProfileChange
                    }
                    placeholder="First name"
                    autoComplete="given-name"
                  />

                </div>

              </div>


              {/* Last name */}

              <div className="student-settings-field">

                <label htmlFor="last_name">
                  Last name
                </label>

                <div className="settings-input-wrap">

                  <UserRound
                    size={16}
                  />

                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={
                      profile.last_name
                    }
                    onChange={
                      handleProfileChange
                    }
                    placeholder="Last name"
                    autoComplete="family-name"
                  />

                </div>

              </div>


              {/* Email */}

              <div className="student-settings-field">

                <label>
                  Email address
                </label>

                <div className="settings-input-wrap settings-input-disabled">

                  <Mail
                    size={16}
                  />

                  <input
                    type="email"
                    value={
                      user?.email ||
                      ''
                    }
                    disabled
                  />

                </div>

                <small>
                  Your email address is
                  managed by the account
                  system.
                </small>

              </div>


              {/* Phone */}

              <div className="student-settings-field">

                <label htmlFor="phone">
                  Phone number
                </label>

                <div className="settings-input-wrap">

                  <Phone
                    size={16}
                  />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={
                      profile.phone
                    }
                    onChange={
                      handleProfileChange
                    }
                    placeholder="+254..."
                    autoComplete="tel"
                  />

                </div>

              </div>

            </div>


            {/* Profile success */}

            {profileMessage && (
              <div className="settings-success-message">

                <CheckCircle2
                  size={17}
                />

                <span>
                  {profileMessage}
                </span>

              </div>
            )}


            {/* Profile error */}

            {profileError && (
              <div className="settings-error-message">

                <AlertCircle
                  size={17}
                />

                <span>
                  {profileError}
                </span>

              </div>
            )}


            <div className="settings-form-footer">

              <span>
                Changes are saved
                securely to your
                account.
              </span>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  profileLoading
                }
              >

                <Save
                  size={17}
                />

                {profileLoading
                  ? 'Saving...'
                  : 'Save Profile'}

              </button>

            </div>

          </form>

        </section>


        {/* =========================================================
            ACCOUNT INFORMATION
        ========================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon cyan">
              <GraduationCap
                size={19}
              />
            </div>

            <div>

              <h2>
                Account information
              </h2>

              <p>
                Information registered
                on your student account.
              </p>

            </div>

          </div>


          <div className="account-settings-list">

            <div className="account-setting-row">

              <span>
                Account type
              </span>

              <strong>
                {user?.role
                  ? user.role
                      .charAt(0)
                      .toUpperCase() +
                    user.role.slice(1)
                  : 'Student'}
              </strong>

            </div>


            <div className="account-setting-row">

              <span>
                Student ID
              </span>

              <strong>
                {user?.student_id ||
                  'Not provided'}
              </strong>

            </div>


            <div className="account-setting-row">

              <span>
                Course
              </span>

              <strong>
                {user?.course ||
                  'Not provided'}
              </strong>

            </div>


            <div className="account-setting-row">

              <span>
                Year of study
              </span>

              <strong>
                {user?.year_of_study
                  ? `Year ${user.year_of_study}`
                  : 'Not provided'}
              </strong>

            </div>


            <div className="account-setting-row">

              <span>
                Account status
              </span>

              <span className="active-account">

                <CheckCircle2
                  size={14}
                />

                {user?.is_active ===
                false
                  ? 'Inactive'
                  : 'Active'}

              </span>

            </div>

          </div>

        </section>


        {/* =========================================================
            SECURITY
        ========================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon emerald">
              <LockKeyhole
                size={19}
              />
            </div>

            <div>

              <h2>
                Change password
              </h2>

              <p>
                Keep your student
                account protected with
                a strong password.
              </p>

            </div>

          </div>


          <form
            className="password-form"
            onSubmit={
              handlePasswordChangeSubmit
            }
          >


            {/* Current password */}

            <div className="student-settings-field">

              <label htmlFor="currentPassword">
                Current password
              </label>

              <div className="settings-input-wrap">

                <LockKeyhole
                  size={16}
                />

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={
                    showCurrentPassword
                      ? 'text'
                      : 'password'
                  }
                  value={
                    passwordForm.currentPassword
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
                    setShowCurrentPassword(
                      (value) =>
                        !value,
                    )
                  }
                  aria-label={
                    showCurrentPassword
                      ? 'Hide current password'
                      : 'Show current password'
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>

            </div>


            {/* New password */}

            <div className="student-settings-field">

              <label htmlFor="newPassword">
                New password
              </label>

              <div className="settings-input-wrap">

                <LockKeyhole
                  size={16}
                />

                <input
                  id="newPassword"
                  name="newPassword"
                  type={
                    showNewPassword
                      ? 'text'
                      : 'password'
                  }
                  value={
                    passwordForm.newPassword
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
                    setShowNewPassword(
                      (value) =>
                        !value,
                    )
                  }
                  aria-label={
                    showNewPassword
                      ? 'Hide new password'
                      : 'Show new password'
                  }
                >
                  {showNewPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>


              {/* Password strength */}

              {passwordForm.newPassword && (
                <div className="password-strength">

                  <div className="password-strength-bars">

                    {[1, 2, 3, 4].map(
                      (level) => (
                        <span
                          key={level}
                          className={
                            level <=
                            passwordStrength.level
                              ? 'active'
                              : ''
                          }
                        />
                      ),
                    )}

                  </div>

                  <span>
                    {passwordStrength.label}
                  </span>

                </div>
              )}

            </div>


            {/* Confirm password */}

            <div className="student-settings-field">

              <label htmlFor="confirmPassword">
                Confirm new password
              </label>

              <div className="settings-input-wrap">

                <LockKeyhole
                  size={16}
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  value={
                    passwordForm.confirmPassword
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
                    setShowConfirmPassword(
                      (value) =>
                        !value,
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirmation password'
                      : 'Show confirmation password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>

            </div>


            {/* Password success */}

            {passwordMessage && (
              <div className="settings-success-message">

                <CheckCircle2
                  size={17}
                />

                <span>
                  {passwordMessage}
                </span>

              </div>
            )}


            {/* Password error */}

            {passwordError && (
              <div className="settings-error-message">

                <AlertCircle
                  size={17}
                />

                <span>
                  {passwordError}
                </span>

              </div>
            )}


            <div className="settings-form-footer">

              <span>
                Your password is
                securely processed by
                Django authentication.
              </span>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  passwordLoading
                }
              >

                <LockKeyhole
                  size={17}
                />

                {passwordLoading
                  ? 'Changing...'
                  : 'Change Password'}

              </button>

            </div>

          </form>

        </section>


        {/* =========================================================
            SECURITY STATUS
        ========================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon violet">
              <ShieldCheck
                size={19}
              />
            </div>

            <div>

              <h2>
                Security status
              </h2>

              <p>
                Current security
                information for your
                account.
              </p>

            </div>

          </div>


          <div className="security-list">

            <div className="security-action">

              <div className="security-action-icon">
                <Mail size={17} />
              </div>

              <div>

                <strong>
                  Email authentication
                </strong>

                <span>
                  Your account uses your
                  registered email address.
                </span>

              </div>

              <span className="security-status-badge success">
                Active
              </span>

            </div>


            <div className="security-action">

              <div className="security-action-icon">
                <LockKeyhole
                  size={17}
                />
              </div>

              <div>

                <strong>
                  Password protection
                </strong>

                <span>
                  Your password is managed
                  securely by Django.
                </span>

              </div>

              <span className="security-status-badge success">
                Protected
              </span>

            </div>


            <div className="security-action">

              <div className="security-action-icon">
                <ShieldCheck
                  size={17}
                />
              </div>

              <div>

                <strong>
                  JWT authentication
                </strong>

                <span>
                  Your portal session is
                  protected using access
                  and refresh tokens.
                </span>

              </div>

              <span className="security-status-badge success">
                Active
              </span>

            </div>

          </div>

        </section>


        {/* =========================================================
            LOGOUT
        ========================================================== */}

        <section className="settings-card settings-danger-card">

          <div className="settings-card-header">

            <div className="settings-card-icon red">
              <LogOut
                size={19}
              />
            </div>

            <div>

              <h2>
                Sign out
              </h2>

              <p>
                End your current student
                portal session.
              </p>

            </div>

          </div>


          <div className="logout-settings-row">

            <div>

              <strong>
                Sign out of this account
              </strong>

              <span>
                You will need to sign in
                again to access the
                student portal.
              </span>

            </div>

            <button
              type="button"
              className="btn btn-outline logout-button"
              onClick={
                handleLogout
              }
              disabled={
                logoutLoading
              }
            >

              <LogOut
                size={16}
              />

              {logoutLoading
                ? 'Signing out...'
                : 'Sign out'}

            </button>

          </div>

        </section>

      </div>

    </section>
  );
}

export default StudentSettings;