
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { DashboardSummaryCard } from "@/components/dashboard/DashboardSummaryCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { DollarSign, Boxes, Receipt, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLog } from '@/contexts/LogContext';
import { format, subDays } from 'date-fns';
import type { ServiceRecord, Expense, StockItem } from '@/types';

// localStorage keys (must match those in client components)
const SERVICE_RECORDS_STORAGE_KEY = "gearledger_service_records";
const EXPENSES_STORAGE_KEY = "gearledger_expenses";
const STOCK_ITEMS_STORAGE_KEY = "gearledger_stock_items";

export default function DashboardPage() {
  const [dailySales, setDailySales] = useState({ total: 0, count: 0 });
  const [stockValue, setStockValue] = useState(0);
  const [recentExpensesSummary, setRecentExpensesSummary] = useState({ total: 0, count: 0 });
  const [salesChartData, setSalesChartData] = useState<{ date: string; sales: number }[]>([]);

  const { logEntries } = useLog(); 

  useEffect(() => {
    // Load and process data from localStorage for dashboard summaries
    // This effect runs only on the client after hydration

    // --- Sales Data ---
    const storedServiceRecords = localStorage.getItem(SERVICE_RECORDS_STORAGE_KEY);
    let currentDaySalesTotal = 0;
    let currentDaySalesCount = 0;
    const today = new Date();
    const last7DaysSales: { [key: string]: number } = {};

    // Initialize last 7 days for chart
    for (let i = 6; i >= 0; i--) {
      const day = subDays(today, i);
      last7DaysSales[format(day, "yyyy-MM-dd")] = 0;
    }

    if (storedServiceRecords) {
      try {
        const parsedServiceRecords = JSON.parse(storedServiceRecords) as ServiceRecord[];
        parsedServiceRecords.forEach(record => {
          const recordDate = new Date(record.date);
          // Daily Sales (Today)
          if (format(recordDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
            currentDaySalesTotal += record.cost;
            currentDaySalesCount += 1;
          }
          // Sales for last 7 days chart
          const recordDateStr = format(recordDate, "yyyy-MM-dd");
          if (last7DaysSales.hasOwnProperty(recordDateStr)) {
            last7DaysSales[recordDateStr] += record.cost;
          }
        });
      } catch (e) { console.error("Error parsing service records for dashboard", e); }
    }
    setDailySales({ total: currentDaySalesTotal, count: currentDaySalesCount });
    setSalesChartData(
      Object.entries(last7DaysSales).map(([date, sales]) => ({ date, sales })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );


    // --- Stock Value ---
    const storedStockItems = localStorage.getItem(STOCK_ITEMS_STORAGE_KEY);
    let currentStockValue = 0;
    if (storedStockItems) {
      try {
        const parsedStockItems = JSON.parse(storedStockItems) as StockItem[];
        currentStockValue = parsedStockItems.reduce((acc, item) => acc + item.price * item.quantityInStock, 0);
      } catch (e) { console.error("Error parsing stock items for dashboard", e); }
    }
    setStockValue(currentStockValue);

    // --- Recent Expenses (e.g., last 7 days) ---
    const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
    let recentExpensesTotal = 0;
    let recentExpensesCount = 0;
    const sevenDaysAgo = subDays(today, 7);
    if (storedExpenses) {
      try {
        const parsedExpenses = JSON.parse(storedExpenses) as Expense[];
        parsedExpenses.forEach(expense => {
          const expenseDate = new Date(expense.date);
          if (expenseDate >= sevenDaysAgo && expenseDate <= today) {
            recentExpensesTotal += expense.amount;
            recentExpensesCount += 1;
          }
        });
      } catch (e) { console.error("Error parsing expenses for dashboard", e); }
    }
    setRecentExpensesSummary({ total: recentExpensesTotal, count: recentExpensesCount });

  }, [logEntries]); // Re-run if logEntries change, implying data might have changed


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
          title="Recent Expenses (Last 7 Days)"
          value={`NRs. ${recentExpensesSummary.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description={`${recentExpensesSummary.count} transactions`}
          icon={Receipt}
          iconClassName="text-orange-500"
        />
         <DashboardSummaryCard
          title="Pending Tasks"
          value="0" 
          description="Awaiting completion"
          icon={Activity}
          iconClassName="text-yellow-500"
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <SalesChart salesDataForChart={salesChartData} />
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and entries from your current session.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[260px]">
              <div className="space-y-4">
                {logEntries.length > 0 ? (
                  logEntries.slice(0, 10).map((activity) => ( 
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
