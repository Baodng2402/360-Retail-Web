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
  <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
    {stats.map((stat, i) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: i * 0.05 }}
      >
        <StatCard {...stat} />
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
}: StatItem) => {
  const isTrendUp = trend === "up";
  const isTrendDown = trend === "down";

  let bgGradient =
    "bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-200 dark:border-blue-900";
  let iconBg = "bg-blue-100 dark:bg-blue-900/30";
  let iconColor = "text-primary";

  if (color?.includes("teal")) {
    bgGradient =
      "bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/20 dark:to-background border-teal-200 dark:border-teal-900";
    iconBg = "bg-teal-100 dark:bg-teal-900/30";
    iconColor = "text-teal-600 dark:text-teal-400";
  } else if (color?.includes("orange")) {
    bgGradient =
      "bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background border-orange-200 dark:border-orange-900";
    iconBg = "bg-orange-100 dark:bg-orange-900/30";
    iconColor = "text-orange-600 dark:text-orange-400";
  } else if (color?.includes("purple")) {
    bgGradient =
      "bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-purple-200 dark:border-purple-900";
    iconBg = "bg-purple-100 dark:bg-purple-900/30";
    iconColor = "text-purple-600 dark:text-purple-400";
  } else if (color?.includes("green")) {
    bgGradient =
      "bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-200 dark:border-green-900";
    iconBg = "bg-green-100 dark:bg-green-900/30";
    iconColor = "text-green-600 dark:text-green-400";
  }

  return (
    <div className={cn("p-6 rounded-xl border shadow-sm", bgGradient)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          {change ? (
            <p
              className={cn(
                "text-xs font-medium mt-1",
                isTrendUp && "text-green-600",
                isTrendDown && "text-red-600",
                !isTrendUp && !isTrendDown && "text-muted-foreground",
              )}
            >
              {change}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">{subLabel}</p>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            iconBg,
          )}
        >
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </div>
    </div>
  );
};
