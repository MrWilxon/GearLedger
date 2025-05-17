
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Download } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import type { DateRange } from "react-day-picker";
import { useLog, type LogEntryType } from '@/contexts/LogContext';
import { format } from 'date-fns';

const ReportPlaceholder = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>Data for the selected period will be displayed here.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex h-60 items-center justify-center rounded-md border border-dashed">
        <p className="text-muted-foreground">No data to display for this report yet.</p>
      </div>
    </CardContent>
    <CardFooter className="justify-end">
      <Button variant="outline"><Download className="mr-2 h-4 w-4" />Download Report</Button>
    </CardFooter>
  </Card>
);

export default function ReportsClient() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { logEntries } = useLog();

  return (
    <>
      <PageHeader
        title="Reports & Logs"
        description="View and generate various reports for your business."
        actions={
          <div className="flex items-center gap-2">
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print Page</Button>
          </div>
        }
      />
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="stock">Stock Usage</TabsTrigger>
          <TabsTrigger value="finance">Income & Expense</TabsTrigger>
          <TabsTrigger value="logs">Entry/Edit Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <ReportPlaceholder title="Sales Report" />
        </TabsContent>
        <TabsContent value="stock">
           <ReportPlaceholder title="Stock Usage Report" />
        </TabsContent>
        <TabsContent value="finance">
           <ReportPlaceholder title="Income & Expense Report" />
        </TabsContent>
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Entry & Edit Logs</CardTitle>
              <CardDescription>Chronological record of data entries and modifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto">
                {logEntries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No log entries yet.</p>
                ) : (
                  logEntries.map((entry: LogEntryType) => (
                    <div key={entry.id} className="py-2 border-b last:border-b-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(entry.timestamp, "yyyy-MM-dd hh:mm a")}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">User: {entry.user}</p>
                      {entry.details && <p className="text-xs text-muted-foreground mt-1">Details: {entry.details}</p>}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
