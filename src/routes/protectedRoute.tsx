import { useAuthStore } from "@/shared/store/authStore";
import { Navigate, Outlet } from "react-router-dom";
import { UserStatus } from "@/shared/types/jwt-claims";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

/**
 * Protected route component that checks authentication and role-based access.
 * Also handles PotentialOwner redirect to /create-store
 */
export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, status, storeId } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Handle PotentialOwner - user đã đăng ký nhưng chưa start trial
  if (user?.role === "PotentialOwner" || status === UserStatus.Registered) {
    return <Navigate to="/create-store" replace />;
  }

  const normalizedAllowedRoles = (allowedRoles ?? [])
    .filter((role) => typeof role === "string")
    .map((role) => role.toLowerCase());

  const userRole =
    typeof user?.role === "string" ? user.role.toLowerCase() : null;

  if (
    normalizedAllowedRoles.length > 0 &&
    userRole &&
    !normalizedAllowedRoles.includes(userRole)
  ) {
    // Route fallback by role to avoid blank/loop UX (e.g. SuperAdmin hitting /dashboard).
    if (userRole === "superadmin") return <Navigate to="/admin" replace />;
    if (userRole === "customer") return <Navigate to="/customer" replace />;
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
};
