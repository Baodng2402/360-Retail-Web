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
  X,
  Store as StoreIcon,
  Package,
} from "lucide-react";
import logo from "@/assets/logo.png";
import {
  NewSaleModal,
  StaffCheckInModal,
} from "@/features/dashboard/components/modals/QuickActionModals";
import CreateTaskModal from "@/features/dashboard/components/modals/CreateTaskModal";

interface DashboardSideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSideBar = ({
  isOpen,
  onClose,
}: DashboardSideBarProps) => {
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const mainNavItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard 360°",
      subLabel: "Tổng quan 360°",
      path: "/dashboard",
      end: true,
    },
    {
      icon: Users,
      label: "Staff",
      subLabel: "Nhân viên",
      path: "/dashboard/staff",
      end: false,
    },
    {
      icon: StoreIcon,
      label: "Stores",
      subLabel: "Cửa hàng",
      path: "/dashboard/stores",
      end: false,
    },
    {
      icon: Package,
      label: "Products",
      subLabel: "Sản phẩm",
      path: "/dashboard/products",
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
      label: "Create a task ",
      subLabel: "Tạo task",
      action: () => setFeedbackOpen(true),
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 w-64 h-screen flex-col bg-background border-r border-border flex-shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:flex`}
      >
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex w-15 h-15 items-center justify-center border border-border rounded-full">
                <img src={logo} alt="logo" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Retail 360
                </h1>
                <p className="text-xs text-muted-foreground">SME Platform</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-hide">
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.path} className="relative">
                <NavLink
                  to={item.path}
                  end={item.end}
                  onClick={() => onClose()}
                  className={({ isActive }) => {
                    const baseClasses = `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "from-teal-500 to-teal-600 bg-gradient-to-r text-white shadow-md"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`;
                    return baseClasses;
                  }}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs opacity-90">{item.subLabel}</span>
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Quick Actions Section */}
          <div className="mt-8">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Quick Actions / Thao tác nhanh
            </h3>
            <ul className="space-y-1">
              {quickActions.map((action) => (
                <li key={action.label}>
                  <button
                    onClick={action.action}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
                  >
                    <action.icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {action.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
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
