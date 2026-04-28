import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function ProtectedRoute({ roles }) {
  const location = useLocation();
  const { user, profile, loading, error } = useAuth();

  if (loading) {
    return <div className="pageState">Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!profile) {
    return <div className="emptyState">{error || 'Профиль пользователя не найден. Проверьте данные Firestore.'}</div>;
  }

  if (roles && !roles.includes(profile.role)) {
    return <Navigate to="/projects" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
