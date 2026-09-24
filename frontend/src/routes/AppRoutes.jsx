import { Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';

import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Services from '../pages/public/Services';
import Announcements from '../pages/public/Announcements';
import AnnouncementDetails from '../pages/public/AnnouncementDetails';
import Contact from '../pages/public/Contact';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import RoleRoute from './RoleRoute';

import StudentLayout from '../layouts/StudentLayout';
import OfficerLayout from '../layouts/OfficerLayout';
import AdminLayout from '../layouts/AdminLayout';

import StudentDashboard from '../pages/student/StudentDashboard';
import MyBookings from '../pages/student/MyBookings';
import NewBooking from '../pages/student/NewBooking';
import StudentAnnouncements from '../pages/student/StudentAnnouncements';
import StudentActivity from '../pages/student/StudentActivity';
import StudentProfile from '../pages/student/StudentProfile';
import StudentSettings from '../pages/student/StudentSettings';

import OfficerDashboard from '../pages/officer/OfficerDashboard';
import OfficerBookings from '../pages/officer/OfficerBookings';
import OfficerBookingDetails from '../pages/officer/OfficerBookingDetails';
import OfficerAnnouncements from '../pages/officer/OfficerAnnouncements';
import OfficerAnnouncementForm from '../pages/officer/OfficerAnnouncementForm';
import EditOfficerAnnouncement from '../pages/officer/EditOfficerAnnouncement';
import OfficerFacilities from '../pages/officer/OfficerFacilities';
import OfficerActivity from '../pages/officer/OfficerActivity';
import OfficerProfile from '../pages/officer/OfficerProfile';
import OfficerSettings from '../pages/officer/OfficerSettings';

import AdminDashboard from '../pages/admin/AdminDashboard';

import AdminUsers from '../pages/admin/AdminUsers';
import AdminUserForm from '../pages/admin/AdminUserForm';

import AdminBookings from '../pages/admin/AdminBookings';
import AdminBookingDetails from '../pages/admin/AdminBookingDetails';

import AdminFacilities from '../pages/admin/AdminFacilities';
import AdminFacilityForm from '../pages/admin/AdminFacilityForm';

import AdminAnnouncements from '../pages/admin/AdminAnnouncements';
import AdminAnnouncementForm from '../pages/admin/AdminAnnouncementForm';

import AdminActivity from '../pages/admin/AdminActivity';

import AdminSettings from '../pages/admin/AdminSettings';


function NotFound() {
  return <h1>Page Not Found</h1>;
}


function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC PAGES
      ===================================================== */}

      <Route element={<PublicLayout />}>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/services"
          element={<Services />}
        />

        <Route
          path="/announcements"
          element={<Announcements />}
        />

        <Route
          path="/announcements/:id"
          element={<AnnouncementDetails />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

      </Route>


      {/* =====================================================
          AUTHENTICATION
      ===================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =====================================================
          PROTECTED STUDENT PORTAL
      ===================================================== */}

      <Route
        element={
          <RoleRoute
            allowedRoles={['student']}
          />
        }
      >

        <Route element={<StudentLayout />}>

          <Route
            path="/student/dashboard"
            element={<StudentDashboard />}
          />

          <Route
            path="/student/bookings"
            element={<MyBookings />}
          />

          <Route
            path="/student/bookings/new"
            element={<NewBooking />}
          />

          <Route
            path="/student/announcements"
            element={<StudentAnnouncements />}
          />

          <Route
            path="/student/activity"
            element={<StudentActivity />}
          />

          <Route
            path="/student/profile"
            element={<StudentProfile />}
          />

          <Route
            path="/student/settings"
            element={<StudentSettings />}
          />

        </Route>

      </Route>


      {/* =====================================================
          PROTECTED OFFICER PORTAL
          Officers and administrators
      ===================================================== */}

      <Route
        element={
          <RoleRoute
            allowedRoles={['officer', 'admin']}
          />
        }
      >

        <Route element={<OfficerLayout />}>

          <Route
            path="/officer/dashboard"
            element={<OfficerDashboard />}
          />

          <Route
            path="/officer/bookings"
            element={<OfficerBookings />}
          />

          <Route
            path="/officer/bookings/:id"
            element={<OfficerBookingDetails />}
          />

          <Route
            path="/officer/facilities"
            element={<OfficerFacilities />}
          />

          <Route
            path="/officer/announcements"
            element={<OfficerAnnouncements />}
          />

          <Route
            path="/officer/announcements/new"
            element={<OfficerAnnouncementForm />}
          />

          <Route
            path="/officer/announcements/:id/edit"
            element={<EditOfficerAnnouncement />}
          />

          <Route
            path="/officer/activity"
            element={<OfficerActivity />}
          />

          <Route
            path="/officer/profile"
            element={<OfficerProfile />}
          />

          <Route
            path="/officer/settings"
            element={<OfficerSettings />}
          />

        </Route>

      </Route>


      {/* PROTECTED ADMIN PORTAL */}
           <Route element={<RoleRoute allowedRoles={['admin']} />}>
  <Route element={<AdminLayout />}>
    <Route path="/admin/dashboard" element={<AdminDashboard />} />

    <Route path="/admin/users" element={<AdminUsers />} />
    <Route path="/admin/users/new" element={<AdminUserForm />} />
    <Route path="/admin/users/:id/edit" element={<AdminUserForm />} />

    <Route path="/admin/bookings" element={<AdminBookings />} />
    <Route
      path="/admin/bookings/:id"
      element={<AdminBookingDetails />}
    />

    <Route
      path="/admin/facilities"
      element={<AdminFacilities />}
    />

    <Route
      path="/admin/facilities/new"
      element={<AdminFacilityForm />}
    />

    <Route
      path="/admin/facilities/:id/edit"
      element={<AdminFacilityForm />}
    />

    <Route
      path="/admin/announcements"
      element={<AdminAnnouncements />}
    />

    <Route
      path="/admin/announcements/new"
      element={<AdminAnnouncementForm />}
    />

    <Route
      path="/admin/announcements/:id/edit"
      element={<AdminAnnouncementForm />}
    />

    <Route
      path="/admin/activity"
      element={<AdminActivity />}
    />
    <Route
      path="/admin/settings"
      element={<AdminSettings />}
    />
    
  </Route>
</Route>

      {/* =====================================================
          404
      ===================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}


export default AppRoutes;