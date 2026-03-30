import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  FileText,
  Settings,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import {
  NewSaleModal,
  GenerateReportModal,
} from "./modals/QuickActionModals";
import { useAuthStore } from "@/shared/store/authStore";

interface QuickAction {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  action: "modal" | "navigate";
  modalType?: "newSale" | "checkIn" | "report";
  path?: string;
  gradient: string;
  hoverGradient: string;
  visibleFor?: Array<"StoreOwner" | "Manager" | "Staff">;
}

const quickActions: QuickAction[] = [
  {
    icon: ShoppingCart,
    title: "New Sale",
    description: "Tạo đơn hàng mới",
    action: "modal",
    modalType: "newSale",
    gradient: "from-[#FF7B21] to-[#FF9F45]",
    hoverGradient: "hover:from-[#FF9F45] hover:to-[#FF7B21]",
    visibleFor: ["StoreOwner", "Manager", "Staff"],
  },
  {
    icon: Package,
    title: "View Inventory",
    description: "Xem tồn kho",
    action: "navigate",
    path: "/dashboard/sales",
    gradient: "from-[#19D6C8] to-cyan-400",
    hoverGradient: "hover:from-cyan-400 hover:to-[#19D6C8]",
    visibleFor: ["StoreOwner", "Manager", "Staff"],
  },
  {
    icon: FileText,
    title: "Generate Report",
    description: "Tạo báo cáo",
    action: "modal",
    modalType: "report",
    gradient: "from-emerald-500 to-teal-500",
    hoverGradient: "hover:from-teal-500 hover:to-emerald-500",
    visibleFor: ["StoreOwner", "Manager"],
  },
  {
    icon: TrendingUp,
    title: "View Analytics",
    description: "Xem phân tích",
    action: "navigate",
    path: "/dashboard/reports",
    gradient: "from-blue-500 to-indigo-500",
    hoverGradient: "hover:from-indigo-500 hover:to-blue-500",
    visibleFor: ["StoreOwner", "Manager"],
  },
  {
    icon: Settings,
    title: "Settings",
    description: "Cài đặt hệ thống",
    action: "navigate",
    path: "/dashboard/settings",
    gradient: "from-slate-500 to-gray-600",
    hoverGradient: "hover:from-gray-600 hover:to-slate-500",
    visibleFor: ["StoreOwner"],
  },
];

const QuickActions = () => {
  const navigate = useNavigate();
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { user } = useAuthStore();
  type Role = NonNullable<QuickAction["visibleFor"]>[number];
  const role = (user?.role ?? "") as Role | "";

  const filteredActions = quickActions.filter((action) => {
    if (!action.visibleFor) return true;
    if (!role) return false;
    return action.visibleFor.includes(role);
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
          <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
            Quick Actions
          </h2>
          <span className="text-sm text-muted-foreground">Thao tác nhanh</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {filteredActions.map((action, idx) => (
            <motion.button
              key={action.title + idx}
              onClick={() => handleActionClick(action)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-3 md:p-4 bg-gradient-to-br from-card to-muted/30 border border-border/50 rounded-2xl hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group relative overflow-hidden"
            >
              {/* Glow background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21]/5 to-[#19D6C8]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <motion.div
                className={`relative w-11 h-11 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 bg-gradient-to-br ${action.gradient} ${action.hoverGradient} rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl`}
                whileHover={{ rotate: 5 }}
              >
                {(() => {
                  const IconComponent = action.icon;
                  return <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-white" />;
                })()}
              </motion.div>

              <h3 className="text-xs md:text-sm font-semibold text-foreground mb-1 relative z-10">
                {action.title}
              </h3>
              <p className="text-xs text-muted-foreground relative z-10">
                {action.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      <NewSaleModal open={newSaleOpen} onOpenChange={setNewSaleOpen} />
      <GenerateReportModal open={reportOpen} onOpenChange={setReportOpen} />
    </>
  );
};

export default QuickActions;
