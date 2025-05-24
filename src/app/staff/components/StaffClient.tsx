
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import type { StaffMember } from "@/types";
import { StaffDialog } from "./StaffDialog";
import { StaffTable } from "./StaffTable";
import { useToast } from "@/hooks/use-toast";
import { useLog } from '@/contexts/LogContext';
import { format } from "date-fns";

const STAFF_STORAGE_KEY = "gearledger_staff";

export default function StaffClient() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | undefined>(undefined);
  const { toast } = useToast();
  const { addLogEntry } = useLog();

  useEffect(() => {
    const storedStaff = localStorage.getItem(STAFF_STORAGE_KEY);
    if (storedStaff) {
      try {
        const parsedStaff = JSON.parse(storedStaff) as StaffMember[];
        setStaffList(parsedStaff.map(staff => ({ ...staff, joiningDate: new Date(staff.joiningDate) })));
      } catch (error) {
        console.error("Failed to parse staff data from localStorage", error);
        setStaffList([]);
      }
    } else {
      setStaffList([]);
    }
  }, []);

  useEffect(() => {
    if (staffList.length > 0 || localStorage.getItem(STAFF_STORAGE_KEY)) {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffList));
    }
  }, [staffList]);

  const handleFormSubmit = (data: StaffMember) => {
    let updatedStaffList;
    if (editingStaff) {
      updatedStaffList = staffList.map(s => s.id === data.id ? data : s);
      setStaffList(updatedStaffList);
      toast({ title: "Staff Member Updated", description: `${data.name}'s details have been updated.` });
      addLogEntry({
        action: "Updated Staff Member",
        details: `ID: ${data.id}, Name: ${data.name}, Desig: ${data.designation}, Salary: NRs. ${data.salary.toFixed(2)}`,
      });
    } else {
      const newStaffWithDate = { ...data, joiningDate: new Date(data.joiningDate) };
      updatedStaffList = [newStaffWithDate, ...staffList];
      setStaffList(updatedStaffList);
      toast({ title: "Staff Member Added", description: `${data.name} has been added to the team.` });
      addLogEntry({
        action: "Added Staff Member",
        details: `ID: ${data.id}, Name: ${data.name}, Desig: ${data.designation}, Joined: ${format(newStaffWithDate.joiningDate, "yyyy-MM-dd")}, Salary: NRs. ${data.salary.toFixed(2)}`,
      });
    }
    setEditingStaff(undefined);
  };

  const openDialogForEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setIsDialogOpen(true);
  };

  const openDialogForNew = () => {
    setEditingStaff(undefined);
    setIsDialogOpen(true);
  }

  const handleDeleteStaff = (id: string) => {
    const staffToDelete = staffList.find(s => s.id === id);
    if (window.confirm("Are you sure you want to remove this staff member?")) {
      setStaffList(staffList.filter(s => s.id !== id));
      toast({ title: "Staff Member Removed", description: "The staff member has been removed.", variant: "destructive" });
      if (staffToDelete) {
        addLogEntry({
          action: "Deleted Staff Member",
          details: `ID: ${staffToDelete.id}, Name: ${staffToDelete.name}, Desig: ${staffToDelete.designation}`,
        });
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Staff Management"
        description="Manage your team members' details."
        actions={
          <Button onClick={openDialogForNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Staff
          </Button>
        }
      />
      <StaffTable data={staffList} onEdit={openDialogForEdit} onDelete={handleDeleteStaff} />
      {isDialogOpen && (
        <StaffDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleFormSubmit}
          defaultValues={editingStaff}
          isEditing={!!editingStaff}
        />
      )}
    </>
  );
}

    