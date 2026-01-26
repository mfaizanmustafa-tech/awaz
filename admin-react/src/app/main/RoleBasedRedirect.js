import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from 'app/store/userSlice';
import FuseLoading from '@fuse/core/FuseLoading';

function RoleBasedRedirect() {
  const user = useSelector(selectUser);

  console.log('RoleBasedRedirect - User:', user);

  // If user data is not loaded yet, show loading
  if (user === undefined || user === null) {
    console.log('RoleBasedRedirect - No user data, showing loading');
    return <FuseLoading />;
  }

  // Get role - handle both string and array formats
  const userRole = Array.isArray(user.role) ? user.role[0] : user.role;
  console.log('RoleBasedRedirect - User role:', userRole);

  // Redirect based on user role
  if (userRole === 'admin' || (Array.isArray(user.role) && user.role.includes('admin'))) {
    console.log('RoleBasedRedirect - Redirecting admin to /admin/overview');
    return <Navigate to="/admin/overview" replace />;
  }
  
  if (userRole === 'station_owner' || (Array.isArray(user.role) && user.role.includes('station_owner'))) {
    console.log('RoleBasedRedirect - Redirecting station_owner to /station-owner/overview');
    return <Navigate to="/station-owner/overview" replace />;
  }

  // If user has no role or unknown role, redirect to sign-in
  console.log('RoleBasedRedirect - Unknown role, redirecting to sign-in');
  return <Navigate to="/sign-in" replace />;
}

export default RoleBasedRedirect;
