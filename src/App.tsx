import { GoogleOAuthProvider } from "@react-oauth/google";
import HomePage from "@/features/home/pages/HomePage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import SuperAdminPage from "@/features/admin/pages/SuperAdminPage";
import EmployeeDetailPage from "@/features/dashboard/pages/EmployeeDetailPage";
import MyTasksPage from "@/features/dashboard/pages/MyTasksPage";
import CrmDashboardPage from "@/features/dashboard/pages/CrmDashboardPage";

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <BrowserRouter>
          <SubscriptionUpgradeDialog />
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
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/failed" element={<PaymentFailedPage />} />
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
              <Route index element={<SuperAdminPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
