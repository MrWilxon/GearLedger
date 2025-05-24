
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { DashboardSummaryCard } from "@/components/dashboard/DashboardSummaryCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { DollarSign, Boxes, Receipt, Activity, FileText, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLog } from '@/contexts/LogContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  format,
  subDays,
  isWithinInterval,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  subWeeks,
  getISOWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears
} from 'date-fns';
import type { ServiceRecord, Expense, StockItem, Task } from '@/types';
import ReportsClient from "./reports/components/ReportsClient";

// localStorage keys (must match those in client components)
const SERVICE_RECORDS_STORAGE_KEY = "gearledger_service_records";
const EXPENSES_STORAGE_KEY = "gearledger_expenses";
const STOCK_ITEMS_STORAGE_KEY = "gearledger_stock_items";
const TASKS_STORAGE_KEY = "gearledger_tasks";

type SalesPeriod = "daily" | "weekly" | "monthly" | "annually";

export default function DashboardPage() {
  const [dailySales, setDailySales] = useState({ total: 0, count: 0 });
  const [stockValue, setStockValue] = useState(0);
  const [recentExpensesSummary, setRecentExpensesSummary] = useState({ total: 0, count: 0 });
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [salesChartData, setSalesChartData] = useState<{ date: string; sales: number }[]>([]);
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>("daily");

  const { logEntries } = useLog();

  useEffect(() => {
    const today = startOfDay(new Date());

    // --- Daily Sales and Count ---
    const storedServiceRecords = localStorage.getItem(SERVICE_RECORDS_STORAGE_KEY);
    let currentDaySalesTotal = 0;
    let currentDaySalesCount = 0;

    const allServiceRecords: ServiceRecord[] = storedServiceRecords
      ? (JSON.parse(storedServiceRecords) as ServiceRecord[]).map(r => ({ ...r, date: new Date(r.date) }))
      : [];

    allServiceRecords.forEach(record => {
      const recordDateStart = startOfDay(new Date(record.date));
      if (recordDateStart.getTime() === today.getTime()) {
        currentDaySalesTotal += record.cost;
        currentDaySalesCount += 1;
      }
    });
    setDailySales({ total: currentDaySalesTotal, count: currentDaySalesCount });

    // --- Sales Chart Data ---
    const processSalesData = () => {
      if (!allServiceRecords.length) {
        setSalesChartData([]);
        return;
      }

      let aggregatedSales: { [key: string]: number } = {};
      let chartDataPoints: { label: string; sales: number; originalDate: Date }[] = [];

      if (salesPeriod === 'daily') {
        const startDate = subDays(today, 29); // Last 30 days
        const daysInPeriod = eachDayOfInterval({ start: startDate, end: today });

        daysInPeriod.forEach(day => {
          aggregatedSales[format(day, "yyyy-MM-dd")] = 0;
        });

        allServiceRecords.forEach(record => {
          if (record.date >= startDate && record.date <= today) {
            const recordDateStr = format(record.date, "yyyy-MM-dd");
            if (aggregatedSales.hasOwnProperty(recordDateStr)) {
              aggregatedSales[recordDateStr] += record.cost;
            }
          }
        });
        chartDataPoints = daysInPeriod.map(day => ({
          label: format(day, "MMM dd"),
          sales: aggregatedSales[format(day, "yyyy-MM-dd")] || 0,
          originalDate: day,
        }));
      } else if (salesPeriod === 'weekly') {
        const numWeeks = 12;
        const weekStarts: Date[] = [];
        for (let i = numWeeks - 1; i >= 0; i--) {
          weekStarts.push(startOfWeek(subWeeks(today, i), { weekStartsOn: 1 }));
        }

        weekStarts.forEach(weekStart => {
          aggregatedSales[format(weekStart, "yyyy-II")] = 0; // ISO week format
        });

        const firstWeekStart = weekStarts[0];
        const lastWeekEnd = endOfWeek(weekStarts[weekStarts.length - 1], { weekStartsOn: 1 });

        allServiceRecords.forEach(record => {
          if (record.date >= firstWeekStart && record.date <= lastWeekEnd) {
            const recordWeekStartKey = format(startOfWeek(record.date, { weekStartsOn: 1 }), "yyyy-II");
            if (aggregatedSales.hasOwnProperty(recordWeekStartKey)) {
              aggregatedSales[recordWeekStartKey] += record.cost;
            }
          }
        });
        chartDataPoints = weekStarts.map(weekStart => ({
          label: `W${getISOWeek(weekStart)} '${format(weekStart, 'yy')}`,
          sales: aggregatedSales[format(weekStart, "yyyy-II")] || 0,
          originalDate: weekStart,
        }));
      } else if (salesPeriod === 'monthly') {
        const numMonths = 12;
        const monthStarts: Date[] = [];
        for (let i = numMonths - 1; i >= 0; i--) {
          monthStarts.push(startOfMonth(subMonths(today, i)));
        }

        monthStarts.forEach(monthStart => {
          aggregatedSales[format(monthStart, "yyyy-MM")] = 0;
        });

        const firstMonthStart = monthStarts[0];
        const lastMonthEnd = endOfMonth(monthStarts[monthStarts.length - 1]);

        allServiceRecords.forEach(record => {
          if (record.date >= firstMonthStart && record.date <= lastMonthEnd) {
            const recordMonthKey = format(startOfMonth(record.date), "yyyy-MM");
            if (aggregatedSales.hasOwnProperty(recordMonthKey)) {
              aggregatedSales[recordMonthKey] += record.cost;
            }
          }
        });
        chartDataPoints = monthStarts.map(monthStart => ({
          label: format(monthStart, "MMM yyyy"),
          sales: aggregatedSales[format(monthStart, "yyyy-MM")] || 0,
          originalDate: monthStart,
        }));
      } else if (salesPeriod === 'annually') {
        const numYears = 5;
        const yearStarts: Date[] = [];
        for (let i = numYears - 1; i >= 0; i--) {
          yearStarts.push(startOfYear(subYears(today, i)));
        }

        yearStarts.forEach(yearStart => {
          aggregatedSales[format(yearStart, "yyyy")] = 0;
        });

        const firstYearStart = yearStarts[0];
        const lastYearEnd = endOfYear(yearStarts[yearStarts.length - 1]);

        allServiceRecords.forEach(record => {
          if (record.date >= firstYearStart && record.date <= lastYearEnd) {
            const recordYearKey = format(startOfYear(record.date), "yyyy");
            if (aggregatedSales.hasOwnProperty(recordYearKey)) {
              aggregatedSales[recordYearKey] += record.cost;
            }
          }
        });
        chartDataPoints = yearStarts.map(yearStart => ({
          label: format(yearStart, "yyyy"),
          sales: aggregatedSales[format(yearStart, "yyyy")] || 0,
          originalDate: yearStart,
        }));
      }

      setSalesChartData(chartDataPoints.map(d => ({ date: d.label, sales: d.sales })));
    };
    processSalesData();


    // --- Total Stock Value ---
    const storedStockItems = localStorage.getItem(STOCK_ITEMS_STORAGE_KEY);
    let currentStockValue = 0;
    if (storedStockItems) {
      try {
        const parsedStockItems = JSON.parse(storedStockItems) as StockItem[];
        currentStockValue = parsedStockItems.reduce((acc, item) => acc + item.price * item.quantityInStock, 0);
      } catch (e) { console.error("Error parsing stock items for dashboard", e); }
    }
    setStockValue(currentStockValue);

    // --- Recent Expenses (Last 7 Days) ---
    const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
    let recentExpensesTotal = 0;
    let recentExpensesCount = 0;
    const sixDaysAgoStart = startOfDay(subDays(today, 6)); // Today + 6 previous days for a 7-day period

    if (storedExpenses) {
      try {
        const parsedExpenses = JSON.parse(storedExpenses) as Expense[];
        parsedExpenses.forEach(expense => {
          const expenseDate = startOfDay(new Date(expense.date));
          if (expenseDate >= sixDaysAgoStart && expenseDate <= today) { // Inclusive of today and 6 days prior
            recentExpensesTotal += expense.amount;
            recentExpensesCount += 1;
          }
        });
      } catch (e) { console.error("Error parsing expenses for dashboard", e); }
    }
    setRecentExpensesSummary({ total: recentExpensesTotal, count: recentExpensesCount });

    // --- Pending Tasks Count ---
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    let currentPendingTasks = 0;
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks) as Task[];
        currentPendingTasks = parsedTasks.filter(task => !task.isCompleted).length;
      } catch (e) { console.error("Error parsing tasks for dashboard", e); }
    }
    setPendingTasksCount(currentPendingTasks);

  }, [logEntries, salesPeriod]); // Re-run when logEntries change (data might have updated) or salesPeriod changes


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
          value={pendingTasksCount.toString()}
          description={pendingTasksCount === 1 ? "Awaiting completion" : "Awaiting completion"}
          icon={ListChecks}
          iconClassName="text-yellow-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Sales Overview</CardTitle>
              <Tabs defaultValue="daily" onValueChange={(value) => setSalesPeriod(value as SalesPeriod)}>
                <TabsList>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="annually">Annually</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription>
              {salesPeriod === "daily" && "Sales trend for the last 30 days."}
              {salesPeriod === "weekly" && "Sales trend for the last 12 weeks."}
              {salesPeriod === "monthly" && "Sales trend for the last 12 months."}
              {salesPeriod === "annually" && "Sales trend for the last 5 years."}
              {" (Data from localStorage)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart salesDataForChart={salesChartData} />
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and entries from your current session (persisted).</CardDescription>
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
                          {activity.details} - {format(new Date(activity.timestamp), "MMM dd, hh:mm a")}
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

      <Separator className="my-8" />

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center">
          <FileText className="mr-3 h-6 w-6" /> Detailed Reports &amp; Logs
        </h2>
        <p className="mt-1 text-muted-foreground">
          View and generate various reports for your business. Data is from localStorage.
        </p>
      </div>
      <ReportsClient />
    </>
  );
}

    