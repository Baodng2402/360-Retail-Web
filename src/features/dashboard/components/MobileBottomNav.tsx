"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Clock,
  ListChecks,
  ShoppingBag,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: Clock,
    label: "Chấm công",
    path: "/dashboard/timekeeping",
  },
  {
    icon: ListChecks,
    label: "Tasks",
    path: "/dashboard/my-tasks",
  },
  {
    icon: ShoppingBag,
    label: "Đơn hàng",
    path: "/dashboard/orders",
  },
  {
    icon: Users,
    label: "Khách hàng",
    path: "/dashboard/customers",
  },
  {
    icon: Settings,
    label: "Cài đặt",
    path: "/dashboard/settings",
  },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-lg border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around py-1.5 px-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/dashboard" &&
              location.pathname.startsWith(item.path));

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] min-h-[48px]",
                isActive
                  ? "text-[#FF7B21]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )}
                />
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF7B21]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[9px] font-medium transition-all duration-200",
                  isActive ? "font-semibold" : ""
                )}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};