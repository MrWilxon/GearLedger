
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import type { PurchaseOrder } from "@/types";
import { PurchaseOrderDialog } from "./PurchaseOrderDialog";
import { PurchaseOrderTable } from "./PurchaseOrderTable";
import { useToast } from "@/hooks/use-toast";
import { useLog } from '@/contexts/LogContext';
import { format } from "date-fns";

const PURCHASE_ORDERS_STORAGE_KEY = "gearledger_purchase_orders";

export default function PurchaseOrdersClient() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | undefined>(undefined);
  const { toast } = useToast();
  const { addLogEntry } = useLog();

  useEffect(() => {
    const storedPOs = localStorage.getItem(PURCHASE_ORDERS_STORAGE_KEY);
    if (storedPOs) {
      try {
        const parsedPOs = JSON.parse(storedPOs) as PurchaseOrder[];
        // Ensure dates are converted back to Date objects
        setPurchaseOrders(parsedPOs.map(po => ({
          ...po,
          orderDate: new Date(po.orderDate),
          expectedDeliveryDate: po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate) : undefined,
        })));
      } catch (error) {
        console.error("Failed to parse purchase orders from localStorage", error);
        setPurchaseOrders([]);
      }
    } else {
      setPurchaseOrders([]);
    }
  }, []);

  useEffect(() => {
    if (purchaseOrders.length > 0 || localStorage.getItem(PURCHASE_ORDERS_STORAGE_KEY)) {
      localStorage.setItem(PURCHASE_ORDERS_STORAGE_KEY, JSON.stringify(purchaseOrders));
    }
  }, [purchaseOrders]);

  const handleFormSubmit = (data: PurchaseOrder) => {
    let updatedPOs;
    const poDataWithDates = {
      ...data,
      orderDate: new Date(data.orderDate),
      expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : undefined,
    };

    if (editingPO) {
      updatedPOs = purchaseOrders.map(po => po.id === poDataWithDates.id ? poDataWithDates : po);
      setPurchaseOrders(updatedPOs);
      toast({ title: "Purchase Order Updated", description: `PO #${poDataWithDates.poNumber} has been updated.` });
      addLogEntry({
        action: "Updated Purchase Order",
        details: `ID: ${poDataWithDates.id}, PO#: ${poDataWithDates.poNumber}, Supplier: ${poDataWithDates.supplier}, Total: NRs. ${poDataWithDates.totalAmount.toFixed(2)}`,
      });
    } else {
      updatedPOs = [poDataWithDates, ...purchaseOrders];
      setPurchaseOrders(updatedPOs);
      toast({ title: "Purchase Order Created", description: `New PO #${poDataWithDates.poNumber} for ${poDataWithDates.supplier} created.` });
      addLogEntry({
        action: "Created Purchase Order",
        details: `ID: ${poDataWithDates.id}, PO#: ${poDataWithDates.poNumber}, Supplier: ${poDataWithDates.supplier}, Date: ${format(poDataWithDates.orderDate, "yyyy-MM-dd")}, Total: NRs. ${poDataWithDates.totalAmount.toFixed(2)}`,
      });
    }
    setEditingPO(undefined);
  };

  const openDialogForEdit = (po: PurchaseOrder) => {
    setEditingPO(po);
    setIsDialogOpen(true);
  };

  const openDialogForNew = () => {
    setEditingPO(undefined);
    setIsDialogOpen(true);
  };

  const handleDeletePO = (id: string) => {
    const poToDelete = purchaseOrders.find(po => po.id === id);
    if (window.confirm("Are you sure you want to delete this purchase order?")) {
      setPurchaseOrders(purchaseOrders.filter(po => po.id !== id));
      toast({ title: "Purchase Order Deleted", description: "The purchase order has been removed.", variant: "destructive" });
      if (poToDelete) {
        addLogEntry({
          action: "Deleted Purchase Order",
          details: `ID: ${poToDelete.id}, PO#: ${poToDelete.poNumber}, Supplier: ${poToDelete.supplier}`,
        });
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Purchase Orders"
        description="Manage orders placed with your suppliers."
        actions={
          <Button onClick={openDialogForNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New PO
          </Button>
        }
      />
      <PurchaseOrderTable data={purchaseOrders} onEdit={openDialogForEdit} onDelete={handleDeletePO} />
      {isDialogOpen && (
        <PurchaseOrderDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleFormSubmit}
          defaultValues={editingPO}
          isEditing={!!editingPO}
        />
      )}
    </>
  );
}

    