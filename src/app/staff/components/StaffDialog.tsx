
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { StaffMember } from "@/types";
import { useEffect } from "react";

const staffMemberSchema = z.object({
  name: z.string().min(1, "Staff name is required"),
  designation: z.string().min(1, "Designation is required"),
  joiningDate: z.date({ required_error: "Joining date is required" }),
  salary: z.coerce.number().min(0, "Salary cannot be negative"),
  advanceSalary: z.coerce.number().min(0, "Advance salary cannot be negative").optional(),
  contactNo: z.string().optional(),
  address: z.string().optional(),
});

type StaffFormData = z.infer<typeof staffMemberSchema>;

interface StaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StaffMember) => void;
  defaultValues?: Partial<StaffMember>;
  isEditing?: boolean;
}

export function StaffDialog({ isOpen, onClose, onSubmit, defaultValues, isEditing = false }: StaffDialogProps) {
  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffMemberSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      designation: defaultValues?.designation || "",
      joiningDate: defaultValues?.joiningDate ? new Date(defaultValues.joiningDate) : undefined, // Initialize undefined for new
      salary: defaultValues?.salary || 0,
      advanceSalary: defaultValues?.advanceSalary || 0,
      contactNo: defaultValues?.contactNo || "",
      address: defaultValues?.address || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && defaultValues) {
        form.reset({
          ...defaultValues,
          joiningDate: defaultValues.joiningDate ? new Date(defaultValues.joiningDate) : new Date(),
          salary: defaultValues.salary || 0,
          advanceSalary: defaultValues.advanceSalary || 0,
        });
      } else if (!isEditing) {
        form.reset({
          name: "",
          designation: "",
          joiningDate: new Date(), // Set current date client-side for new staff
          salary: 0,
          advanceSalary: 0,
          contactNo: "",
          address: "",
        });
      }
    }
  }, [isOpen, isEditing, defaultValues, form]);


  const handleFormSubmit = (data: StaffFormData) => {
    onSubmit({ ...data, id: defaultValues?.id || crypto.randomUUID(), advanceSalary: data.advanceSalary || 0 });
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
          <DialogDescription>{isEditing ? "Update staff details." : "Add a new member to your team."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem><FormLabel>Designation</FormLabel><FormControl><Input placeholder="e.g., Lead Mechanic" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="joiningDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Joining Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "yyyy-MM-dd") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem><FormLabel>Salary (NRs.)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="advanceSalary"
                render={({ field }) => (
                  <FormItem><FormLabel>Advance Salary (NRs.)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="contactNo"
              render={({ field }) => (
                <FormItem><FormLabel>Contact No. (Optional)</FormLabel><FormControl><Input placeholder="e.g., 555-0000" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem><FormLabel>Address (Optional)</FormLabel><FormControl><Input placeholder="e.g., 123 Bike St" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{isEditing ? "Save Changes" : "Add Staff"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    