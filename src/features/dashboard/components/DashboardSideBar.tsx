import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  UserCircle,
  FileText,
  Settings,
  Plus,
  ClipboardCheck,
  MessageSquare,
} from "lucide-react";
import logo from "@/assets/logo.png";
import {
  NewSaleModal,
  StaffCheckInModal,
} from "@/features/dashboard/components/modals/QuickActionModals";
import CreateTaskModal from "@/features/dashboard/components/modals/CreateTaskModal";

export const DashboardSideBar = () => {
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const mainNavItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard 360°",
      subLabel: "Tổng quan 360°",
      path: "/dashboard",
      end: true, // Only active on exact /dashboard path
    },
    {
      icon: Users,
      label: "Staff",
      subLabel: "Nhân viên",
      path: "/dashboard/staff",
      end: false,
    },
    {
      icon: ShoppingCart,
      label: "Sales & POS",
      subLabel: "Bán hàng",
      path: "/dashboard/sales",
      end: false,
    },
    {
      icon: UserCircle,
      label: "Customers",
      subLabel: "Khách hàng",
      path: "/dashboard/customers",
      end: false,
    },
    {
      icon: FileText,
      label: "Reports",
      subLabel: "Báo cáo",
      path: "/dashboard/reports",
      end: false,
    },
    {
      icon: Settings,
      label: "Settings",
      subLabel: "Cài đặt",
      path: "/dashboard/settings",
      end: false,
    },
  ];

  const quickActions = [
    {
      icon: Plus,
      label: "Create Order",
      subLabel: "Tạo đơn hàng",
      action: () => setNewSaleOpen(true),
    },
    {
      icon: ClipboardCheck,
      label: "Staff Check-in",
      subLabel: "Check-in nhân viên",
      action: () => setCheckInOpen(true),
    },
    {
      icon: MessageSquare,
      label: "Record Feedback",
      subLabel: "Ghi feedback",
      action: () => setFeedbackOpen(true),
    },
  ];

  return (
    <>
      <aside className="flex h-screen w-64 flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex w-15 h-15 items-center justify-center border rounded-full text-white">
              <img src={logo} alt="logo" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Retail 360
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                SME Platform
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                      isActive
                        ? "from-teal-500 to-teal-600 bg-gradient-to-r text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs opacity-90">{item.subLabel}</span>
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Quick Actions Section */}
          <div className="mt-8">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Quick Actions / Thao tác nhanh
            </h3>
            <ul className="space-y-1">
              {quickActions.map((action) => (
                <li key={action.label}>
                  <button
                    onClick={action.action}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-gray-700 transition-all duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <action.icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {action.label}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {action.subLabel}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      {/* Modals */}
      <NewSaleModal open={newSaleOpen} onOpenChange={setNewSaleOpen} />
      <StaffCheckInModal open={checkInOpen} onOpenChange={setCheckInOpen} />
      <CreateTaskModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        feedbackData={undefined}
      />
    </>
  );
};
