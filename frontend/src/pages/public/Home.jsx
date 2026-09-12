import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Computer,
  FileText,
  Globe2,
  Headphones,
  Laptop,
  LockKeyhole,
  Network,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import announcementService from '../../services/announcementService';

import './Home.css';

/* =========================================================
   TEMPORARY IMAGE ASSETS
   Replace these files later with real Kiangini photos.
========================================================= */

const IMAGES = {
  hero: '/images/hero-ict.jpg',
  laboratory: '/images/computer-lab.jpg',
  networking: '/images/networking.jpg',
  training: '/images/training.jpg',
  support: '/images/support.jpg',
};

/* =========================================================
   DATA
========================================================= */

const services = [
  {
    icon: Computer,
    title: 'Computer Laboratory',
    description:
      'Access modern computing facilities for learning, assignments, research and practical work.',
    color: 'blue',
    tag: 'Facilities',
  },
  {
    icon: Wifi,
    title: 'Internet Services',
    description:
      'Reliable internet access supporting research, digital learning and online academic activities.',
    color: 'cyan',
    tag: 'Connectivity',
  },
  {
    icon: Network,
    title: 'Networking',
    description:
      'Professional networking infrastructure and support for connected learning environments.',
    color: 'indigo',
    tag: 'Technology',
  },
  {
    icon: Laptop,
    title: 'ICT Training',
    description:
      'Digital skills development through practical technology training and guided learning.',
    color: 'emerald',
    tag: 'Learning',
  },
  {
    icon: Wrench,
    title: 'Technical Support',
    description:
      'Get assistance with ICT equipment, systems, connectivity and common technical challenges.',
    color: 'amber',
    tag: 'Support',
  },
  {
    icon: CalendarCheck,
    title: 'Facility Booking',
    description:
      'Request ICT facilities online and track your booking from submission to approval.',
    color: 'purple',
    tag: 'Online',
  },
];

const facilities = [
  {
    title: 'Computer Laboratory',
    description:
      'Modern computing environment for students and digital learning.',
    image: IMAGES.laboratory,
    icon: Computer,
    status: 'Available',
    color: 'blue',
  },
  {
    title: 'Network Infrastructure',
    description:
      'Connected infrastructure supporting reliable digital services.',
    image: IMAGES.networking,
    icon: Network,
    status: 'Connected',
    color: 'cyan',
  },
  {
    title: 'Training Environment',
    description:
      'Practical space designed for ICT training and collaboration.',
    image: IMAGES.training,
    icon: Users,
    status: 'Active',
    color: 'indigo',
  },
];

const processSteps = [
  {
    number: '01',
    icon: Search,
    title: 'Explore',
    description:
      'Browse available facilities and ICT services.',
  },
  {
    number: '02',
    icon: CalendarCheck,
    title: 'Request',
    description:
      'Submit your facility booking request online.',
  },
  {
    number: '03',
    icon: CheckCircle2,
    title: 'Get Approved',
    description:
      'An ICT officer reviews and processes your request.',
  },
  {
    number: '04',
    icon: Zap,
    title: 'Access',
    description:
      'Use the approved facility at your scheduled time.',
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Secure Platform',
    description:
      'Authentication and protected access keep your account and booking activity secure.',
    color: 'blue',
  },
  {
    icon: Clock3,
    title: 'Convenient Access',
    description:
      'Submit and track requests online without unnecessary paperwork.',
    color: 'cyan',
  },
  {
    icon: Headphones,
    title: 'ICT Support',
    description:
      'Get assistance when you need help with technology or ICT facilities.',
    color: 'indigo',
  },
  {
    icon: Globe2,
    title: 'Digital First',
    description:
      'A modern platform designed around accessible digital services.',
    color: 'emerald',
  },
];

/* =========================================================
   PLATFORM PREVIEW
========================================================= */

function PlatformPreview() {
  return (
    <div className="home-platform-preview">
      <div className="platform-window">
        <div className="platform-window-top">
          <div className="platform-window-dots">
            <span />
            <span />
            <span />
          </div>

          <div className="platform-window-address">
            <LockKeyhole size={11} />
            kiangini-ict-centre
          </div>

          <div className="platform-window-status">
            <span />
            Live
          </div>
        </div>

        <div className="platform-dashboard">
          <aside className="platform-sidebar">
            <div className="platform-logo">
              K<span>.</span>
            </div>

            <div className="platform-sidebar-items">
              <div className="platform-sidebar-item active">
                <span />
                Dashboard
              </div>

              <div className="platform-sidebar-item">
                <span />
                Bookings
              </div>

              <div className="platform-sidebar-item">
                <span />
                Facilities
              </div>

              <div className="platform-sidebar-item">
                <span />
                Announcements
              </div>
            </div>
          </aside>

          <div className="platform-main">
            <div className="platform-main-header">
              <div>
                <small>STUDENT PORTAL</small>
                <h4>Welcome back</h4>
              </div>

              <div className="platform-avatar">
                SM
              </div>
            </div>

            <div className="platform-mini-stats">
              <div className="platform-mini-stat">
                <span>Bookings</span>
                <strong>04</strong>
                <em>+2 this month</em>
              </div>

              <div className="platform-mini-stat">
                <span>Approved</span>
                <strong>03</strong>
                <em>Ready to access</em>
              </div>

              <div className="platform-mini-stat">
                <span>Facilities</span>
                <strong>12</strong>
                <em>Available online</em>
              </div>
            </div>

            <div className="platform-content-grid">
              <div className="platform-panel">
                <div className="platform-panel-heading">
                  <span>Recent bookings</span>
                  <ArrowUpRight size={13} />
                </div>

                <div className="platform-booking">
                  <div className="platform-booking-icon blue">
                    <Computer size={14} />
                  </div>

                  <div>
                    <strong>
                      Computer Laboratory
                    </strong>
                    <span>
                      Today · 10:00 AM
                    </span>
                  </div>

                  <small className="approved">
                    Approved
                  </small>
                </div>

                <div className="platform-booking">
                  <div className="platform-booking-icon cyan">
                    <Network size={14} />
                  </div>

                  <div>
                    <strong>
                      Networking Lab
                    </strong>
                    <span>
                      Tomorrow · 2:00 PM
                    </span>
                  </div>

                  <small className="pending">
                    Pending
                  </small>
                </div>
              </div>

              <div className="platform-panel platform-announcement-preview">
                <div className="platform-panel-heading">
                  <span>Latest update</span>
                  <Bell size={13} />
                </div>

                <div className="platform-announcement-icon">
                  <Sparkles size={15} />
                </div>

                <strong>
                  ICT Centre services are now available online.
                </strong>

                <span>
                  View announcements and stay updated.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="platform-floating-card platform-floating-card-one">
        <div className="floating-card-icon success">
          <CheckCircle2 size={16} />
        </div>

        <div>
          <strong>Booking approved</strong>
          <span>Computer Laboratory</span>
        </div>
      </div>

      <div className="platform-floating-card platform-floating-card-two">
        <div className="floating-card-icon accent">
          <Wifi size={16} />
        </div>

        <div>
          <strong>12 facilities</strong>
          <span>Available on platform</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HOME PAGE
========================================================= */

export default function Home() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
  } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [announcementLoading, setAnnouncementLoading] =
    useState(true);
  const [announcementError, setAnnouncementError] =
    useState('');

  /* =======================================================
     OPEN DASHBOARD
  ======================================================= */

  const handleOpenDashboard = () => {
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

  /* =======================================================
     LOAD ANNOUNCEMENTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadAnnouncements = async () => {
      try {
        setAnnouncementLoading(true);
        setAnnouncementError('');

        const response =
          await announcementService.getAnnouncements();

        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.results)
            ? response.results
            : [];

        const latest = data
          .filter(
            (item) =>
              item?.is_published !== false,
          )
          .sort((a, b) => {
            const dateA = new Date(
              a?.published_at ||
                a?.created_at ||
                0,
            ).getTime();

            const dateB = new Date(
              b?.published_at ||
                b?.created_at ||
                0,
            ).getTime();

            return dateB - dateA;
          })
          .slice(0, 3);

        if (mounted) {
          setAnnouncements(latest);
        }
      } catch (error) {
        console.error(
          'Failed to load announcements:',
          error,
        );

        if (mounted) {
          setAnnouncementError(
            'Announcements are temporarily unavailable.',
          );
        }
      } finally {
        if (mounted) {
          setAnnouncementLoading(false);
        }
      }
    };

    loadAnnouncements();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     FORMAT ANNOUNCEMENT DATE
  ======================================================= */

  const formatDate = (date) => {
    if (!date) {
      return 'Recent update';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return 'Recent update';
    }

    return parsed.toLocaleDateString(
      'en-KE',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      },
    );
  };

  return (
    <main className="home-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="home-hero">
        <div
          className="home-hero-image"
          style={{
            backgroundImage: `url(${IMAGES.hero})`,
          }}
          aria-hidden="true"
        />

        <div className="home-hero-overlay" />

        <div
          className="home-hero-grid"
          aria-hidden="true"
        />

        <div className="container home-hero-container">
          <div className="home-hero-content">
            

            <h1>
              Empowering digital skills.
              <span>
                Building the future.
              </span>
            </h1>

            <p>
              A modern digital platform connecting
              students with ICT facilities, services,
              announcements and support at Kiangini
              ICT Centre.
            </p>

            <div className="home-hero-actions">

              {/* BOOK A FACILITY */}
              <button
                type="button"
                className="btn btn-primary home-hero-primary"
                onClick={handleOpenDashboard}
              >
                {isAuthenticated
                  ? 'Open Dashboard'
                  : 'Book a Facility'}

                <ArrowRight size={17} />
              </button>

              <Link
                to="/services"
                className="btn home-hero-secondary"
              >
                Explore Services
                <ArrowUpRight size={16} />
              </Link>

            </div>

            <div className="home-hero-trust">
              <div className="hero-trust-item">
                <CheckCircle2 size={15} />
                <span>
                  Student-focused
                </span>
              </div>

              <div className="hero-trust-item">
                <ShieldCheck size={15} />
                <span>
                  Secure access
                </span>
              </div>

              <div className="hero-trust-item">
                <Zap size={15} />
                <span>
                  Digital first
                </span>
              </div>
            </div>
          </div>

          <div className="home-hero-visual">
            <PlatformPreview />
          </div>
        </div>

        <div className="home-hero-bottom">
          <div className="container home-hero-bottom-inner">
            <span>
              POWERING DIGITAL LEARNING
            </span>

            <div className="home-hero-bottom-items">
              <span>
                <Computer size={14} />
                Computer Labs
              </span>

              <span>
                <Wifi size={14} />
                Connectivity
              </span>

              <span>
                <Users size={14} />
                Student Services
              </span>

              <span>
                <Headphones size={14} />
                ICT Support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PLATFORM STATS
      ===================================================== */}

      <section className="home-stats-section">
        <div className="container">
          <div className="home-stats-grid">

            <div className="home-stat-card">
              <div className="home-stat-icon blue">
                <Computer size={20} />
              </div>

              <div>
                <strong>ICT</strong>
                <span>
                  Learning facilities
                </span>
              </div>
            </div>

            <div className="home-stat-card">
              <div className="home-stat-icon cyan">
                <Wifi size={20} />
              </div>

              <div>
                <strong>Connected</strong>
                <span>
                  Digital environment
                </span>
              </div>
            </div>

            <div className="home-stat-card">
              <div className="home-stat-icon indigo">
                <CalendarCheck size={20} />
              </div>

              <div>
                <strong>Online</strong>
                <span>
                  Facility booking
                </span>
              </div>
            </div>

            <div className="home-stat-card">
              <div className="home-stat-icon emerald">
                <ShieldCheck size={20} />
              </div>

              <div>
                <strong>Secure</strong>
                <span>
                  Student platform
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="section home-intro-section">
        <div className="container">
          <div className="home-intro-grid">

            <div className="home-intro-heading">
              <span className="section-label">
                <Sparkles size={14} />
                DIGITAL PLATFORM
              </span>

              <h2 className="section-title">
                One platform for your ICT needs.
              </h2>
            </div>

            <div className="home-intro-copy">
              <p className="section-description">
                Kiangini ICT Centre provides a
                modern environment where students
                can discover services, access
                facilities, submit booking requests
                and stay informed through one
                connected platform.
              </p>

              <Link
                to="/about"
                className="home-text-link"
              >
                Learn more about Kiangini
                <ChevronRight size={16} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICES
      ===================================================== */}

      <section className="section home-services-section">
        <div className="container">

          <div className="section-header home-section-header-row">
            <div>
              <span className="section-label">
                <Zap size={14} />
                WHAT WE PROVIDE
              </span>

              <h2 className="section-title">
                Technology that supports
                <span>
                  better learning.
                </span>
              </h2>
            </div>

            <Link
              to="/services"
              className="home-outline-link"
            >
              View all services
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="home-services-grid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  to="/services"
                  className={`home-service-card ${service.color}`}
                  key={service.title}
                >
                  <div className="home-service-top">
                    <div
                      className={`home-service-icon ${service.color}`}
                    >
                      <Icon size={21} />
                    </div>

                    <span className="home-service-arrow">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>

                  <span className="home-service-tag">
                    {service.tag}
                  </span>

                  <h3>
                    {service.title}
                  </h3>

                  <p>
                    {service.description}
                  </p>

                  <div className="home-service-bottom">
                    <span>
                      Learn more
                    </span>

                    <ChevronRight size={15} />
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* =====================================================
          FACILITIES
      ===================================================== */}

      <section className="section home-facilities-section">
        <div className="container">

          <div className="section-header">
            <span className="section-label">
              <Computer size={14} />
              OUR ENVIRONMENT
            </span>

            <h2 className="section-title">
              Spaces designed for
              <span>
                digital learning.
              </span>
            </h2>

            <p className="section-description">
              Explore the technology environments
              supporting learning, collaboration
              and practical ICT experiences.
            </p>
          </div>

          <div className="home-facilities-grid">
            {facilities.map(
              (facility, index) => {
                const Icon = facility.icon;

                return (
                  <article
                    className={`home-facility-card ${
                      index === 0
                        ? 'featured'
                        : ''
                    }`}
                    key={facility.title}
                  >
                    <div
                      className="home-facility-image"
                      style={{
                        backgroundImage:
                          `url(${facility.image})`,
                      }}
                    />

                    <div className="home-facility-overlay" />

                    <div className="home-facility-content">

                      <div className="home-facility-top">
                        <span
                          className={`home-status ${facility.color}`}
                        >
                          <span />
                          {facility.status}
                        </span>

                        <div
                          className={`home-facility-icon ${facility.color}`}
                        >
                          <Icon size={17} />
                        </div>
                      </div>

                      <div>
                        <h3>
                          {facility.title}
                        </h3>

                        <p>
                          {facility.description}
                        </p>

                        <Link
                          to="/services"
                          className="home-facility-link"
                        >
                          Explore facility
                          <ArrowRight size={15} />
                        </Link>
                      </div>

                    </div>
                  </article>
                );
              },
            )}
          </div>

        </div>
      </section>

      {/* =====================================================
          WHY KIANGINI
      ===================================================== */}

      <section className="section home-why-section">
        <div className="container">

          <div className="home-why-grid">

            <div className="home-why-image">
              <div
                className="home-why-image-bg"
                style={{
                  backgroundImage:
                    `url(${IMAGES.support})`,
                }}
              />

              <div className="home-why-image-overlay" />

              <div className="home-why-image-card">
                <div className="home-why-image-card-icon">
                  <Headphones size={19} />
                </div>

                <div>
                  <strong>
                    ICT Support
                  </strong>

                  <span>
                    Here when you need it
                  </span>
                </div>
              </div>

              <div className="home-why-image-badge">
                <ShieldCheck size={15} />
                <span>
                  Trusted environment
                </span>
              </div>
            </div>

            <div className="home-why-content">
              <span className="section-label">
                <ShieldCheck size={14} />
                WHY KIANGINI
              </span>

              <h2 className="section-title">
                More than facilities.
                <span>
                  A complete digital experience.
                </span>
              </h2>

              <p className="section-description">
                We combine physical ICT resources
                with digital services to make access
                simpler, faster and more convenient
                for students.
              </p>

              <div className="home-benefits">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;

                  return (
                    <div
                      className="home-benefit"
                      key={benefit.title}
                    >
                      <div
                        className={`home-benefit-icon ${benefit.color}`}
                      >
                        <Icon size={18} />
                      </div>

                      <div>
                        <h3>
                          {benefit.title}
                        </h3>

                        <p>
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                to="/about"
                className="btn btn-primary home-why-button"
              >
                Discover Kiangini
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          PLATFORM PREVIEW
      ===================================================== */}

      <section className="section home-platform-section">
        <div className="container">

          <div className="home-platform-heading">
            <div>
              <span className="section-label">
                <Globe2 size={14} />
                DIGITAL EXPERIENCE
              </span>

              <h2 className="section-title">
                Everything connected
                <span>
                  in one platform.
                </span>
              </h2>
            </div>

            <p>
              Manage your ICT centre experience
              from a secure, easy-to-use student
              portal.
            </p>
          </div>

          <div className="home-platform-large-preview">
            <PlatformPreview />
          </div>

        </div>
      </section>

      {/* =====================================================
          ANNOUNCEMENTS
      ===================================================== */}

      <section className="section home-announcements-section">
        <div className="container">

          <div className="section-header home-section-header-row">
            <div>
              <span className="section-label">
                <Bell size={14} />
                CENTRE UPDATES
              </span>

              <h2 className="section-title">
                Latest announcements.
              </h2>
            </div>

            <Link
              to="/announcements"
              className="home-outline-link"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {announcementLoading && (
            <div className="home-announcement-state">
              <RefreshCw
                size={20}
                className="home-spin"
              />

              <span>
                Loading latest announcements...
              </span>
            </div>
          )}

          {!announcementLoading &&
            announcementError && (
              <div className="home-announcement-state error">
                <Bell size={20} />

                <span>
                  {announcementError}
                </span>
              </div>
            )}

          {!announcementLoading &&
            !announcementError &&
            announcements.length === 0 && (
              <div className="home-announcement-state">
                <FileText size={22} />

                <div>
                  <strong>
                    No announcements yet
                  </strong>

                  <span>
                    New centre updates will
                    appear here.
                  </span>
                </div>
              </div>
            )}

          {!announcementLoading &&
            !announcementError &&
            announcements.length > 0 && (
              <div className="home-announcements-grid">
                {announcements.map(
                  (announcement, index) => (
                    <Link
                      to={`/announcements/${announcement.id}`}
                      className={`home-announcement-card ${
                        index === 0
                          ? 'featured'
                          : ''
                      }`}
                      key={announcement.id}
                    >
                      <div className="home-announcement-top">
                        <div className="home-announcement-icon">
                          <Bell size={17} />
                        </div>

                        <span>
                          {formatDate(
                            announcement.published_at ||
                              announcement.created_at,
                          )}
                        </span>

                        <ArrowUpRight size={16} />
                      </div>

                      <div className="home-announcement-body">
                        <span className="home-announcement-type">
                          {announcement.type_display ||
                            announcement.announcement_type ||
                            'Centre update'}
                        </span>

                        <h3>
                          {announcement.title}
                        </h3>

                        <p>
                          {announcement.message
                            ? announcement.message.length > 145
                              ? `${announcement.message.slice(
                                  0,
                                  145,
                                )}...`
                              : announcement.message
                            : 'Read the latest update from Kiangini ICT Centre.'}
                        </p>
                      </div>

                      <div className="home-announcement-read">
                        Read announcement
                        <ChevronRight size={15} />
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}

        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="section home-process-section">
        <div className="container">

          <div className="section-header">
            <span className="section-label">
              <CalendarCheck size={14} />
              SIMPLE PROCESS
            </span>

            <h2 className="section-title">
              Book facilities without
              <span>
                the paperwork.
              </span>
            </h2>

            <p className="section-description">
              Our digital booking process makes
              requesting ICT facilities
              straightforward from start to finish.
            </p>
          </div>

          <div className="home-process-grid">
            {processSteps.map(
              (step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    className="home-process-step"
                    key={step.number}
                  >
                    <div className="home-process-number">
                      {step.number}
                    </div>

                    <div className="home-process-icon">
                      <Icon size={20} />
                    </div>

                    <h3>
                      {step.title}
                    </h3>

                    <p>
                      {step.description}
                    </p>

                    {index <
                      processSteps.length - 1 && (
                      <div className="home-process-connector">
                        <ArrowRight size={15} />
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>

        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="home-cta-section">
        <div
          className="home-cta-image"
          style={{
            backgroundImage:
              `url(${IMAGES.laboratory})`,
          }}
          aria-hidden="true"
        />

        <div className="home-cta-overlay" />

        <div className="container home-cta-container">

          <div className="home-cta-content">
            <span className="home-cta-label">
              <Sparkles size={14} />
              START USING THE PLATFORM
            </span>

            <h2>
              Ready to make better use
              <span>
                of ICT facilities?
              </span>
            </h2>

            <p>
              Sign in to your student account
              and start exploring available
              facilities, services and digital
              resources.
            </p>

            <div className="home-cta-actions">

              {/* =================================================
                  DYNAMIC DASHBOARD BUTTON
              ================================================= */}

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenDashboard}
              >
                {isAuthenticated
                  ? 'Open Dashboard'
                  : 'Get Started'}

                <ArrowRight size={17} />
              </button>

              <Link
                to="/contact"
                className="btn home-cta-outline"
              >
                Contact the centre
                <ArrowUpRight size={16} />
              </Link>

            </div>
          </div>

          <div className="home-cta-card">
            <div className="home-cta-card-icon">
              <ShieldCheck size={22} />
            </div>

            <div>
              <strong>
                Secure student access
              </strong>

              <span>
                Your account keeps your activity
                protected.
              </span>
            </div>

            <CheckCircle2
              size={19}
              className="home-cta-check"
            />
          </div>

        </div>
      </section>

    </main>
  );
}