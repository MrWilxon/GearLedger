
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart"; 
import { format } from 'date-fns';

const chartConfig = {
  sales: {
    label: "Sales (NRs.)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface SalesChartProps {
  salesDataForChart: { date: string; sales: number }[];
}

export function SalesChart({ salesDataForChart }: SalesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Last 7 days sales trend (Data from localStorage)</CardDescription>
      </CardHeader>
      <CardContent>
        {salesDataForChart.length > 0 ? (
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
                tickFormatter={(value) => `NRs. ${value.toLocaleString()}`}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                labelFormatter={(label) => format(new Date(label), "yyyy-MM-dd")}
                formatter={(value: number, name: string) => [`NRs. ${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, chartConfig[name as keyof typeof chartConfig]?.label || name]}
              />
              <Legend content={({ payload }) => {
                if (!payload) return null;
                return (
                  <ul className="flex justify-center space-x-4 mt-2">
                    {payload.map((entry, index) => (
                      <li key={`item-${index}`} className="flex items-center">
                        <span style={{ backgroundColor: entry.color, width: '10px', height: '10px', marginRight: '5px', display: 'inline-block' }}></span>
                        {chartConfig[entry.dataKey as keyof typeof chartConfig]?.label || entry.dataKey}
                      </li>
                    ))}
                  </ul>
                );
              }}/>
              <Bar dataKey="sales" fill={chartConfig.sales.color} radius={4} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No sales data available for the last 7 days.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
