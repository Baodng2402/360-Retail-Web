import { useAuthStore } from "@/shared/store/authStore";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

/**
 * Protected route component that checks authentication and role-based access.
 * User sẽ được redirect về /dashboard, dashboard sẽ xử lý onboarding nếu chưa có store.
 */
export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // KHÔNG redirect PotentialOwner về /create-store ở đây
  // Dashboard sẽ tự kiểm tra và hiển thị onboarding state
  // User sẽ được redirect về /dashboard và thấy màn hình "Bạn cần tạo cửa hàng"

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
