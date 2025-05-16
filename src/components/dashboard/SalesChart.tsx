
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart"; // Assuming Chart component exports this
import { salesDataForChart } from "@/lib/mockData"; // Assuming this data is available
import { format } from 'date-fns';


const chartConfig = {
  sales: {
    label: "Sales (NRs.)", // Updated label
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Last 7 days sales trend</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesDataForChart}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => format(new Date(value), "MMM dd")}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `NRs. ${value}`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
              labelFormatter={(label) => format(new Date(label), "yyyy-MM-dd")}
              formatter={(value: number, name: string) => [`NRs. ${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, chartConfig[name as keyof typeof chartConfig]?.label || name]}
            />
            <Bar dataKey="sales" fill={chartConfig.sales.color} radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
