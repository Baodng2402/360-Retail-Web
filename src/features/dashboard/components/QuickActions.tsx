import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Users,
  FileText,
  Settings,
  TrendingUp,
} from "lucide-react";
import {
  NewSaleModal,
  StaffCheckInModal,
  GenerateReportModal,
} from "./modals/QuickActionModals";
import { useAuthStore } from "@/shared/store/authStore";

interface QuickAction {
  icon: React.ElementType;
  title: string;
  description: string;
  action: "modal" | "navigate";
  modalType?: "newSale" | "checkIn" | "report";
  path?: string;
  gradient: string;
  visibleFor?: ("StoreOwner" | "Manager" | "Staff")[];
}

const quickActions: QuickAction[] = [
  {
    icon: ShoppingCart,
    title: "New Sale",
    description: "Tạo đơn hàng mới",
    action: "modal",
    modalType: "newSale",
    gradient: "from-teal-500 to-teal-600",
    visibleFor: ["StoreOwner", "Manager", "Staff"],
  },
  {
    icon: Package,
    title: "View Inventory",
    description: "Xem tồn kho",
    action: "navigate",
    path: "/dashboard/sales",
    gradient: "from-teal-500 to-teal-600",
    visibleFor: ["StoreOwner", "Manager", "Staff"],
  },
  {
    icon: Users,
    title: "Staff Check-in",
    description: "Chấm công nhân viên",
    action: "modal",
    modalType: "checkIn",
    gradient: "from-teal-500 to-teal-600",
    visibleFor: ["StoreOwner", "Manager", "Staff"],
  },
  {
    icon: FileText,
    title: "Generate Report",
    description: "Tạo báo cáo",
    action: "modal",
    modalType: "report",
    gradient: "from-teal-500 to-teal-600",
    visibleFor: ["StoreOwner", "Manager"],
  },
  {
    icon: TrendingUp,
    title: "View Analytics",
    description: "Xem phân tích",
    action: "navigate",
    path: "/dashboard/reports",
    gradient: "from-teal-500 to-teal-600",
    visibleFor: ["StoreOwner", "Manager"],
  },
  {
    icon: Settings,
    title: "Settings",
    description: "Cài đặt hệ thống",
    action: "navigate",
    path: "/dashboard/settings",
    gradient: "from-teal-500 to-teal-600",
    visibleFor: ["StoreOwner"],
  },
];

const QuickActions = () => {
  const navigate = useNavigate();
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { user } = useAuthStore();
  const role = user?.role ?? "";

  const filteredActions = quickActions.filter((action) => {
    if (!action.visibleFor) return true;
    return action.visibleFor.includes(role as any);
  });

  if (!filteredActions.length) {
    return null;
  }

  const handleActionClick = (action: QuickAction) => {
    if (action.action === "navigate" && action.path) {
      navigate(action.path);
    } else if (action.action === "modal") {
      switch (action.modalType) {
        case "newSale":
          setNewSaleOpen(true);
          break;
        case "checkIn":
          // Staff chỉ được tự chấm công => dẫn về trang Timekeeping
          if (role === "Staff") {
            navigate("/dashboard/timekeeping");
          } else {
            setCheckInOpen(true);
          }
          break;
        case "report":
          setReportOpen(true);
          break;
      }
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            Quick Actions
          </h2>
          <span className="text-sm text-muted-foreground">Thao tác nhanh</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {filteredActions.map((action, idx) => (
            <button
              key={action.title + idx}
              onClick={() => handleActionClick(action)}
              className="p-3 md:p-4 bg-card border border-border rounded-xl hover:shadow-lg hover:border-primary/20 transition-all group"
            >
              <div
                className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <action.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="text-xs md:text-sm font-semibold text-foreground mb-1">
                {action.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <NewSaleModal open={newSaleOpen} onOpenChange={setNewSaleOpen} />
      <StaffCheckInModal open={checkInOpen} onOpenChange={setCheckInOpen} />
      <GenerateReportModal open={reportOpen} onOpenChange={setReportOpen} />
    </>
  );
};

export default QuickActions;
