
import { PageHeader } from "@/components/PageHeader";
import { DashboardSummaryCard } from "@/components/dashboard/DashboardSummaryCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { mockDailySales, mockStockValue, mockRecentExpenses } from "@/lib/mockData";
import { DollarSign, Boxes, Receipt, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back! Here's an overview of your showroom." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <DashboardSummaryCard
          title="Today's Sales"
          value={`NRs. ${mockDailySales.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description={`${mockDailySales.count} services`}
          icon={DollarSign}
          iconClassName="text-green-500"
        />
        <DashboardSummaryCard
          title="Total Stock Value"
          value={`NRs. ${mockStockValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Boxes}
          iconClassName="text-blue-500"
        />
        <DashboardSummaryCard
          title="Recent Expenses"
          value={`NRs. ${mockRecentExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description={`${mockRecentExpenses.length} recent transactions`}
          icon={Receipt}
          iconClassName="text-orange-500"
        />
         <DashboardSummaryCard
          title="Pending Tasks"
          value="3"
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
            <CardDescription>Latest updates and entries.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[260px]">
              <div className="space-y-4">
                {[
                  { user: "John Doe", action: "added new stock item 'Helmet V2'", time: "2 min ago" },
                  { user: "Jane Smith", action: "completed service SRV003", time: "1 hour ago" },
                  { user: "Admin", action: "recorded new expense 'Office Supplies'", time: "3 hours ago" },
                  { user: "John Doe", action: "updated stock for 'MTB Tire 29'", time: "5 hours ago" },
                  { user: "System", action: "generated weekly sales report", time: "Yesterday" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.user} <span className="font-normal text-muted-foreground">{activity.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
