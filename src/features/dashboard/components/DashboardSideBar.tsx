import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  Lock,
  AlertCircle,
} from "lucide-react";
import logo from "@/assets/logo.png";
import {
  NewSaleModal,
  StaffCheckInModal,
} from "@/features/dashboard/components/modals/QuickActionModals";
import CreateTaskModal from "@/features/dashboard/components/modals/CreateTaskModal";
import { authApi } from "@/shared/lib/authApi";
import { UserStatus } from "@/shared/types/jwt-claims";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  const [userStatus, setUserStatus] = useState<"loading" | "hasStore" | "noStore">("loading");
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUserStoreStatus();
  }, []);

  const checkUserStoreStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserStatus("noStore");
        return;
      }

      const userInfo = await authApi.meWithSubscription();
      if (userInfo.status === UserStatus.Registered || !userInfo.storeId) {
        setUserStatus("noStore");
      } else {
        setUserStatus("hasStore");
      }
    } catch {
      setUserStatus("noStore");
    }
  };

  const handleNavClick = (item: typeof mainNavItems[0]) => {
    if (userStatus === "noStore" && item.requiresStore) {
      setShowSetupDialog(true);
      return;
    }
    navigate(item.path);
  };

  const mainNavItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard 360°",
      subLabel: "Tổng quan 360°",
      path: "/dashboard",
      end: true,
      requiresStore: false,
    },
    {
      icon: Users,
      label: "Staff",
      subLabel: "Nhân viên",
      path: "/dashboard/staff",
      end: false,
      requiresStore: true,
    },
    {
      icon: StoreIcon,
      label: "Stores",
      subLabel: "Cửa hàng",
      path: "/dashboard/stores",
      end: false,
      requiresStore: true,
    },
    {
      icon: Package,
      label: "Products",
      subLabel: "Sản phẩm",
      path: "/dashboard/products",
      end: false,
      requiresStore: true,
    },
    {
      icon: ShoppingCart,
      label: "Sales & POS",
      subLabel: "Bán hàng",
      path: "/dashboard/sales",
      end: false,
      requiresStore: true,
    },
    {
      icon: UserCircle,
      label: "Customers",
      subLabel: "Khách hàng",
      path: "/dashboard/customers",
      end: false,
      requiresStore: true,
    },
    {
      icon: FileText,
      label: "Reports",
      subLabel: "Báo cáo",
      path: "/dashboard/reports",
      end: false,
      requiresStore: true,
    },
    {
      icon: CreditCard,
      label: "Subscription",
      subLabel: "Gói dịch vụ",
      path: "/dashboard/subscription",
      end: false,
      requiresStore: true,
    },
    {
      icon: Settings,
      label: "Settings",
      subLabel: "Cài đặt",
      path: "/dashboard/settings",
      end: false,
      requiresStore: true,
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
            {mainNavItems.map((item) => {
              const isLocked = item.requiresStore && userStatus === "noStore";
              const isActive = location.pathname === item.path ||
                (item.end === false && location.pathname.startsWith(item.path));

              return (
                <li key={item.path} className="relative">
                  <div
                    onClick={() => handleNavClick(item)}
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
                    className={cn(
                      "flex items-center rounded-lg transition-all duration-200 cursor-pointer",
                      isCollapsed ? "justify-center px-3 py-2.5" : "gap-3 px-3 py-2.5",
                      isActive
                        ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md"
                        : isLocked
                        ? "opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <div className="relative">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {isLocked && (
                        <Lock className="h-3 w-3 absolute -top-1 -right-1 text-red-500" />
                      )}
                    </div>
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
                        <span className={cn("text-sm font-medium", isLocked && "text-gray-400")}>
                          {item.label}
                        </span>
                        <span className={cn("text-xs opacity-70", isLocked && "text-gray-300")}>
                          {item.subLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
            {isCollapsed && (
              <>
                <li className="py-2">
                  <div className="border-t border-gray-200 dark:border-gray-700 mx-3"></div>
                </li>
                {quickActions.map((action) => (
                  <li key={action.label} className="relative">
                    <button
                      onClick={() => {
                        if (userStatus === "noStore") {
                          setShowSetupDialog(true);
                        } else {
                          setNewSaleOpen(true);
                        }
                      }}
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
                      className={cn(
                        "flex w-full items-center justify-center rounded-lg px-3 py-2.5 transition-all duration-200",
                        userStatus === "noStore"
                          ? "opacity-50 cursor-not-allowed text-gray-400"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      )}
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
                      onClick={() => {
                        if (userStatus === "noStore") {
                          setShowSetupDialog(true);
                        } else {
                          action.action();
                        }
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
                        userStatus === "noStore"
                          ? "opacity-50 cursor-not-allowed text-gray-400"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      )}
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

      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Thiết lập cửa hàng
            </DialogTitle>
            <DialogDescription>
              Bạn cần hoàn thành thiết lập cửa hàng trước khi sử dụng tính năng này.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Vui lòng hoàn thành thiết lập cửa hàng của bạn để bắt đầu quản lý doanh nghiệp.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSetupDialog(false)}
              >
                Để sau
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                onClick={() => {
                  setShowSetupDialog(false);
                  navigate("/dashboard");
                }}
              >
                Thiết lập ngay
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
