import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError('');

    setFieldErrors((current) => ({
      ...current,
      [name]: '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setFieldErrors({});

    if (formData.password !== formData.password_confirm) {
      setFieldErrors({
        password_confirm: ['Passwords do not match.'],
      });

      return;
    }

    if (formData.password.length < 8) {
      setFieldErrors({
        password: [
          'Password must be at least 8 characters.',
        ],
      });

      return;
    }

    setSubmitting(true);

    try {
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
      });

      navigate('/login', {
        replace: true,
        state: {
          registered: true,
          email: formData.email,
        },
      });
    } catch (error) {
      const responseData = error.response?.data;

      if (
        responseData &&
        typeof responseData === 'object'
      ) {
        setFieldErrors(responseData);

        if (responseData.detail) {
          setError(responseData.detail);
        } else if (responseData.non_field_errors) {
          setError(
            responseData.non_field_errors[0],
          );
        } else if (responseData.email) {
          setError(responseData.email[0]);
        } else {
          setError(
            'Please correct the highlighted fields and try again.',
          );
        }
      } else {
        setError(
          'Unable to create your account. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">

      {/* =====================================================
          VISUAL PANEL
      ===================================================== */}

      <section className="register-visual">

        <div className="register-visual-pattern">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="register-visual-content">

          <Link to="/" className="register-brand">
            <span className="register-brand-mark">
              K
            </span>

            <span className="register-brand-text">
              <strong>Kiangini</strong>
              <small>ICT Centre</small>
            </span>
          </Link>

          <div className="register-visual-message">

            <span className="register-visual-label">
              JOIN KIANGINI
            </span>

            <h1>
              Everything you need,
              <span> in one place.</span>
            </h1>

            <p>
              Create your Kiangini account and get
              convenient access to ICT services, facility
              bookings, announcements and digital resources.
            </p>

            <div className="register-benefits">

              <div className="register-benefit">
                <span>
                  <Check size={15} />
                </span>
                <p>Access ICT facilities</p>
              </div>

              <div className="register-benefit">
                <span>
                  <Check size={15} />
                </span>
                <p>Manage facility bookings</p>
              </div>

              <div className="register-benefit">
                <span>
                  <Check size={15} />
                </span>
                <p>Receive important announcements</p>
              </div>

              <div className="register-benefit">
                <span>
                  <Check size={15} />
                </span>
                <p>Get ICT support and services</p>
              </div>

            </div>

          </div>

        </div>

        <div className="register-visual-footer">
          <span>Kiangini ICT Centre</span>
          <span>•</span>
          <span>Digital Services</span>
        </div>

      </section>


      {/* =====================================================
          REGISTER FORM
      ===================================================== */}

      <main className="register-main">

        <div className="register-form-container">

          <div className="register-mobile-brand">

            <Link to="/" className="register-brand">

              <span className="register-brand-mark">
                K
              </span>

              <span className="register-brand-text">
                <strong>Kiangini</strong>
                <small>ICT Centre</small>
              </span>

            </Link>

          </div>


          {/* Heading */}

          <div className="register-heading">

            <span className="register-form-label">
              Create account
            </span>

            <h2>
              Join Kiangini ICT Centre.
            </h2>

            <p>
              Create your account to access our digital
              services and manage your ICT activities.
            </p>

          </div>


          {/* General error */}

          {error && (
            <div className="register-form-error">
              {error}
            </div>
          )}


          {/* Form */}

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            {/* Full name */}

            <div className="register-password-row">

              {/* First name */}

              <div className="register-form-group">

                <label htmlFor="register-first-name">
                  First name
                </label>

                <div className="register-input-wrapper">

                  <UserRound
                    size={18}
                    className="register-input-icon"
                  />

                  <input
                    id="register-first-name"
                    name="first_name"
                    type="text"
                    placeholder="First name"
                    autoComplete="given-name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />

                </div>

                {fieldErrors.first_name?.[0] && (
                  <small className="register-field-error">
                    {fieldErrors.first_name[0]}
                  </small>
                )}

              </div>


              {/* Last name */}

              <div className="register-form-group">

                <label htmlFor="register-last-name">
                  Last name
                </label>

                <div className="register-input-wrapper">

                  <UserRound
                    size={18}
                    className="register-input-icon"
                  />

                  <input
                    id="register-last-name"
                    name="last_name"
                    type="text"
                    placeholder="Last name"
                    autoComplete="family-name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />

                </div>

                {fieldErrors.last_name?.[0] && (
                  <small className="register-field-error">
                    {fieldErrors.last_name[0]}
                  </small>
                )}

              </div>

            </div>


            {/* Email */}

            <div className="register-form-group">

              <label htmlFor="register-email">
                Email address
              </label>

              <div className="register-input-wrapper">

                <Mail
                  size={18}
                  className="register-input-icon"
                />

                <input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

              {fieldErrors.email?.[0] && (
                <small className="register-field-error">
                  {fieldErrors.email[0]}
                </small>
              )}

            </div>


            {/* Password row */}

            <div className="register-password-row">

              {/* Password */}

              <div className="register-form-group">

                <label htmlFor="register-password">
                  Password
                </label>

                <div className="register-input-wrapper">

                  <LockKeyhole
                    size={18}
                    className="register-input-icon"
                  />

                  <input
                    id="register-password"
                    name="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Create password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (visible) => !visible,
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

                {fieldErrors.password?.[0] && (
                  <small className="register-field-error">
                    {fieldErrors.password[0]}
                  </small>
                )}

              </div>


              {/* Confirm password */}

              <div className="register-form-group">

                <label htmlFor="register-confirm-password">
                  Confirm password
                </label>

                <div className="register-input-wrapper">

                  <LockKeyhole
                    size={18}
                    className="register-input-icon"
                  />

                  <input
                    id="register-confirm-password"
                    name="password_confirm"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (visible) => !visible,
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

                {fieldErrors.password_confirm?.[0] && (
                  <small className="register-field-error">
                    {fieldErrors.password_confirm[0]}
                  </small>
                )}

              </div>

            </div>


            {/* Terms */}

            <label className="register-terms">

              <input
                type="checkbox"
                name="terms"
                required
              />

              <span>
                I agree to the Kiangini ICT Centre terms and
                conditions and understand the centre's usage
                guidelines.
              </span>

            </label>


            {/* Submit */}

            <button
              type="submit"
              className="btn btn-primary register-submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={17} />
                  Create Account
                  <ArrowRight size={17} />
                </>
              )}
            </button>

          </form>


          {/* Login link */}

          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
              <ArrowRight size={15} />
            </Link>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Register;