import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import './Login.css';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      await login(email, password);

      const destination =
        location.state?.from?.pathname ||
        '/student/dashboard';

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      const responseData = error.response?.data;

      if (responseData?.detail) {
        setError(responseData.detail);
      } else if (responseData?.non_field_errors) {
        setError(responseData.non_field_errors[0]);
      } else {
        setError(
          'Unable to sign in. Please check your email and password.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">

      {/* =====================================================
          LOGIN VISUAL PANEL
      ===================================================== */}

      <section className="login-visual">

        <div className="login-visual-pattern">
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

        <div className="login-visual-content">

          <Link to="/" className="login-brand">
            <span className="login-brand-mark">K</span>

            <span className="login-brand-text">
              <strong>Kiangini</strong>
              <small>ICT Centre</small>
            </span>
          </Link>

          <div className="login-visual-message">

            <span className="login-visual-label">
              KIANGINI ICT CENTRE
            </span>

            <h1>
              Your digital
              <span> learning space.</span>
            </h1>

            <p>
              Access ICT services, facility bookings, announcements
              and digital resources through your Kiangini account.
            </p>

          </div>

          <div className="login-visual-features">

            <div className="login-feature">

              <div className="login-feature-icon">
                <ShieldCheck size={18} />
              </div>

              <div>
                <strong>Secure access</strong>

                <span>
                  Your account and information are protected.
                </span>
              </div>

            </div>

            <div className="login-feature">

              <div className="login-feature-icon">
                <LockKeyhole size={18} />
              </div>

              <div>
                <strong>Personal dashboard</strong>

                <span>
                  Manage your services and activities in one place.
                </span>
              </div>

            </div>

          </div>

        </div>

        <div className="login-visual-footer">
          <span>Kiangini ICT Centre</span>
          <span>•</span>
          <span>Digital Services</span>
        </div>

      </section>


      {/* =====================================================
          LOGIN FORM
      ===================================================== */}

      <main className="login-main">

        <div className="login-form-container">

          {/* Mobile Brand */}

          <div className="login-mobile-brand">

            <Link to="/" className="login-brand">

              <span className="login-brand-mark">
                K
              </span>

              <span className="login-brand-text">
                <strong>Kiangini</strong>
                <small>ICT Centre</small>
              </span>

            </Link>

          </div>


          {/* Heading */}

          <div className="login-heading">

            <span className="login-form-label">
              Welcome back
            </span>

            <h2>
              Sign in to your account.
            </h2>

            <p>
              Enter your details to access the Kiangini ICT Centre
              platform.
            </p>

          </div>


          {/* API Error */}

          {error && (
            <div
              className="login-error"
              role="alert"
            >
              {error}
            </div>
          )}


          {/* Login Form */}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* Email */}

            <div className="login-form-group">

              <label htmlFor="login-email">
                Email address
              </label>

              <div className="login-input-wrapper">

                <UserRound
                  size={18}
                  className="login-input-icon"
                />

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                  disabled={submitting}
                />

              </div>

            </div>


            {/* Password */}

            <div className="login-form-group">

              <div className="login-label-row">

                <label htmlFor="login-password">
                  Password
                </label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>

              </div>

              <div className="login-input-wrapper">

                <LockKeyhole
                  size={18}
                  className="login-input-icon"
                />

                <input
                  id="login-password"
                  name="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  disabled={submitting}
                />

                <button
                  type="button"
                  className="login-password-toggle"
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
                  disabled={submitting}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>


            {/* Remember Me */}

            <label className="login-remember">

              <input
                type="checkbox"
                name="remember"
                disabled={submitting}
              />

              <span>
                Remember me
              </span>

            </label>


            {/* Submit */}

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={submitting}
            >

              <LogIn size={17} />

              <span>
                {submitting
                  ? 'Signing In...'
                  : 'Sign In'}
              </span>

              {!submitting && (
                <ArrowRight size={17} />
              )}

            </button>

          </form>


          {/* Register */}

          <div className="login-register">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
              <ArrowRight size={15} />
            </Link>

          </div>


          {/* Security Notice */}

          <div className="login-security">

            <ShieldCheck size={17} />

            <p>
              Your account information is handled securely.
              Never share your password with anyone.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Login;