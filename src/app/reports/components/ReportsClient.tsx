
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Download } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import type { DateRange } from "react-day-picker";
import { useLog, type LogEntryType } from '@/contexts/LogContext';
import { format, isWithinInterval } from 'date-fns';
import type { ServiceRecord, Expense, StockItem } from "@/types";

// localStorage keys (must match those in client components)
const SERVICE_RECORDS_STORAGE_KEY = "gearledger_service_records";
const EXPENSES_STORAGE_KEY = "gearledger_expenses";
const STOCK_ITEMS_STORAGE_KEY = "gearledger_stock_items";


const ReportPlaceholder = ({ title, message = "No data to display for the selected period." }: { title: string; message?: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>Data for the selected period will be displayed here.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex h-60 items-center justify-center rounded-md border border-dashed">
        <p className="text-muted-foreground">{message}</p>
      </div>
    </CardContent>
    <CardFooter className="justify-end">
      <Button variant="outline" disabled><Download className="mr-2 h-4 w-4" />Download Report</Button>
    </CardFooter>
  </Card>
);

export default function ReportsClient() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { logEntries } = useLog();

  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  useEffect(() => {
    const loadData = () => {
      const storedServiceRecords = localStorage.getItem(SERVICE_RECORDS_STORAGE_KEY);
      if (storedServiceRecords) {
        try {
          const parsed = JSON.parse(storedServiceRecords) as ServiceRecord[];
          setServiceRecords(parsed.map(rec => ({ ...rec, date: new Date(rec.date) })));
        } catch (e) { console.error("Error parsing service records for reports", e); setServiceRecords([]); }
      } else {
        setServiceRecords([]);
      }

      const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
      if (storedExpenses) {
        try {
          const parsed = JSON.parse(storedExpenses) as Expense[];
          setExpenses(parsed.map(exp => ({ ...exp, date: new Date(exp.date) })));
        } catch (e) { console.error("Error parsing expenses for reports", e); setExpenses([]); }
      } else {
        setExpenses([]);
      }

      const storedStock = localStorage.getItem(STOCK_ITEMS_STORAGE_KEY);
      if (storedStock) {
        try {
          setStockItems(JSON.parse(storedStock) as StockItem[]);
        } catch (e) { console.error("Error parsing stock items for reports", e); setStockItems([]); }
      } else {
        setStockItems([]);
      }
    };

    loadData();
    // Re-fetch data if logEntries change, as this indicates underlying data might have been modified.
    // Also re-fetch if dateRange changes for filtering.
  }, [logEntries, dateRange]);

  const filteredServiceRecords = useMemo(() => {
    if (!dateRange?.from) return serviceRecords;
    const toDate = dateRange.to || dateRange.from;
    return serviceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return isWithinInterval(recordDate, { start: dateRange.from!, end: toDate });
    });
  }, [serviceRecords, dateRange]);

  const filteredExpenses = useMemo(() => {
    if (!dateRange?.from) return expenses;
    const toDate = dateRange.to || dateRange.from;
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return isWithinInterval(expenseDate, { start: dateRange.from!, end: toDate });
    });
  }, [expenses, dateRange]);

  const totalSales = useMemo(() =>
    filteredServiceRecords.reduce((sum, record) => sum + record.cost, 0),
    [filteredServiceRecords]
  );

  const totalExpenses = useMemo(() =>
    filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses]
  );

  const netProfitLoss = totalSales - totalExpenses;

  return (
    <>
      <div className="mb-6 flex flex-col gap-y-2 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex items-center gap-2">
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print Page</Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="stock">Stock Report</TabsTrigger>
          <TabsTrigger value="finance">Income &amp; Expense</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          {filteredServiceRecords.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Sales Report</CardTitle>
                <CardDescription>
                  {dateRange?.from ? `Sales from ${format(dateRange.from, "yyyy-MM-dd")} ${dateRange.to ? `to ${format(dateRange.to, "yyyy-MM-dd")}` : ''}` : "All Sales"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Bike Model</TableHead>
                      <TableHead className="text-right">Amount (NRs.)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServiceRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.date), "yyyy-MM-dd")}</TableCell>
                        <TableCell>{record.customerName}</TableCell>
                        <TableCell>{record.bikeModel}</TableCell>
                        <TableCell className="text-right">NRs. {record.cost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-end font-semibold">
                Total Sales: NRs. {totalSales.toFixed(2)}
              </CardFooter>
            </Card>
          ) : (
            <ReportPlaceholder title="Sales Report" />
          )}
        </TabsContent>

        <TabsContent value="stock">
          {stockItems.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Stock Report</CardTitle>
                <CardDescription>Overview of all items currently in stock. This report is not date-range filtered.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Price (NRs.)</TableHead>
                      <TableHead className="text-right">Total Value (NRs.)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category || "N/A"}</TableCell>
                        <TableCell className="text-center">{item.quantityInStock}</TableCell>
                        <TableCell className="text-right">NRs. {item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">NRs. {(item.price * item.quantityInStock).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-end font-semibold">
                Total Stock Value: NRs. {stockItems.reduce((sum, item) => sum + (item.price * item.quantityInStock), 0).toFixed(2)}
              </CardFooter>
            </Card>
          ) : (
            <ReportPlaceholder title="Stock Report" message="No stock items found." />
          )}
        </TabsContent>

        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle>Income &amp; Expense Report</CardTitle>
              <CardDescription>
                {dateRange?.from ? `Financial summary from ${format(dateRange.from, "yyyy-MM-dd")} ${dateRange.to ? `to ${format(dateRange.to, "yyyy-MM-dd")}` : ''}` : "Overall Financial Summary"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Income (Sales)</h3>
                {filteredServiceRecords.length > 0 ? (
                  <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Customer</TableHead><TableHead className="text-right">Amount (NRs.)</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredServiceRecords.map(record => (
                        <TableRow key={`income-${record.id}`}>
                          <TableCell>{format(new Date(record.date), "yyyy-MM-dd")}</TableCell>
                          <TableCell>{record.customerName}</TableCell>
                          <TableCell className="text-right">NRs. {record.cost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-muted-foreground">No income records for this period.</p>}
                <p className="text-right font-semibold mt-2">Total Income: NRs. {totalSales.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Expenses</h3>
                {filteredExpenses.length > 0 ? (
                  <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount (NRs.)</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredExpenses.map(expense => (
                        <TableRow key={`expense-${expense.id}`}>
                          <TableCell>{format(new Date(expense.date), "yyyy-MM-dd")}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell className="text-right">NRs. {expense.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-muted-foreground">No expense records for this period.</p>}
                <p className="text-right font-semibold mt-2">Total Expenses: NRs. {totalExpenses.toFixed(2)}</p>
              </div>
            </CardContent>
            <CardFooter className="justify-end font-bold text-lg">
              Net {netProfitLoss >= 0 ? "Profit" : "Loss"}: NRs. {Math.abs(netProfitLoss).toFixed(2)}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Chronological record of data entries and modifications. (Recent entries from your session are shown here.)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto">
                {logEntries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No log entries yet.</p>
                ) : (
                  logEntries.map((entry: LogEntryType) => (
                    <div key={entry.id} className="py-2 border-b last:border-b-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.timestamp), "yyyy-MM-dd hh:mm a")}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">User: {entry.user}</p>
                      {entry.details && <p className="text-xs text-muted-foreground mt-1">Details: {entry.details}</p>}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline" disabled><Download className="mr-2 h-4 w-4" />Download Logs</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

    