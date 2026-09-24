import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Computer,
  Plus,
  RefreshCw,
  Users,
  Wifi,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";
import bookingService from "../../services/bookingService";

import "./StudentDashboard.css";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const value = String(date);

  const parsedDate = new Date(
    value.includes("T")
      ? value
      : `${value}T00:00:00`,
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) {
    return "—";
  }

  const [hours = "0", minutes = "00"] =
    String(time).split(":");

  const hour = Number(hours);

  if (Number.isNaN(hour)) {
    return String(time);
  }

  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;

  return `${String(formattedHour).padStart(
    2,
    "0",
  )}:${minutes} ${period}`;
}

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return (
    String(status).charAt(0).toUpperCase() +
    String(status).slice(1)
  );
}

function extractList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
  }

  return [];
}

function getDateValue(value) {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
}

/*
|--------------------------------------------------------------------------
| Student Dashboard
|--------------------------------------------------------------------------
*/

function StudentDashboard() {
  const { user } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | Dashboard data
  |--------------------------------------------------------------------------
  */

  const [bookings, setBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [facilities, setFacilities] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Live clock
  |--------------------------------------------------------------------------
  */

  const [currentTime, setCurrentTime] =
    useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Greeting
  |--------------------------------------------------------------------------
  */

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();

    if (hour < 5) {
      return "Good night";
    }

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 17) {
      return "Good afternoon";
    }

    return "Good evening";
  }, [currentTime]);

  /*
  |--------------------------------------------------------------------------
  | Date and time
  |--------------------------------------------------------------------------
  */

  const formattedDate = useMemo(
    () =>
      currentTime.toLocaleDateString("en-KE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [currentTime],
  );

  const formattedTime = useMemo(
    () =>
      currentTime.toLocaleTimeString("en-KE", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }),
    [currentTime],
  );

  /*
  |--------------------------------------------------------------------------
  | Load dashboard
  |--------------------------------------------------------------------------
  */

  const loadDashboard = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const [
          bookingsResponse,
          announcementsResponse,
          facilitiesResponse,
        ] = await Promise.allSettled([
          bookingService.getBookings(),
          api.get("/announcements/"),
          api.get("/facilities/"),
        ]);

        /*
        |--------------------------------------------------------------------------
        | Bookings
        |--------------------------------------------------------------------------
        */

        if (
          bookingsResponse.status ===
          "fulfilled"
        ) {
          setBookings(
            extractList(
              bookingsResponse.value,
            ),
          );
        } else {
          console.error(
            "Failed to load student bookings:",
            bookingsResponse.reason,
          );

          setBookings([]);
        }

        /*
        |--------------------------------------------------------------------------
        | Announcements
        |--------------------------------------------------------------------------
        */

        if (
          announcementsResponse.status ===
          "fulfilled"
        ) {
          setAnnouncements(
            extractList(
              announcementsResponse.value,
            ),
          );
        } else {
          console.error(
            "Failed to load announcements:",
            announcementsResponse.reason,
          );

          setAnnouncements([]);
        }

        /*
        |--------------------------------------------------------------------------
        | Facilities
        |--------------------------------------------------------------------------
        */

        if (
          facilitiesResponse.status ===
          "fulfilled"
        ) {
          setFacilities(
            extractList(
              facilitiesResponse.value,
            ),
          );
        } else {
          console.error(
            "Failed to load facilities:",
            facilitiesResponse.reason,
          );

          setFacilities([]);
        }

        /*
        |--------------------------------------------------------------------------
        | Partial failure handling
        |--------------------------------------------------------------------------
        */

        const results = [
          bookingsResponse,
          announcementsResponse,
          facilitiesResponse,
        ];

        const failedRequests = results.filter(
          (result) =>
            result.status === "rejected",
        );

        if (failedRequests.length === 3) {
          setError(
            "Unable to load your dashboard data. Please try again.",
          );
        } else if (
          failedRequests.length > 0
        ) {
          console.warn(
            "Some dashboard data could not be loaded.",
            failedRequests,
          );
        }
      } catch (requestError) {
        console.error(
          "Unable to load student dashboard:",
          requestError,
        );

        setError(
          "Unable to load your dashboard data. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  /*
  |--------------------------------------------------------------------------
  | Initial load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /*
  |--------------------------------------------------------------------------
  | Booking statistics
  |--------------------------------------------------------------------------
  */

  const pendingBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "pending",
      ),
    [bookings],
  );

  const approvedBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "approved",
      ),
    [bookings],
  );

  const completedBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "completed",
      ),
    [bookings],
  );

  /*
  |--------------------------------------------------------------------------
  | Dashboard statistics
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(
    () => [
      {
        label: "Total Bookings",
        value: bookings.length,
        icon: CalendarCheck,
        color: "blue",
      },
      {
        label: "Pending",
        value: pendingBookings.length,
        icon: Clock3,
        color: "amber",
      },
      {
        label: "Approved",
        value: approvedBookings.length,
        icon: CheckCircle2,
        color: "emerald",
      },
      {
        label: "Completed",
        value: completedBookings.length,
        icon: CheckCircle2,
        color: "violet",
      },
    ],
    [
      bookings.length,
      pendingBookings.length,
      approvedBookings.length,
      completedBookings.length,
    ],
  );

  /*
  |--------------------------------------------------------------------------
  | Recent bookings
  |--------------------------------------------------------------------------
  */

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const dateA = getDateValue(
          `${a.booking_date || ""}T${
            a.start_time || "00:00:00"
          }`,
        );

        const dateB = getDateValue(
          `${b.booking_date || ""}T${
            b.start_time || "00:00:00"
          }`,
        );

        return dateB - dateA;
      })
      .slice(0, 3);
  }, [bookings]);

  /*
  |--------------------------------------------------------------------------
  | Recent announcements
  |--------------------------------------------------------------------------
  */

  const recentAnnouncements = useMemo(() => {
    return [...announcements]
      .sort((a, b) => {
        const dateA = getDateValue(
          a.published_at ||
            a.created_at,
        );

        const dateB = getDateValue(
          b.published_at ||
            b.created_at,
        );

        return dateB - dateA;
      })
      .slice(0, 3);
  }, [announcements]);

  /*
  |--------------------------------------------------------------------------
  | Available facilities
  |--------------------------------------------------------------------------
  */

  const availableFacilities = useMemo(
    () =>
      facilities.filter(
        (facility) =>
          facility.status === "available" &&
          facility.is_bookable !== false,
      ),
    [facilities],
  );

  /*
  |--------------------------------------------------------------------------
  | Display name
  |--------------------------------------------------------------------------
  */

  const displayName =
    user?.first_name ||
    user?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Student";

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="student-dashboard">

      {/* =========================================================
          HEADER
      ========================================================== */}

      <section className="dashboard-welcome">
        <div>
          

          <h1>
            {greeting},{" "}
            <span>{displayName}.</span>
          </h1>

          <div className="student-live-time">
            <Clock3 size={14} />

            <span>{formattedDate}</span>

            <span className="student-live-time-separator">
              ·
            </span>

            <strong>{formattedTime}</strong>
          </div>

          <p>
            Manage your bookings, stay updated
            and access Kiangini ICT Centre
            services from your dashboard.
          </p>
        </div>

        <div className="dashboard-welcome-actions">
          <button
            type="button"
            className="btn btn-outline dashboard-refresh-button"
            onClick={() => loadDashboard(true)}
            disabled={loading || refreshing}
            title="Refresh dashboard"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "student-dashboard-refreshing"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <Link
            to="/student/bookings/new"
            className="btn btn-primary dashboard-book-button"
          >
            <Plus size={17} />
            New Booking
          </Link>
        </div>
      </section>

      {/* =========================================================
          ERROR
      ========================================================== */}

      {error && (
        <div className="student-dashboard-error">
          <XCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
          >
            Try again
          </button>
        </div>
      )}

      {/* =========================================================
          STATISTICS
      ========================================================== */}

      <section className="dashboard-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              className={`dashboard-stat dashboard-stat-${stat.color}`}
              key={stat.label}
            >
              <div className="dashboard-stat-icon">
                <Icon size={20} />
              </div>

              <div className="dashboard-stat-content">
                <span>{stat.label}</span>

                <strong>
                  {loading ? "—" : stat.value}
                </strong>
              </div>
            </article>
          );
        })}
      </section>

      {/* =========================================================
          MAIN GRID
      ========================================================== */}

      <div className="dashboard-grid">

        {/* =======================================================
            RECENT BOOKINGS
        ======================================================== */}

        <section className="dashboard-card dashboard-bookings">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">
                ACTIVITY
              </span>

              <h2>Recent bookings</h2>
            </div>

            <Link to="/student/bookings">
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="student-dashboard-state">
              <div className="student-dashboard-spinner" />

              <strong>
                Loading bookings...
              </strong>

              <span>
                Retrieving your latest booking
                activity.
              </span>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="student-dashboard-state">
              <div className="student-dashboard-empty-icon">
                <CalendarCheck size={24} />
              </div>

              <strong>No bookings yet</strong>

              <span>
                You haven't submitted any facility
                bookings.
              </span>

              <Link
                to="/student/bookings/new"
                className="btn btn-primary"
              >
                <Plus size={16} />
                Make your first booking
              </Link>
            </div>
          ) : (
            <div className="booking-list">
              {recentBookings.map((booking) => (
                <article
                  className="booking-item"
                  key={booking.id}
                >
                  <div className="booking-icon">
                    <Computer size={19} />
                  </div>

                  <div className="booking-info">
                    <strong>
                      {booking.facility_name ||
                        booking.facility?.name ||
                        "ICT Facility"}
                    </strong>

                    <div className="booking-meta">
                      <span>
                        <CalendarDays size={13} />

                        {formatDate(
                          booking.booking_date,
                        )}
                      </span>

                      <span>
                        <Clock3 size={13} />

                        {formatTime(
                          booking.start_time,
                        )}

                        {" – "}

                        {formatTime(
                          booking.end_time,
                        )}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`booking-status booking-status-${
                      booking.status || "unknown"
                    }`}
                  >
                    {formatStatus(
                      booking.status,
                    )}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =======================================================
            QUICK ACTIONS
        ======================================================== */}

        <section className="dashboard-card dashboard-actions">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">
                QUICK ACCESS
              </span>

              <h2>What do you need?</h2>
            </div>
          </div>

          <div className="quick-action-grid">

            <Link
              to="/student/bookings/new"
              className="quick-action quick-action-blue"
            >
              <CalendarCheck size={20} />

              <span>Book a facility</span>

              <ArrowRight size={15} />
            </Link>

            <Link
              to="/student/announcements"
              className="quick-action quick-action-violet"
            >
              <Bell size={20} />

              <span>View announcements</span>

              <ArrowRight size={15} />
            </Link>

            <Link
              to="/services"
              className="quick-action quick-action-cyan"
            >
              <Wifi size={20} />

              <span>Explore services</span>

              <ArrowRight size={15} />
            </Link>

            <Link
              to="/contact"
              className="quick-action quick-action-emerald"
            >
              <Users size={20} />

              <span>Contact support</span>

              <ArrowRight size={15} />
            </Link>

          </div>
        </section>
      </div>

      {/* =========================================================
          BOTTOM GRID
      ========================================================== */}

      <div className="dashboard-bottom-grid">

        {/* =======================================================
            ANNOUNCEMENTS
        ======================================================== */}

        <section className="dashboard-card dashboard-announcements">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">
                LATEST
              </span>

              <h2>Announcements</h2>
            </div>

            <Link to="/student/announcements">
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="student-dashboard-state compact">
              <div className="student-dashboard-spinner" />

              <span>
                Loading announcements...
              </span>
            </div>
          ) : recentAnnouncements.length === 0 ? (
            <div className="student-dashboard-state compact">
              <div className="student-dashboard-empty-icon">
                <Bell size={21} />
              </div>

              <strong>No announcements</strong>

              <span>
                New centre updates will appear here.
              </span>
            </div>
          ) : (
            <div className="dashboard-announcement-list">
              {recentAnnouncements.map(
                (announcement) => (
                  <Link
                    key={announcement.id}
                    to={`/announcements/${announcement.id}`}
                    className="dashboard-announcement"
                  >
                    <div className="dashboard-announcement-date">
                      <Bell size={16} />
                    </div>

                    <div>
                      <span>
                        {announcement.type_display ||
                          announcement.announcement_type_display ||
                          "Centre Notice"}
                      </span>

                      <strong>
                        {announcement.title}
                      </strong>

                      <small>
                        {formatDate(
                          announcement.published_at ||
                            announcement.created_at,
                        )}
                      </small>
                    </div>

                    <ArrowRight size={16} />
                  </Link>
                ),
              )}
            </div>
          )}
        </section>

        {/* =======================================================
            FACILITIES
        ======================================================== */}

        <section className="dashboard-card dashboard-facilities">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">
                FACILITIES
              </span>

              <h2>Available now</h2>
            </div>

            <Link to="/services">
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="student-dashboard-state compact">
              <div className="student-dashboard-spinner" />

              <span>
                Loading facilities...
              </span>
            </div>
          ) : availableFacilities.length === 0 ? (
            <div className="student-dashboard-state compact">
              <div className="student-dashboard-empty-icon">
                <Computer size={21} />
              </div>

              <strong>
                No facilities available
              </strong>

              <span>
                There are currently no bookable
                facilities.
              </span>
            </div>
          ) : (
            <div className="student-facility-list">
              {availableFacilities
                .slice(0, 4)
                .map((facility) => {
                  const facilityName =
                    facility.name || "ICT Facility";

                  const lowerName =
                    facilityName.toLowerCase();

                  const isNetwork =
                    lowerName.includes("internet") ||
                    lowerName.includes("network") ||
                    lowerName.includes("wifi") ||
                    lowerName.includes("wi-fi");

                  return (
                    <div
                      className="facility-status"
                      key={facility.id}
                    >
                      <div
                        className={`facility-status-icon ${
                          isNetwork
                            ? "facility-cyan"
                            : ""
                        }`}
                      >
                        {isNetwork ? (
                          <Wifi size={21} />
                        ) : (
                          <Computer size={21} />
                        )}
                      </div>

                      <div>
                        <strong>
                          {facilityName}
                        </strong>

                        <span>
                          {facility.location ||
                            "Available for booking"}
                        </span>
                      </div>

                      <span
                        className="availability-dot"
                        title="Available"
                      />
                    </div>
                  );
                })}
            </div>
          )}

          <Link
            to="/services"
            className="dashboard-facility-link"
          >
            Explore facilities
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  );
}

export default StudentDashboard;