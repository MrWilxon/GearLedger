
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { DashboardSummaryCard } from "@/components/dashboard/DashboardSummaryCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { DollarSign, Boxes, Receipt, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLog } from '@/contexts/LogContext';
import { format } from 'date-fns';

// These will be replaced or removed once real data fetching is implemented
const initialDailySales = { total: 0, count: 0 };
const initialStockValue = 0;
const initialRecentExpenses: { amount: number; description: string }[] = [];

export default function DashboardPage() {
  const [dailySales, setDailySales] = useState(initialDailySales);
  const [stockValue, setStockValue] = useState(initialStockValue);
  const [recentExpensesSummary, setRecentExpensesSummary] = useState({
    total: 0,
    count: 0,
  });

  const { logEntries } = useLog(); // For recent activity

  // In a real app, these values would be fetched from a backend or calculated from live data.
  // For now, we'll keep them reflecting an empty/initial state.
  useEffect(() => {
    // Placeholder for potential future logic to update dashboard from real data sources
    // For example, if expenses were fetched:
    // const newRecentExpenses = calculateRecentExpenses(fetchedExpenses);
    // setRecentExpensesSummary({
    //   total: newRecentExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    //   count: newRecentExpenses.length
    // });
  }, []);


  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back! Here's an overview of your showroom." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <DashboardSummaryCard
          title="Today's Sales"
          value={`NRs. ${dailySales.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description={`${dailySales.count} services`}
          icon={DollarSign}
          iconClassName="text-green-500"
        />
        <DashboardSummaryCard
          title="Total Stock Value"
          value={`NRs. ${stockValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Boxes}
          iconClassName="text-blue-500"
        />
        <DashboardSummaryCard
          title="Recent Expenses"
          value={`NRs. ${recentExpensesSummary.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description={`${recentExpensesSummary.count} recent transactions`}
          icon={Receipt}
          iconClassName="text-orange-500"
        />
         <DashboardSummaryCard
          title="Pending Tasks"
          value="0" // Assuming no pending tasks initially
          description="Awaiting completion"
          icon={Activity}
          iconClassName="text-yellow-500"
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <SalesChart />
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and entries from your current session.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[260px]">
              <div className="space-y-4">
                {logEntries.length > 0 ? (
                  logEntries.slice(0, 5).map((activity) => ( // Show latest 5 log entries
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {activity.user} <span className="font-normal text-muted-foreground">{activity.action.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.details} - {format(activity.timestamp, "MMM dd, hh:mm a")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity in this session.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
