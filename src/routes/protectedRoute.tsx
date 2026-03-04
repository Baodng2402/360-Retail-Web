import { useAuthStore } from "@/shared/store/authStore";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
};
