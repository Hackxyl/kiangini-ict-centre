import {
  ArrowUpRight,
  Globe2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import './Footer.css';

function Footer() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
  } = useAuth();

  const handleDashboard = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    switch (user?.role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;

      case 'officer':
        navigate('/officer/dashboard');
        break;

      case 'student':
      default:
        navigate('/student/dashboard');
        break;
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-grid">

        {/* Brand */}
        <div className="footer-brand">
          <Link
            to="/"
            className="footer-logo"
          >
            <span className="brand-mark">
                 <img
                     src="/images/hero-ict.png"
                     alt="Kiangini ICT Centre"
                />
            </span>

            <span className="footer-brand-text">
              <strong>Kiangini</strong>
              <small>ICT Centre</small>
            </span>
          </Link>

          <p>
            Empowering students and the community through
            accessible, reliable and innovative ICT services.
          </p>

          <div className="footer-tagline">
            <span className="footer-tagline-dot" />
            Digital infrastructure for a smarter future
          </div>
        </div>


        {/* Platform */}
        <div className="footer-column">
          <h3>Platform</h3>

          <Link to="/services">
            ICT Services
          </Link>

          <Link to="/services">
            Computer Access
          </Link>

          <Link to="/services">
            Internet Services
          </Link>

          <Link to="/services">
            Facility Booking
          </Link>
        </div>


        {/* Resources */}
        <div className="footer-column">
          <h3>Resources</h3>

          <Link to="/about">
            About Centre
          </Link>

          <Link to="/announcements">
            Announcements
          </Link>

          <Link to="/contact">
            Contact Support
          </Link>

          {/* Dashboard / Student Portal */}
          <button
            type="button"
            onClick={handleDashboard}
            className="footer-dashboard-link"
          >
            {isAuthenticated
              ? 'Open Dashboard'
              : 'Student Portal'}

            <ArrowUpRight size={13} />
          </button>
        </div>


        {/* Contact */}
        <div className="footer-column">
          <h3>Connect</h3>

          <div className="footer-contact-card">
            <strong>
              Kiangini ICT Centre
            </strong>

            <span>
              Reliable ICT infrastructure,
              support and digital services.
            </span>
          </div>
        </div>

      </div>


      {/* Technology line */}
      <div className="container">
        <div className="footer-tech-line">
          <span>
            Built for
          </span>

          <strong>
            smarter ICT access
          </strong>

          <span className="footer-tech-separator">
            •
          </span>

          <span>
            Designed for students &amp; community
          </span>
        </div>
      </div>


      {/* Bottom */}
      <div className="container footer-bottom">
        <p>
          © {new Date().getFullYear()} Kiangini ICT Centre.
          All rights reserved.
        </p>

        <div>
          <Link to="/">
            Privacy Policy
          </Link>

          <Link to="/">
            Terms of Service
          </Link>
        </div>
      </div>

    </footer>
  );
}

export default Footer;