import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  Monitor,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import './About.css';

function About() {
  const values = [
    {
      icon: Users,
      title: 'Accessibility',
      description:
        'We strive to make ICT facilities and digital services accessible to students, staff and the wider community.',
    },
    {
      icon: ShieldCheck,
      title: 'Reliability',
      description:
        'We focus on dependable infrastructure and services that users can confidently rely on.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description:
        'We embrace technology and continuously look for better ways to support digital learning and productivity.',
    },
    {
      icon: HeartHandshake,
      title: 'Service',
      description:
        'We put users first by providing helpful, responsive and respectful ICT support.',
    },
  ];

  const objectives = [
    'Support digital learning and academic activities',
    'Provide accessible and reliable ICT infrastructure',
    'Promote effective use of technology',
    'Improve access to digital resources and services',
    'Support students and the community with ICT solutions',
  ];

  const highlights = [
    {
      icon: Monitor,
      value: 'ICT',
      label: 'Technology Infrastructure',
    },
    {
      icon: GraduationCap,
      value: 'Learn',
      label: 'Student Focused',
    },
    {
      icon: Users,
      value: 'Community',
      label: 'Inclusive Services',
    },
  ];

  return (
    <div className="about-page">

      {/* =========================================
          PAGE HERO
      ========================================== */}
      <section className="about-hero">
        <div className="container">

          <div className="about-hero-content">

            <span className="section-label">
              About Kiangini ICT Centre
            </span>

            <h1>
              Creating opportunities
              <span> through technology.</span>
            </h1>

            <p>
              Kiangini ICT Centre provides technology, facilities and
              digital services that help students and the community
              learn, connect, collaborate and work more effectively.
            </p>

            <div className="about-hero-actions">

              <Link to="/services" className="btn btn-primary">
                Explore Our Services
                <ArrowRight size={18} />
              </Link>

              <Link to="/contact" className="btn btn-outline">
                Get in Touch
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================
          INTRODUCTION
      ========================================== */}
      <section className="section about-intro">

        <div className="container about-intro-grid">

          <div className="about-intro-content">

            <span className="section-label">
              Who we are
            </span>

            <h2 className="section-title">
              Technology that supports learning, productivity and
              connection.
            </h2>

            <p className="section-description">
              Kiangini ICT Centre is a technology-focused environment
              designed to provide convenient access to ICT facilities,
              internet connectivity and digital support.
            </p>

            <p className="about-text">
              Our goal is to create an environment where technology is
              accessible and useful to everyone who needs it. Whether
              someone needs a computer for academic work, internet
              connectivity for research, a facility for a practical
              session or assistance with an ICT challenge, the centre
              provides a convenient place to get started.
            </p>

            <p className="about-text">
              Through reliable infrastructure and user-focused digital
              services, Kiangini ICT Centre supports learning,
              innovation and digital productivity.
            </p>

          </div>

          <div className="about-intro-visual">

            <div className="about-visual-card">

              <div className="about-visual-top">
                <span>KIANGINI</span>
                <span>ICT CENTRE</span>
              </div>

              <div className="about-visual-center">
                <div className="about-visual-icon">
                  <Monitor size={42} />
                </div>

                <strong>
                  Technology for
                  <br />
                  everyone.
                </strong>
              </div>

              <div className="about-visual-bottom">
                <span>LEARN</span>
                <span>CONNECT</span>
                <span>CREATE</span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          HIGHLIGHTS
      ========================================== */}
      <section className="about-highlights">

        <div className="container about-highlights-grid">

          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <div className="about-highlight" key={item.label}>

                <div className="about-highlight-icon">
                  <Icon size={22} />
                </div>

                <div>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>

              </div>
            );
          })}

        </div>

      </section>

      {/* =========================================
          MISSION & VISION
      ========================================== */}
      <section className="section mission-section">

        <div className="container">

          <div className="section-header centered-header">

            <span className="section-label">
              Our direction
            </span>

            <h2 className="section-title">
              Guided by purpose and focused on impact.
            </h2>

            <p className="section-description">
              Everything we do is centered around making technology
              useful, accessible and valuable to the people we serve.
            </p>

          </div>

          <div className="mission-grid">

            <article className="mission-card">

              <div className="mission-icon">
                <Target size={25} />
              </div>

              <span className="mission-number">
                01
              </span>

              <h3>Our Mission</h3>

              <p>
                To provide accessible, reliable and innovative ICT
                facilities and digital services that support learning,
                research, productivity and community development.
              </p>

            </article>

            <article className="mission-card">

              <div className="mission-icon">
                <Eye size={25} />
              </div>

              <span className="mission-number">
                02
              </span>

              <h3>Our Vision</h3>

              <p>
                To create an inclusive and technology-enabled
                environment where people can confidently use digital
                tools to learn, innovate, connect and achieve their
                goals.
              </p>

            </article>

          </div>

        </div>

      </section>

      {/* =========================================
          VALUES
      ========================================== */}
      <section className="section values-section">

        <div className="container">

          <div className="values-header">

            <div>
              <span className="section-label">
                What guides us
              </span>

              <h2 className="section-title">
                Our core values.
              </h2>
            </div>

            <p className="section-description">
              Our values shape how we deliver services and how we
              interact with everyone who uses Kiangini ICT Centre.
            </p>

          </div>

          <div className="values-grid">

            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <article className="value-card" key={value.title}>

                  <div className="value-top">

                    <div className="value-icon">
                      <Icon size={22} />
                    </div>

                    <span>
                      0{index + 1}
                    </span>

                  </div>

                  <h3>{value.title}</h3>

                  <p>
                    {value.description}
                  </p>

                </article>
              );
            })}

          </div>

        </div>

      </section>

      {/* =========================================
          OBJECTIVES
      ========================================== */}
      <section className="section objectives-section">

        <div className="container objectives-grid">

          <div className="objectives-content">

            <span className="section-label">
              What we aim to achieve
            </span>

            <h2 className="section-title">
              Making digital access easier and more meaningful.
            </h2>

            <p className="section-description">
              We focus on practical outcomes that improve the way
              students and community members interact with technology.
            </p>

            <div className="objectives-list">

              {objectives.map((objective) => (
                <div className="objective-item" key={objective}>

                  <CheckCircle2 size={19} />

                  <span>
                    {objective}
                  </span>

                </div>
              ))}

            </div>

          </div>

          <div className="objectives-card">

            <div className="objectives-card-header">
              <span>OUR APPROACH</span>

              <div>
                <Lightbulb size={20} />
              </div>
            </div>

            <h3>
              People first.
              <br />
              Technology enabled.
            </h3>

            <p>
              We believe technology has the greatest impact when it is
              simple to access, easy to understand and designed around
              real user needs.
            </p>

            <div className="approach-line">
              <span />
              <span />
              <span />
            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          CTA
      ========================================== */}
      <section className="about-cta">

        <div className="container">

          <div className="about-cta-card">

            <div className="about-cta-content">

              <span>
                GET STARTED
              </span>

              <h2>
                Experience the Kiangini ICT Centre.
              </h2>

              <p>
                Explore our facilities and services or contact us to
                learn how we can support your digital needs.
              </p>

            </div>

            <div className="about-cta-actions">

              <Link to="/services" className="btn btn-white">
                Explore Services
                <ArrowRight size={18} />
              </Link>

              <Link to="/contact" className="btn btn-cta-outline">
                Contact Us
              </Link>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default About;