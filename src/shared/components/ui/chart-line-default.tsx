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
}

const ChartLineDefault = ({ data = defaultChartData, isLoading }: ChartLineDefaultProps) => (
  <div className="w-full rounded-md border border-border bg-card p-4">
    <h3 className="text-base md:text-lg font-semibold pb-4 md:pb-5">
      Revenue Trend / Xu hướng doanh thu
    </h3>
    {isLoading ? (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        Đang tải...
      </div>
    ) : (
    <ChartContainer config={chartConfig}>
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
        />
      </LineChart>
    </ChartContainer>
    )}
  </div>
);

export default ChartLineDefault;
