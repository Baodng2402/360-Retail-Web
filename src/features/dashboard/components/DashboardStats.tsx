import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
    {stats.map((stat) => (
      <StatCard key={stat.label} {...stat} />
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

  return (
    <div className="group bg-card border border-border rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-lg", color)}>
          <Icon className="h-6 w-6" />
        </div>

        {change && (
          <span
            className={cn(
              "text-sm font-medium px-2 py-0.5 rounded-full bg-secondary",
              isTrendUp && "text-green-600 bg-green-50",
              isTrendDown && "text-red-600 bg-red-50"
            )}
          >
            {change}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        <span className="text-xs text-muted-foreground/80 font-normal">
          {subLabel}
        </span>
      </div>
    </div>
  );
};
