
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import type { Expense } from "@/types";
// import { mockExpenses } from "@/lib/mockData"; // No longer using mock data directly
import { ExpenseDialog } from "./ExpenseDialog";
import { ExpenseTable } from "./ExpenseTable";
import { useToast } from "@/hooks/use-toast";
import { useLog } from '@/contexts/LogContext';

const EXPENSES_STORAGE_KEY = "gearledger_expenses";

export default function ExpensesClient() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const { toast } = useToast();
  const { addLogEntry } = useLog();

  useEffect(() => {
    const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (storedExpenses) {
      try {
        const parsedExpenses = JSON.parse(storedExpenses) as Expense[];
        // Convert date strings back to Date objects
        setExpenses(parsedExpenses.map(exp => ({ ...exp, date: new Date(exp.date) })));
      } catch (error) {
        console.error("Failed to parse expenses from localStorage", error);
        setExpenses([]); // Fallback to empty if parsing fails
      }
    } else {
      setExpenses([]); // Initialize with empty array if nothing in storage
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever expenses change, unless it's the initial empty load
    if (expenses.length > 0 || localStorage.getItem(EXPENSES_STORAGE_KEY)) {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses]);

  const handleFormSubmit = (data: Expense) => { // data is of type Expense, includes id
    let updatedExpenses;
    if (editingExpense) {
      updatedExpenses = expenses.map(e => e.id === data.id ? data : e);
      setExpenses(updatedExpenses);
      toast({ title: "Expense Updated", description: `Expense for ${data.description} has been updated.` });
      addLogEntry({
        action: "Updated Expense",
        details: `ID: ${data.id}, Desc: ${data.description}, Amount: NRs. ${data.amount.toFixed(2)}, Category: ${data.category}`,
      });
    } else {
      const newExpenseWithDate = { ...data, date: new Date(data.date) }; // Ensure date is a Date object
      updatedExpenses = [newExpenseWithDate, ...expenses];
      setExpenses(updatedExpenses); 
      toast({ title: "Expense Added", description: `New expense for ${data.description} recorded.` });
      addLogEntry({
        action: "Added Expense",
        details: `ID: ${data.id}, Desc: ${data.description}, Amount: NRs. ${data.amount.toFixed(2)}, Category: ${data.category}`,
      });
    }
    setEditingExpense(undefined);
  };
  
  const openDialogForEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const openDialogForNew = () => {
    setEditingExpense(undefined);
    setIsDialogOpen(true);
  }

  const handleDeleteExpense = (id: string) => {
    const expenseToDelete = expenses.find(e => e.id === id);
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setExpenses(expenses.filter(e => e.id !== id));
      toast({ title: "Expense Deleted", description: "The expense record has been removed.", variant: "destructive" });
      if (expenseToDelete) {
        addLogEntry({
          action: "Deleted Expense",
          details: `ID: ${expenseToDelete.id}, Desc: ${expenseToDelete.description}, Amount: NRs. ${expenseToDelete.amount.toFixed(2)}, Category: ${expenseToDelete.category}`,
        });
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Expense Tracking"
        description="Manage all operational expenses."
        actions={
          <Button onClick={openDialogForNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Expense
          </Button>
        }
      />
      <ExpenseTable data={expenses} onEdit={openDialogForEdit} onDelete={handleDeleteExpense} />
      {isDialogOpen && (
        <ExpenseDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleFormSubmit}
          defaultValues={editingExpense}
          isEditing={!!editingExpense}
        />
      )}
    </>
  );
}
