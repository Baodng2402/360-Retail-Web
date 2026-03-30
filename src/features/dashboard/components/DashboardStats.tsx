import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export interface StatItem {
  label: string;
  subLabel: string;
  value: string | number;
  icon: LucideIcon;
  change?: string | null;
  trend?: "up" | "down" | "neutral" | null;
  color?: string;
}

export const DashboardStats = ({ stats }: { stats: StatItem[] }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
    {stats.map((stat, i) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        whileHover={{ y: -2 }}
      >
        <StatCard {...stat} index={i} />
      </motion.div>
    ))}
  </div>
);

const StatCard = ({
  label,
  subLabel,
  value,
  icon: Icon,
  change,
  trend,
  color,
  index: _i,
}: StatItem & { index?: number }) => {
  const isTrendUp = trend === "up";
  const isTrendDown = trend === "down";

  let bgGradient =
    "bg-gradient-to-br from-[#FF7B21]/5 to-background dark:from-[#FF7B21]/10 dark:to-background border-[#FF7B21]/20";
  let iconBg = "bg-gradient-to-br from-[#FF7B21] to-[#FF9F45]";
  let iconColor = "text-white";

  if (color?.includes("teal")) {
    bgGradient =
      "bg-gradient-to-br from-[#19D6C8]/10 to-background dark:from-[#19D6C8]/15 dark:to-background border-[#19D6C8]/20";
    iconBg = "bg-gradient-to-br from-[#19D6C8] to-cyan-400";
    iconColor = "text-white";
  } else if (color?.includes("orange")) {
    bgGradient =
      "bg-gradient-to-br from-orange-500/10 to-background dark:from-orange-500/15 dark:to-background border-orange-500/20";
    iconBg = "bg-gradient-to-br from-orange-500 to-amber-500";
    iconColor = "text-white";
  } else if (color?.includes("purple")) {
    bgGradient =
      "bg-gradient-to-br from-purple-500/10 to-background dark:from-purple-500/15 dark:to-background border-purple-500/20";
    iconBg = "bg-gradient-to-br from-purple-500 to-pink-500";
    iconColor = "text-white";
  } else if (color?.includes("green") || color?.includes("emerald")) {
    bgGradient =
      "bg-gradient-to-br from-emerald-500/10 to-background dark:from-emerald-500/15 dark:to-background border-emerald-500/20";
    iconBg = "bg-gradient-to-br from-emerald-500 to-teal-500";
    iconColor = "text-white";
  }

  return (
    <div className={cn(
      "p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg",
      "relative overflow-hidden group",
      bgGradient
    )}>
      {/* Background glow effect */}
      <div className="absolute -top-10 -right-10 w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] blur-2xl" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400 mb-1 truncate">{label}</p>
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-foreground dark:text-white">{value}</h3>
          {change ? (
            <p
              className={cn(
                "text-[10px] sm:text-xs font-semibold mt-1 flex items-center gap-1",
                isTrendUp && "text-emerald-600 dark:text-emerald-400",
                isTrendDown && "text-red-600 dark:text-red-400",
                !isTrendUp && !isTrendDown && "text-muted-foreground",
              )}
            >
              {isTrendUp && "↑ "}
              {isTrendDown && "↓ "}
              {change}
            </p>
          ) : (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">{subLabel}</p>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 sm:w-11 sm:h-11 md:w-12 lg:w-14 md:h-12 lg:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ml-2 sm:ml-3",
            iconBg
          )}
        >
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5", iconColor)} />
        </div>
      </div>
    </div>
  );
};
