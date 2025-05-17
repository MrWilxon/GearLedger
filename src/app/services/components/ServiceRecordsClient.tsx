
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import type { ServiceRecord } from "@/types";
// import { mockServiceRecords } from "@/lib/mockData"; // No longer using mock data
import { ServiceRecordDialog } from "./ServiceRecordDialog";
import { ServiceRecordTable } from "./ServiceRecordTable";
import { useToast } from "@/hooks/use-toast";
import { useLog } from '@/contexts/LogContext';
import { format } from "date-fns";

const SERVICE_RECORDS_STORAGE_KEY = "gearledger_service_records";

export default function ServiceRecordsClient() {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | undefined>(undefined);
  const { toast } = useToast();
  const { addLogEntry } = useLog();

  useEffect(() => {
    const storedRecords = localStorage.getItem(SERVICE_RECORDS_STORAGE_KEY);
    if (storedRecords) {
      try {
        const parsedRecords = JSON.parse(storedRecords) as ServiceRecord[];
        setRecords(parsedRecords.map(rec => ({ ...rec, date: new Date(rec.date) })));
      } catch (error) {
        console.error("Failed to parse service records from localStorage", error);
        setRecords([]);
      }
    } else {
      setRecords([]);
    }
  }, []);

  useEffect(() => {
    if (records.length > 0 || localStorage.getItem(SERVICE_RECORDS_STORAGE_KEY)) {
      localStorage.setItem(SERVICE_RECORDS_STORAGE_KEY, JSON.stringify(records));
    }
  }, [records]);

  const handleAddService = (data: ServiceRecord) => { 
    let updatedRecords;
    if (editingRecord) {
      updatedRecords = records.map(r => r.id === data.id ? data : r);
      setRecords(updatedRecords);
      toast({ title: "Service Record Updated", description: `Record for ${data.customerName} has been updated.` });
      addLogEntry({
        action: "Updated Service Record",
        details: `ID: ${data.id}, Cust: ${data.customerName}, Bike: ${data.bikeModel} (${data.bikeNo}), Cost: NRs. ${data.cost.toFixed(2)}`,
      });
    } else {
      const newRecordWithDate = { ...data, date: new Date(data.date) };
      updatedRecords = [newRecordWithDate, ...records];
      setRecords(updatedRecords);
      toast({ title: "Service Record Added", description: `New record for ${data.customerName} created.` });
      addLogEntry({
        action: "Added Service Record",
        details: `ID: ${data.id}, Cust: ${data.customerName}, Bike: ${data.bikeModel} (${data.bikeNo}), Date: ${format(newRecordWithDate.date, "yyyy-MM-dd")}, Cost: NRs. ${data.cost.toFixed(2)}`,
      });
    }
    setEditingRecord(undefined);
  };

  const openDialogForEdit = (record: ServiceRecord) => {
    setEditingRecord(record);
    setIsDialogOpen(true);
  };

  const openDialogForNew = () => {
    setEditingRecord(undefined);
    setIsDialogOpen(true);
  }

  const handleDeleteService = (id: string) => {
    const recordToDelete = records.find(r => r.id === id);
    if (window.confirm("Are you sure you want to delete this record?")) {
      setRecords(records.filter(r => r.id !== id));
      toast({ title: "Service Record Deleted", description: "The record has been removed.", variant: "destructive" });
      if (recordToDelete) {
        addLogEntry({
          action: "Deleted Service Record",
          details: `ID: ${recordToDelete.id}, Cust: ${recordToDelete.customerName}, Bike: ${recordToDelete.bikeModel} (${recordToDelete.bikeNo}), Cost: NRs. ${recordToDelete.cost.toFixed(2)}`,
        });
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Service Records"
        description="Manage all bike service entries."
        actions={
          <Button onClick={openDialogForNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
          </Button>
        }
      />
      <ServiceRecordTable data={records} onEdit={openDialogForEdit} onDelete={handleDeleteService} />
      {isDialogOpen && (
         <ServiceRecordDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSubmit={handleAddService}
            defaultValues={editingRecord}
            isEditing={!!editingRecord}
        />
      )}
    </>
  );
}
