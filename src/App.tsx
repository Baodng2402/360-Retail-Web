import HomePage from "@/features/home/pages/HomePage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./routes/protectedRoute";
import "./App.css";
import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";
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

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <BrowserRouter>
        <Routes>
          <Route element={<HomeLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            element={
              <ProtectedRoute allowedRoles={["StoreOwner", "Manager"]} />
            }
          >
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route
                path="/dashboard/staff"
                element={<StaffManagementPage />}
              />
              <Route path="/dashboard/sales" element={<SalePostPage />} />
              <Route path="/dashboard/reports" element={<ReportPage />} />
              <Route path="/dashboard/settings" element={<SettingPage />} />
              <Route path="/dashboard/customers" element={<CustomerPage />} />
              <Route
                path="/dashboard/stores"
                element={<StoreManagementPage />}
              />
              <Route
                path="/dashboard/products"
                element={<ProductManagementPage />}
              />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
            </Route>
          </Route>
          {/* </Route> */}
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
