import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  // 1. If the AuthContext is still checking localStorage, show nothing (or a spinner)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. If no token exists, send them to login
  // We save the 'from' location so we can redirect them back after they login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If roles are specified, check if the user's role matches
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Everything is fine, show the protected content
  return children;
};

export default ProtectedRoute;