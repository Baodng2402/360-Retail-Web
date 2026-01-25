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
  ChevronLeft,
  ChevronRight,
  Store as StoreIcon,
  Package,
  CreditCard,
} from "lucide-react";
import logo from "@/assets/logo.png";
import {
  NewSaleModal,
  StaffCheckInModal,
} from "@/features/dashboard/components/modals/QuickActionModals";
import CreateTaskModal from "@/features/dashboard/components/modals/CreateTaskModal";
import { SetupStoreBadge } from "@/shared/components/ui/SetupStoreBanner";

interface DashboardSideBarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const DashboardSideBar = ({
  isCollapsed,
  onToggle,
}: DashboardSideBarProps) => {
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<{
    label: string;
    subLabel: string;
    x: number;
    y: number;
  } | null>(null);

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
      icon: CreditCard,
      label: "Subscription",
      subLabel: "Gói dịch vụ",
      path: "/dashboard/subscription",
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
      {isCollapsed && hoveredItem && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${hoveredItem.x}px`,
            top: `${hoveredItem.y}px`,
            transform: "translateY(-50%)",
          }}
        >
          <div className="px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-xl whitespace-nowrap">
            <div className="font-medium">{hoveredItem.label}</div>
            <div className="text-xs opacity-90">{hoveredItem.subLabel}</div>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-800"></div>
          </div>
        </div>
      )}
      <aside
        className={`relative flex h-screen flex-col border-r bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-[width] duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
        style={{
          willChange: "width",
        }}
      >
        <div className={`h-[73px] flex items-center px-4 flex-shrink-0 border-b border-gray-200 dark:border-gray-800`}>
          <div
            className={`flex items-center gap-3 w-full ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex w-10 h-10 items-center justify-center flex-shrink-0">
              <img src={logo} alt="logo" className="w-full h-full object-contain" />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isCollapsed
                  ? "w-0 opacity-0 scale-95"
                  : "w-auto opacity-100 scale-100 min-w-0"
              }`}
              style={{
                transitionDelay: isCollapsed ? "0ms" : "100ms",
              }}
            >
              <div className="whitespace-nowrap">
                <h1 className="text-lg font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
                  Retail 360
                </h1>
                <p className="text-xs text-muted-foreground">
                  SME Platform
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className={`flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent ${isCollapsed ? "scrollbar-hide" : ""}`}>
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.path} className="relative">
                <NavLink
                  to={item.path}
                  end={item.end}
                  onMouseEnter={(e) => {
                    if (isCollapsed) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredItem({
                        label: item.label,
                        subLabel: item.subLabel,
                        x: rect.right + 8,
                        y: rect.top + rect.height / 2,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    if (isCollapsed) {
                      setHoveredItem(null);
                    }
                  }}
                  className={({ isActive }) => {
                    const baseClasses = `flex items-center rounded-lg transition-all duration-200 ${
                      isCollapsed ? "justify-center px-3 py-2.5" : "gap-3 px-3 py-2.5"
                    } ${
                      isActive
                        ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`;
                    return baseClasses;
                  }}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isCollapsed
                        ? "w-0 opacity-0 scale-95"
                        : "w-auto opacity-100 scale-100 ml-0"
                    }`}
                    style={{
                      transitionDelay: isCollapsed ? "0ms" : "100ms",
                    }}
                  >
                    <div className="flex flex-col whitespace-nowrap relative">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs opacity-70">{item.subLabel}</span>
                      {item.path === "/dashboard/settings" && <SetupStoreBadge />}
                    </div>
                  </div>
                </NavLink>
              </li>
            ))}
            {isCollapsed && (
              <>
                <li className="py-2">
                  <div className="border-t border-gray-200 dark:border-gray-700 mx-3"></div>
                </li>
                {quickActions.map((action) => (
                  <li key={action.label} className="relative">
                    <button
                      onClick={action.action}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredItem({
                          label: action.label,
                          subLabel: action.subLabel,
                          x: rect.right + 8,
                          y: rect.top + rect.height / 2,
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredItem(null);
                      }}
                      className="flex w-full items-center justify-center rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <action.icon className="h-5 w-5 flex-shrink-0" />
                    </button>
                  </li>
                ))}
              </>
            )}
          </ul>

          {!isCollapsed && (
            <div className="mt-4">
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground whitespace-nowrap">
                Quick Actions
              </h3>
              <ul className="space-y-1">
                {quickActions.map((action) => (
                  <li key={action.label}>
                    <button
                      onClick={action.action}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <action.icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {action.label}
                        </span>
                        <span className="text-xs opacity-70">
                          {action.subLabel}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <div className="p-3 flex items-center justify-end flex-shrink-0 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onToggle}
            className="flex items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-10 h-10"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
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
