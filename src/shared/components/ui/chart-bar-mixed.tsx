"use client";

import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";

export const title = "A mixed bar chart";

export interface ChartDataItem {
  items: string;
  values: number;
  fill?: string; // Màu tùy chỉnh cho từng cột
}

export interface ChartBarMixedProps {
  chartData: ChartDataItem[];
  chartConfig: ChartConfig;
  className?: string;
  title?: string;
}

const ChartBarMixed = ({
  chartData,
  chartConfig,
  className,
  title,
}: ChartBarMixedProps) => (
  <div
    className={`w-full rounded-md border border-border bg-card p-4 ${
      className || ""
    }`}
  >
    <h3 className="text-base md:text-lg font-semibold pb-4 md:pb-5">{title}</h3>
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <XAxis
          axisLine={false}
          dataKey="items"
          tickLine={false}
          tickMargin={10}
          interval={0}
          tickFormatter={(value: string) =>
            typeof value === "string" && value.length > 10
              ? `${value.slice(0, 10)}…`
              : value
          }
        />
        <YAxis axisLine={false} tickLine={false} tickMargin={10} />
        <ChartTooltip
          content={<ChartTooltipContent hideLabel />}
          cursor={false}
        />
        <Bar dataKey="values" radius={5}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill || "hsl(var(--chart-1))"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  </div>
);

export default ChartBarMixed;
