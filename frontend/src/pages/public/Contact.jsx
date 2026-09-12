import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from 'lucide-react';
import './Contact.css';

function Contact() {
  const contactDetails = [
    {
      icon: MapPin,
      title: 'Visit Us',
      value: 'Kiangini ICT Centre',
      description: 'Visit the centre for ICT services and support.',
      color: 'blue',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      value: 'ICT Support Desk',
      description: 'Get assistance with ICT facilities and services.',
      color: 'cyan',
    },
    {
      icon: Mail,
      title: 'Email Support',
      value: 'Email Support',
      description: 'Send us your questions, requests or feedback.',
      color: 'indigo',
    },
    {
      icon: Clock3,
      title: 'Support Hours',
      value: 'Centre Working Hours',
      description: 'Support is available from Monday to Friday. 8:00 AM to 5:00 PM.',
      color: 'emerald',
    },
  ];

  const supportPoints = [
    'Facility and computer access support',
    'Internet and network assistance',
    'Facility booking assistance',
    'General ICT enquiries',
  ];

  const handleSubmit = (event) => {
    event.preventDefault();

    alert(
      'Thank you for contacting Kiangini ICT Centre. Your message form is ready for backend integration.',
    );
  };

  return (
    <div className="contact-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="contact-hero">

        <div className="container">

          <div className="contact-hero-content">

            <span className="section-label">
              Contact us
            </span>

            <h1>
              We are here to
              <span> help you.</span>
            </h1>

            <p>
              Have a question, need ICT support or want to know more
              about our services? Get in touch with the Kiangini ICT
              Centre team.
            </p>

          </div>

        </div>

      </section>

      {/* =================================================
          CONTACT DETAILS
      ================================================= */}

      <section className="section contact-details-section">

        <div className="container">

          <div className="contact-details-grid">

            {contactDetails.map((detail) => {
              const Icon = detail.icon;

              return (
                <article
                  className={`contact-detail-card contact-${detail.color}`}
                  key={detail.title}
                >

                  <div className="contact-detail-icon">
                    <Icon size={22} />
                  </div>

                  <div className="contact-detail-content">

                    <span>
                      {detail.title}
                    </span>

                    <h3>
                      {detail.value}
                    </h3>

                    <p>
                      {detail.description}
                    </p>

                  </div>

                </article>
              );
            })}

          </div>

        </div>

      </section>

      {/* =================================================
          CONTACT FORM + SUPPORT
      ================================================= */}

      <section className="section contact-main-section">

        <div className="container">

          <div className="contact-main-grid">

            {/* Form */}

            <div className="contact-form-wrapper">

              <div className="contact-section-heading">

                <span className="section-label">
                  Send a message
                </span>

                <h2 className="section-title">
                  How can we help?
                </h2>

                <p className="section-description">
                  Send us a message and our team will be ready to
                  assist you with your enquiry.
                </p>

              </div>

              <form
                className="contact-form"
                onSubmit={handleSubmit}
              >

                <div className="form-row">

                  <div className="form-group">
                    <label htmlFor="name">
                      Full name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      Email address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                </div>

                <div className="form-group">

                  <label htmlFor="subject">
                    Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="What can we help you with?"
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="message">
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    placeholder="Write your message here..."
                    required
                  />

                </div>

                <button
                  type="submit"
                  className="btn btn-primary contact-submit"
                >
                  Send Message
                  <Send size={17} />
                </button>

              </form>

            </div>

            {/* Support */}

            <aside className="contact-support">

              <div className="support-card">

                <div className="support-icon">
                  <MessageSquare size={23} />
                </div>

                <span className="support-label">
                  ICT SUPPORT
                </span>

                <h3>
                  Need help with a service or facility?
                </h3>

                <p>
                  Our support team can assist you with facility access,
                  bookings, internet connectivity and general ICT
                  enquiries.
                </p>

                <div className="support-list">

                  {supportPoints.map((point) => (
                    <div
                      className="support-list-item"
                      key={point}
                    >
                      <CheckCircle2 size={17} />
                      <span>{point}</span>
                    </div>
                  ))}

                </div>

              </div>

             <div className="support-notice">

  <div className="support-notice-icon">
    <Phone size={18} />
  </div>

  <div className="support-notice-content">
    <strong>
      Need direct assistance?
    </strong>

    <p>
      Contact the ICT support desk during centre
      operating hours.
    </p>

    <a
      href="tel:+254114797246"
      className="support-phone"
    >
      <Phone size={15} />
      +254 114 797 246
    </a>
  </div>

</div>

            </aside>

          </div>

        </div>

      </section>

      {/* =================================================
          LOCATION
      ================================================= */}

      <section className="section contact-location-section">

        <div className="container">

          <div className="location-card">

            <div className="location-content">

              <span className="section-label">
                Find us
              </span>

              <h2 className="section-title">
                Visit Kiangini ICT Centre.
              </h2>

              <p className="section-description">
                Our centre provides an accessible environment where
                students and the community can access ICT facilities,
                digital services and technical support.
              </p>

              <div className="location-info">

                <MapPin size={19} />

                <div>
                  <strong>
                    Kiangini ICT Centre
                  </strong>

                  <span>
                    ICT services and support centre
                  </span>
                </div>

              </div>

              

            </div>

           <div className="location-map">

  <iframe
    title="Kiangini ICT Centre location"
    src="https://www.google.com/maps?q=Kiangini%20ICT%20Centre&output=embed"
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    allowFullScreen
  />

</div>

          </div>

        </div>

      </section>

      {/* =================================================
          FINAL CTA
      ================================================= */}

      <section className="contact-cta">

        <div className="container">

          <div className="contact-cta-card">

            <div>

              <span>
                KIANGINI ICT CENTRE
              </span>

              <h2>
                Looking for a facility or ICT service?
              </h2>

              <p>
                Explore everything available at the centre and find
                the service that fits your needs.
              </p>

            </div>

            <Link
              to="/services"
              className="btn btn-white"
            >
              Explore Services
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Contact;