import { useState } from 'react';
import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
  } = useAuth();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleDashboard = () => {
    closeMenu();

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
    <header className="navbar">
      <div className="container navbar-inner">

        <Link
          to="/"
          className="navbar-brand"
          onClick={closeMenu}
        >
          <span className="brand-mark">
            <img
      src="/images/hero-ict.png"
      alt="Kiangini ICT Centre"
    />
          </span>

          <span className="brand-text">
            <strong>Kiangini</strong>
            <small>ICT Centre</small>
          </span>
        </Link>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setMenuOpen((open) => !open)
          }
          aria-label={
            menuOpen
              ? 'Close navigation'
              : 'Open navigation'
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

        <nav
          className={`navbar-nav ${
            menuOpen ? 'is-open' : ''
          }`}
        >
          <NavLink
            to="/"
            end
            onClick={closeMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/about"
            onClick={closeMenu}
          >
            About
          </NavLink>

          <NavLink
            to="/services"
            onClick={closeMenu}
          >
            Services
          </NavLink>

          <NavLink
            to="/announcements"
            onClick={closeMenu}
          >
            Announcements
          </NavLink>

          <div className="navbar-actions">

            {isAuthenticated ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDashboard}
              >
                Open Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="btn btn-primary"
                  onClick={closeMenu}
                >
                  Get Started
                </Link>
              </>
            )}

          </div>
        </nav>

      </div>
    </header>
  );
}

export default Navbar;