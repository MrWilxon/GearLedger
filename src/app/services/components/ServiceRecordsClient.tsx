"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import type { ServiceRecord } from "@/types";
import { mockServiceRecords } from "@/lib/mockData";
import { ServiceRecordDialog } from "./ServiceRecordDialog";
import { ServiceRecordTable } from "./ServiceRecordTable";
import { useToast } from "@/hooks/use-toast";

export default function ServiceRecordsClient() {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data
    setRecords(mockServiceRecords);
  }, []);

  const handleAddService = (data: ServiceRecord) => {
    if (editingRecord) {
      setRecords(records.map(r => r.id === data.id ? data : r));
      toast({ title: "Service Record Updated", description: `Record for ${data.customerName} has been updated.` });
    } else {
      setRecords([data, ...records]);
      toast({ title: "Service Record Added", description: `New record for ${data.customerName} created.` });
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
    // Basic confirmation, ideally use AlertDialog
    if (window.confirm("Are you sure you want to delete this record?")) {
      setRecords(records.filter(r => r.id !== id));
      toast({ title: "Service Record Deleted", description: "The record has been removed.", variant: "destructive" });
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
