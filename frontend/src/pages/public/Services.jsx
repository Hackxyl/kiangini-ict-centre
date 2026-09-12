import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Computer,
  Headphones,
  Laptop,
  Monitor,
  Network,
  ShieldCheck,
  Users,
  Wifi,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

import './Services.css';

function Services() {
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

  const services = [
    {
      icon: Computer,
      title: 'Computer Access',
      description:
        'Access modern computers for assignments, research, practical sessions, online learning and everyday digital work.',
      features: [
        'Modern computer workstations',
        'Academic and research access',
        'Productivity software',
      ],
    },
    {
      icon: Wifi,
      title: 'Internet Services',
      description:
        'Stay connected with reliable internet access for research, communication, online learning and digital services.',
      features: [
        'Internet connectivity',
        'Online research access',
        'Digital communication',
      ],
    },
    {
      icon: CalendarCheck,
      title: 'Facility Booking',
      description:
        'Reserve available ICT facilities through a simple digital booking process and manage your reservations with ease.',
      features: [
        'Online facility reservations',
        'Booking status tracking',
        'Convenient scheduling',
      ],
    },
    {
      icon: Headphones,
      title: 'ICT Support',
      description:
        'Get practical assistance with ICT facilities, digital services, software and common technology challenges.',
      features: [
        'Technical assistance',
        'User support',
        'ICT guidance',
      ],
    },
    {
      icon: Network,
      title: 'Network Services',
      description:
        'Access technology-enabled environments supported by dependable network infrastructure for learning and collaboration.',
      features: [
        'Network connectivity',
        'Connected learning spaces',
        'Digital collaboration',
      ],
    },
    {
      icon: Cloud,
      title: 'Digital Services',
      description:
        'Use technology and digital resources that support academic activities, productivity and access to online resources.',
      features: [
        'Digital resources',
        'Online platforms',
        'Technology-enabled services',
      ],
    },
  ];

  const facilityFeatures = [
    {
      icon: Monitor,
      title: 'Computer Laboratories',
      description:
        'Technology-enabled spaces suitable for practical classes, assignments and independent learning.',
    },
    {
      icon: Laptop,
      title: 'Learning Equipment',
      description:
        'Computing equipment that supports academic work, digital productivity and technology-based activities.',
    },
    {
      icon: Network,
      title: 'Connected Environment',
      description:
        'Network-enabled spaces designed to keep users connected to the digital resources they need.',
    },
    {
      icon: ShieldCheck,
      title: 'Reliable Support',
      description:
        'User-focused ICT assistance to help make technology easier and more effective to use.',
    },
  ];

  return (
    <div className="services-page">

      {/* Hero */}
      <section className="services-hero">
        <div className="container">
          <div className="services-hero-content">

            <span className="section-label">
              Our Services
            </span>

            <h1>
              Technology and services
              <span> built around your needs.</span>
            </h1>

            <p>
              Explore the ICT facilities, connectivity and digital
              services available to support learning, research,
              productivity and community development.
            </p>

            <div className="services-hero-actions">

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDashboard}
              >
                {isAuthenticated
                  ? 'Open Dashboard'
                  : 'Book a Facility'}

                <ArrowRight size={18} />
              </button>

              <Link
                to="/contact"
                className="btn btn-outline"
              >
                Need Help?
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section services-list-section">
        <div className="container">

          <div className="section-header services-section-header">

            <span className="section-label">
              What we provide
            </span>

            <h2 className="section-title">
              ICT services for learning, work and connection.
            </h2>

            <p className="section-description">
              Our services are designed to give students and community
              members convenient access to the technology and support
              they need.
            </p>

          </div>

          <div className="services-grid">

            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  className="service-card"
                  key={service.title}
                >

                  <div className="service-card-top">

                    <div className="service-icon">
                      <Icon size={23} />
                    </div>

                    <ChevronRight size={18} />

                  </div>

                  <h3>
                    {service.title}
                  </h3>

                  <p>
                    {service.description}
                  </p>

                  <div className="service-features">

                    {service.features.map((feature) => (
                      <div
                        className="service-feature"
                        key={feature}
                      >
                        <CheckCircle2 size={16} />

                        <span>
                          {feature}
                        </span>
                      </div>
                    ))}

                  </div>

                </article>
              );
            })}

          </div>

        </div>
      </section>

      {/* Facilities */}
      <section className="section facilities-section">
        <div className="container">

          <div className="facilities-grid">

            <div className="facilities-content">

              <span className="section-label">
                Our facilities
              </span>

              <h2 className="section-title">
                Spaces designed to help you get things done.
              </h2>

              <p className="section-description">
                From practical computing sessions to individual
                research and digital work, our facilities provide
                a technology-enabled environment for different
                user needs.
              </p>

              <button
                type="button"
                className="btn btn-primary facilities-button"
                onClick={handleDashboard}
              >
                {isAuthenticated
                  ? 'Open Dashboard'
                  : 'Reserve a Facility'}

                <ArrowRight size={18} />
              </button>

            </div>

            <div className="facility-features">

              {facilityFeatures.map((facility) => {
                const Icon = facility.icon;

                return (
                  <article
                    className="facility-feature-card"
                    key={facility.title}
                  >

                    <div className="facility-feature-icon">
                      <Icon size={21} />
                    </div>

                    <div>

                      <h3>
                        {facility.title}
                      </h3>

                      <p>
                        {facility.description}
                      </p>

                    </div>

                  </article>
                );
              })}

            </div>

          </div>

        </div>
      </section>

      {/* Support */}
      <section className="support-section">
        <div className="container">

          <div className="support-card">

            <div className="support-icon">
              <Users size={25} />
            </div>

            <div className="support-content">

              <span>
                ICT SUPPORT
              </span>

              <h2>
                Not sure which service you need?
              </h2>

              <p>
                Our support team can help you identify the right
                facility or ICT service for your academic, digital
                or technology needs.
              </p>

            </div>

            <Link
              to="/contact"
              className="btn btn-white"
            >
              Contact Support
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>
      </section>

    </div>
  );
}

export default Services;