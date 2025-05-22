
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import format from "date-fns/format";
import type { ServiceRecord } from "@/types";
import { useEffect } from "react";

const serviceRecordSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  contactNo: z.string().min(1, "Contact number is required"),
  bikeModel: z.string().min(1, "Bike model is required"),
  bikeNo: z.string().min(1, "Bike number is required"),
  serviceDetails: z.string().min(1, "Service details are required"),
  serviceCount: z.coerce.number().min(1, "Service count must be at least 1"),
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
  date: z.date({ required_error: "Service date is required" }),
});

type ServiceRecordFormData = z.infer<typeof serviceRecordSchema>;

interface ServiceRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceRecord) => void;
  defaultValues?: Partial<ServiceRecord>;
  isEditing?: boolean;
}

export function ServiceRecordDialog({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isEditing = false,
}: ServiceRecordDialogProps) {
  const form = useForm<ServiceRecordFormData>({
    resolver: zodResolver(serviceRecordSchema),
    defaultValues: {
      date: defaultValues?.date ? new Date(defaultValues.date) : undefined, // Initialize undefined for new
      customerName: defaultValues?.customerName || "",
      contactNo: defaultValues?.contactNo || "",
      bikeModel: defaultValues?.bikeModel || "",
      bikeNo: defaultValues?.bikeNo || "",
      serviceDetails: defaultValues?.serviceDetails || "",
      serviceCount: defaultValues?.serviceCount || 1,
      cost: defaultValues?.cost || 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && defaultValues) {
        form.reset({
          ...defaultValues,
          date: defaultValues.date ? new Date(defaultValues.date) : new Date(),
          serviceCount: defaultValues.serviceCount || 1,
          cost: defaultValues.cost || 0,
        });
      } else if (!isEditing) {
        form.reset({
          date: new Date(), // Set current date client-side for new record
          customerName: "",
          contactNo: "",
          bikeModel: "",
          bikeNo: "",
          serviceDetails: "",
          serviceCount: 1,
          cost: 0,
        });
      }
    }
  }, [isOpen, isEditing, defaultValues, form]);

  const handleFormSubmit = (data: ServiceRecordFormData) => {
    onSubmit({ ...data, id: defaultValues?.id || crypto.randomUUID() });
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Service Record" : "Add New Service Record"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of the service record." : "Enter the details for the new service record."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Service Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "yyyy-MM-dd")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 555-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bikeModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bike Model</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mountain Pro X" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bikeNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bike Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., XYZ 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Details</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the service provided..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="serviceCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. of Services</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost (NRs.)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Save Changes" : "Add Record"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
