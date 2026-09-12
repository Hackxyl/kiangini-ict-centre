import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RoleRoute({ allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="route-loading">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    if (user?.role === 'student') {
      return (
        <Navigate
          to="/student/dashboard"
          replace
        />
      );
    }

    if (user?.role === 'officer') {
      return (
        <Navigate
          to="/officer/dashboard"
          replace
        />
      );
    }

    if (user?.role === 'admin') {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;