"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import type { Expense } from "@/types";
import { mockExpenses } from "@/lib/mockData";
import { ExpenseDialog } from "./ExpenseDialog";
import { ExpenseTable } from "./ExpenseTable";
import { useToast } from "@/hooks/use-toast";

export default function ExpensesClient() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    setExpenses(mockExpenses);
  }, []);

  const handleFormSubmit = (data: Expense) => {
    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === data.id ? data : e));
      toast({ title: "Expense Updated", description: `Expense for ${data.description} has been updated.` });
    } else {
      setExpenses([data, ...expenses]);
      toast({ title: "Expense Added", description: `New expense for ${data.description} recorded.` });
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
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setExpenses(expenses.filter(e => e.id !== id));
      toast({ title: "Expense Deleted", description: "The expense record has been removed.", variant: "destructive" });
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
