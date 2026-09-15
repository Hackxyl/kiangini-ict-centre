import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  Monitor,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const stats = [
    {
      label: 'Total Users',
      value: '0',
      description: 'Registered accounts',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Bookings',
      value: '0',
      description: 'Facility bookings',
      icon: CalendarCheck,
      color: 'cyan',
    },
    {
      label: 'Announcements',
      value: '0',
      description: 'Published updates',
      icon: Bell,
      color: 'indigo',
    },
    {
      label: 'Facilities',
      value: '0',
      description: 'Managed facilities',
      icon: Monitor,
      color: 'emerald',
    },
  ];

  const managementItems = [
    {
      title: 'User Management',
      description:
        'Manage students, officers and administrator accounts.',
      icon: Users,
      path: '/admin/users',
      color: 'blue',
    },
    {
      title: 'Bookings',
      description:
        'Monitor and manage facility booking requests.',
      icon: CalendarCheck,
      path: '/admin/bookings',
      color: 'cyan',
    },
    {
      title: 'Announcements',
      description:
        'Create, edit and manage centre announcements.',
      icon: Bell,
      path: '/admin/announcements',
      color: 'indigo',
    },
    {
      title: 'Facilities',
      description:
        'Manage ICT facilities and available resources.',
      icon: Monitor,
      path: '/admin/facilities',
      color: 'emerald',
    },
  ];

  return (
    <div className="admin-dashboard">

      {/* Header */}

      <section className="admin-dashboard-header">

        <div>
          <span className="admin-eyebrow">
            ADMINISTRATION
          </span>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Manage Kiangini ICT Centre services, users,
            facilities and digital activities.
          </p>
        </div>

        <div className="admin-header-actions">

          <button
            type="button"
            className="admin-icon-button"
            title="Notifications"
          >
            <Bell size={19} />
          </button>

          <Link
            to="/admin/settings"
            className="admin-settings-button"
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>

        </div>

      </section>


      {/* Security Banner */}

      <section className="admin-security-banner">

        <div className="admin-security-icon">
          <ShieldCheck size={21} />
        </div>

        <div>
          <strong>
            Administrator access
          </strong>

          <p>
            You have administrative access to manage
            the Kiangini ICT Centre platform.
          </p>
        </div>

        <span className="admin-security-status">
          Secure
        </span>

      </section>


      {/* Statistics */}

      <section className="admin-stats-grid">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className={`admin-stat-card ${stat.color}`}
              key={stat.label}
            >

              <div className="admin-stat-top">

                <div className="admin-stat-icon">
                  <Icon size={20} />
                </div>

                <ArrowUpRight size={17} />

              </div>

              <div className="admin-stat-value">
                {stat.value}
              </div>

              <div className="admin-stat-label">
                {stat.label}
              </div>

              <div className="admin-stat-description">
                {stat.description}
              </div>

            </div>
          );
        })}

      </section>


      {/* Main Grid */}

      <div className="admin-dashboard-grid">

        {/* Management */}

        <section className="admin-panel">

          <div className="admin-panel-header">

            <div>
              <span className="admin-panel-label">
                PLATFORM
              </span>

              <h2>
                Management
              </h2>
            </div>

            <Activity size={20} />

          </div>

          <div className="admin-management-list">

            {managementItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  to={item.path}
                  className="admin-management-item"
                  key={item.title}
                >

                  <div
                    className={`admin-management-icon ${item.color}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="admin-management-content">

                    <strong>
                      {item.title}
                    </strong>

                    <span>
                      {item.description}
                    </span>

                  </div>

                  <ChevronRight size={18} />

                </Link>
              );
            })}

          </div>

        </section>


        {/* Quick Actions */}

        <section className="admin-panel">

          <div className="admin-panel-header">

            <div>
              <span className="admin-panel-label">
                QUICK ACTIONS
              </span>

              <h2>
                Get started
              </h2>
            </div>

            <ClipboardList size={20} />

          </div>

          <div className="admin-quick-actions">

            <Link
              to="/admin/announcements/new"
              className="admin-action-button primary"
            >
              <Bell size={18} />
              <span>
                Publish Announcement
              </span>
              <ArrowUpRight size={17} />
            </Link>

            <Link
              to="/admin/facilities"
              className="admin-action-button secondary"
            >
              <Monitor size={18} />
              <span>
                Manage Facilities
              </span>
              <ArrowUpRight size={17} />
            </Link>

            <Link
              to="/admin/users"
              className="admin-action-button tertiary"
            >
              <Users size={18} />
              <span>
                Manage Users
              </span>
              <ArrowUpRight size={17} />
            </Link>

          </div>

        </section>

      </div>


      {/* System Overview */}

      <section className="admin-panel admin-system-panel">

        <div className="admin-panel-header">

          <div>
            <span className="admin-panel-label">
              SYSTEM
            </span>

            <h2>
              System Overview
            </h2>
          </div>

          <span className="admin-live-status">
            <span />
            Operational
          </span>

        </div>

        <div className="admin-system-grid">

          <div className="admin-system-item">
            <span>Authentication</span>
            <strong>Operational</strong>
          </div>

          <div className="admin-system-item">
            <span>API Services</span>
            <strong>Operational</strong>
          </div>

          <div className="admin-system-item">
            <span>Database</span>
            <strong>Connected</strong>
          </div>

          <div className="admin-system-item">
            <span>Platform</span>
            <strong>Online</strong>
          </div>

        </div>

      </section>

    </div>
  );
}

export default AdminDashboard;