import { Suspense, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import HomePage from "@/features/home/pages/HomePage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./routes/protectedRoute";
import "./App.css";
import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";
import VerifyEmailPage from "@/features/auth/pages/VerifyEmailPage";
import ForgotPasswordRequestPage from "@/features/auth/pages/ForgotPasswordRequestPage";
import ForgotPasswordResetPage from "@/features/auth/pages/ForgotPasswordResetPage";
import { SubscriptionUpgradeDialog } from "@/shared/components/ui/SubscriptionUpgradeDialog";
import FeedbackPage from "@/features/feedback/pages/FeedbackPage";
import TimekeepingPage from "@/features/dashboard/pages/TimekeepingPage";
import OrdersPage from "@/features/dashboard/pages/OrdersPage";
import OrderDetailPage from "@/features/dashboard/pages/OrderDetailPage";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import { HomeLayout } from "@/features/home/components/HomeLayout";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Toaster } from "react-hot-toast";
import StaffManagementPage from "@/features/dashboard/pages/StaffManagementPage";
import SalePostPage from "@/features/dashboard/pages/SalePostPage";
import ReportPage from "@/features/dashboard/pages/ReportPage";
import SettingPage from "@/features/dashboard/pages/SettingPage";
import CustomerPage from "@/features/dashboard/pages/CustomerPage";
import StoreManagementPage from "@/features/dashboard/pages/StoreManagementPage";
import ProductManagementPage from "@/features/dashboard/pages/ProductManagementPage";
import { ProfilePage } from "@/features/dashboard/pages/ProfilePage";
import SubscriptionPlansPage from "@/features/subscription/pages/SubscriptionPlansPage";
import PaymentSuccessPage from "@/features/payment/pages/PaymentSuccessPage";
import PaymentFailedPage from "@/features/payment/pages/PaymentFailedPage";
import CustomerDashboardPage from "@/features/customer/pages/CustomerDashboardPage";
import CustomerOrderDetailPage from "@/features/customer/pages/CustomerOrderDetailPage";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";
import AdminUsersPage from "@/features/admin/pages/AdminUsersPage";
import AdminUserDetailPage from "@/features/admin/pages/AdminUserDetailPage";
import AdminStoresPage from "@/features/admin/pages/AdminStoresPage";
import AdminStoreDetailPage from "@/features/admin/pages/AdminStoreDetailPage";
import AdminReviewsPage from "@/features/admin/pages/AdminReviewsPage";
import AdminProfilePage from "@/features/admin/pages/AdminProfilePage";
import AdminPlansPage from "@/features/admin/pages/AdminPlansPage";
import AdminSubscriptionsPage from "@/features/admin/pages/AdminSubscriptionsPage";
import AdminPaymentsPage from "@/features/admin/pages/AdminPaymentsPage";
import EmployeeDetailPage from "@/features/dashboard/pages/EmployeeDetailPage";
import MyTasksPage from "@/features/dashboard/pages/MyTasksPage";
import CrmDashboardPage from "@/features/dashboard/pages/CrmDashboardPage";
import InventoryManagementPage from "@/features/dashboard/pages/InventoryManagementPage";
import i18n from "@/i18n";
import { useLanguageStore } from "@/shared/store/languageStore";
import UnauthorizedPage from "@/shared/pages/UnauthorizedPage";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import LoyaltyCheckPage from "@/features/loyalty/pages/LoyaltyCheckPage";

function App() {
  const language = useLanguageStore((s) => s.language);
  const googleMisconfigured =
    !googleClientId || googleClientId.trim() === "" || googleClientId === "YOUR_GOOGLE_CLIENT_ID";

  useEffect(() => {
    void i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Suspense fallback={<div className="p-4 text-sm">Loading...</div>}>
          <BrowserRouter>
            <SubscriptionUpgradeDialog />
            {googleMisconfigured && (
              <div className="bg-amber-100 text-amber-900 border-b border-amber-300 px-4 py-2 text-xs sm:text-sm">
                <strong>Google Login chưa được cấu hình cho môi trường này.</strong>{" "}
                Vui lòng thêm biến môi trường <code>VITE_GOOGLE_CLIENT_ID</code> trỏ đúng
                OAuth Client của domain deploy (VD: 360retail.shop) trong dashboard deploy
                (Vercel/hosting), rồi build lại frontend.
              </div>
            )}
            <Routes>
              <Route element={<HomeLayout />}>
                <Route path="/" element={<HomePage />} />
              </Route>

              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordRequestPage />} />
              <Route path="/reset-password" element={<ForgotPasswordResetPage />} />
              <Route path="/feedback/:orderId" element={<FeedbackPage />} />
              <Route path="/loyalty" element={<LoyaltyCheckPage />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/failed" element={<PaymentFailedPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["StoreOwner", "Manager", "Staff", "PotentialOwner"]}
                  />
                }
              >
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route
                    path="/dashboard/staff"
                    element={<StaffManagementPage />}
                  />
                  <Route
                    path="/dashboard/staff/:id"
                    element={<EmployeeDetailPage />}
                  />
                  <Route path="/dashboard/sales" element={<SalePostPage />} />
                  <Route path="/dashboard/my-tasks" element={<MyTasksPage />} />
                  <Route path="/dashboard/orders" element={<OrdersPage />} />
                  <Route
                    path="/dashboard/orders/:id"
                    element={<OrderDetailPage />}
                  />
                  <Route path="/dashboard/reports" element={<ReportPage />} />
                  <Route path="/dashboard/settings" element={<SettingPage />} />
                  <Route path="/dashboard/customers" element={<CustomerPage />} />
                  <Route path="/dashboard/crm" element={<CrmDashboardPage />} />
                  <Route
                    path="/dashboard/stores"
                    element={<StoreManagementPage />}
                  />
                  <Route
                    path="/dashboard/products"
                    element={<ProductManagementPage />}
                  />
                  <Route
                    path="/dashboard/inventory"
                    element={<InventoryManagementPage />}
                  />
                  <Route path="/dashboard/profile" element={<ProfilePage />} />
                  <Route
                    path="/dashboard/subscription"
                    element={<SubscriptionPlansPage />}
                  />
                  <Route
                    path="/dashboard/timekeeping"
                    element={<TimekeepingPage />}
                  />
                </Route>
              </Route>
              <Route
                path="/customer"
                element={<ProtectedRoute allowedRoles={["Customer"]} />}
              >
                <Route index element={<CustomerDashboardPage />} />
                <Route path="orders/:orderId" element={<CustomerOrderDetailPage />} />
              </Route>
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["SuperAdmin"]} />
                }
              >
                <Route element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="plans" element={<AdminPlansPage />} />
                  <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                  <Route path="payments" element={<AdminPaymentsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="users/:id" element={<AdminUserDetailPage />} />
                  <Route path="stores" element={<AdminStoresPage />} />
                  <Route path="stores/:id" element={<AdminStoreDetailPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="profile" element={<AdminProfilePage />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </Suspense>
        <Toaster position="top-right" />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
