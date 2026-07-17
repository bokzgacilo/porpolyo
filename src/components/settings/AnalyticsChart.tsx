"use client";

import { Box, useToken } from "@chakra-ui/react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AnalyticsPoint = {
  label: string;
  views: number;
};

export function AnalyticsChart({ values }: { values: number[] }) {
  const [gridColor, lineColor, textColor, mutedColor, surfaceColor] = useToken(
    "colors",
    ["border", "blue.500", "fg", "fg.muted", "bg"],
  );
  const data = useMemo<AnalyticsPoint[]>(
    () =>
      values.map((views, index) => {
        const daysAgo = values.length - index - 1;
        return {
          label: daysAgo === 0 ? "Today" : `${daysAgo}d ago`,
          views,
        };
      }),
    [values],
  );

  return (
    <Box
      role="img"
      aria-label="Portfolio views over the last 30 days"
      width="full"
      height={{ base: "240px", md: "320px" }}
      minWidth={0}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 12, right: 12, bottom: 4, left: -16 }}
        >
          <defs>
            <linearGradient id="portfolio-views-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={gridColor} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            minTickGap={28}
            tick={{ fill: mutedColor, fontSize: 11 }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            width={42}
            tick={{ fill: mutedColor, fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: gridColor, strokeDasharray: "4 4" }}
            contentStyle={{
              background: surfaceColor,
              border: `1px solid ${gridColor}`,
              borderRadius: 8,
              color: textColor,
              fontSize: 12,
            }}
            formatter={(value) => [Number(value).toLocaleString(), "Views"]}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke={lineColor}
            strokeWidth={2}
            fill="url(#portfolio-views-gradient)"
            dot={false}
            activeDot={{ r: 4, fill: lineColor }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
