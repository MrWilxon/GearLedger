
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import type { StockItem } from "@/types";
import { mockStockItems } from "@/lib/mockData";
import { StockItemDialog } from "./StockItemDialog";
import { StockItemTable } from "./StockItemTable";
import { useToast } from "@/hooks/use-toast";
import { useLog } from '@/contexts/LogContext';

export default function StockItemsClient() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | undefined>(undefined);
  const { toast } = useToast();
  const { addLogEntry } = useLog();

  useEffect(() => {
    setItems(mockStockItems);
  }, []);

  const handleFormSubmit = (data: StockItem) => { // data includes id
    if (editingItem) {
      setItems(items.map(item => item.id === data.id ? data : item));
      toast({ title: "Stock Item Updated", description: `${data.name} has been updated.` });
      addLogEntry({
        action: "Updated Stock Item",
        details: `ID: ${data.id}, Name: ${data.name}, Qty: ${data.quantityInStock}, Price: NRs. ${data.price.toFixed(2)}, Category: ${data.category || 'N/A'}`,
      });
    } else {
      setItems([data, ...items]); // data has new id from dialog
      toast({ title: "Stock Item Added", description: `${data.name} has been added to stock.` });
      addLogEntry({
        action: "Added Stock Item",
        details: `ID: ${data.id}, Name: ${data.name}, Qty: ${data.quantityInStock}, Price: NRs. ${data.price.toFixed(2)}, Category: ${data.category || 'N/A'}`,
      });
    }
    setEditingItem(undefined);
  };

  const openDialogForEdit = (item: StockItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };
  
  const openDialogForNew = () => {
    setEditingItem(undefined);
    setIsDialogOpen(true);
  }

  const handleDeleteItem = (id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    if (window.confirm("Are you sure you want to delete this stock item?")) {
      setItems(items.filter(item => item.id !== id));
      toast({ title: "Stock Item Deleted", description: "The item has been removed from stock.", variant: "destructive" });
      if (itemToDelete) {
        addLogEntry({
          action: "Deleted Stock Item",
          details: `ID: ${itemToDelete.id}, Name: ${itemToDelete.name}, Price: NRs. ${itemToDelete.price.toFixed(2)}`,
        });
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Stock Management"
        description="Track and manage your parts and gears inventory."
        actions={
          <Button onClick={openDialogForNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        }
      />
      <StockItemTable data={items} onEdit={openDialogForEdit} onDelete={handleDeleteItem} />
      {isDialogOpen && (
        <StockItemDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleFormSubmit}
          defaultValues={editingItem}
          isEditing={!!editingItem}
        />
      )}
    </>
  );
}
