"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";

export const title = "A line chart";

const defaultChartData = [
  { month: "T1", desktop: 0 },
  { month: "T2", desktop: 0 },
  { month: "T3", desktop: 0 },
  { month: "T4", desktop: 0 },
  { month: "T5", desktop: 0 },
  { month: "T6", desktop: 0 },
];

const chartConfig = {
  desktop: {
    label: "Doanh thu (VNĐ)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export interface ChartLineDataItem {
  month: string;
  desktop: number;
}

interface ChartLineDefaultProps {
  data?: ChartLineDataItem[];
  isLoading?: boolean;
  chartClassName?: string;
  title?: string;
}

const ChartLineDefault = ({
  data = defaultChartData,
  isLoading,
  chartClassName,
  title = "Revenue Trend / Xu hướng doanh thu",
}: ChartLineDefaultProps) => (
  <div className="w-full rounded-md border border-border bg-card p-3 sm:p-4 min-w-0">
    <h3 className="text-sm sm:text-base font-semibold pb-2">{title}</h3>
    {isLoading ? (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        Đang tải...
      </div>
    ) : (
    <ChartContainer
      config={chartConfig}
      className={
        chartClassName ??
        "aspect-auto h-[200px] w-full min-h-[180px] max-h-[240px]"
      }
    >
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          content={<ChartTooltipContent hideLabel />}
          cursor={false}
        />
        <Line
          dataKey="desktop"
          dot={false}
          stroke="var(--color-desktop)"
          strokeWidth={2}
          type="natural"
          isAnimationActive
        />
      </LineChart>
    </ChartContainer>
    )}
  </div>
);

export default ChartLineDefault;
