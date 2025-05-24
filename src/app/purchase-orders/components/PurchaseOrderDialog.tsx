
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { PurchaseOrder, PurchaseOrderItem } from "@/types";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const purchaseOrderItemSchema = z.object({
  id: z.string().optional(), // For existing items, will be populated client-side for new
  productName: z.string().min(1, "Product name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
  totalPrice: z.coerce.number().min(0),
});

const purchaseOrderSchema = z.object({
  poNumber: z.string().min(1, "PO Number is required"),
  supplier: z.string().min(1, "Supplier is required"),
  orderDate: z.date({ required_error: "Order date is required" }),
  expectedDeliveryDate: z.date().optional(),
  items: z.array(purchaseOrderItemSchema).min(1, "At least one item is required"),
  status: z.enum(["Pending", "Ordered", "Shipped", "Received", "Cancelled"]),
  notes: z.string().optional(),
  totalAmount: z.coerce.number().min(0),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PurchaseOrder) => void;
  defaultValues?: Partial<PurchaseOrder>;
  isEditing?: boolean;
}

const PO_STATUSES: PurchaseOrder["status"][] = ["Pending", "Ordered", "Shipped", "Received", "Cancelled"];

export function PurchaseOrderDialog({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isEditing = false,
}: PurchaseOrderDialogProps) {
  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      poNumber: defaultValues?.poNumber || "",
      supplier: defaultValues?.supplier || "",
      orderDate: defaultValues?.orderDate ? new Date(defaultValues.orderDate) : undefined, // Set in useEffect for new
      expectedDeliveryDate: defaultValues?.expectedDeliveryDate ? new Date(defaultValues.expectedDeliveryDate) : undefined,
      // Avoid crypto.randomUUID() here for initial values to prevent hydration mismatch
      items: defaultValues?.items?.map(item => ({
        ...item,
        // id will be ensured in useEffect or by useFieldArray's append
      })) || [],
      status: defaultValues?.status || "Pending",
      notes: defaultValues?.notes || "",
      totalAmount: defaultValues?.totalAmount || 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedTotalAmount = form.watch("totalAmount");

  useEffect(() => {
    if (isOpen) {
      const processedDefaultItems = defaultValues?.items?.map(item => ({
        ...item,
        id: item.id || crypto.randomUUID(), // Generate ID here, client-side
        totalPrice: (item.quantity || 0) * (item.unitPrice || 0)
      })) || [];

      form.reset({
        poNumber: defaultValues?.poNumber || "",
        supplier: defaultValues?.supplier || "",
        orderDate: defaultValues?.orderDate ? new Date(defaultValues.orderDate) : new Date(),
        expectedDeliveryDate: defaultValues?.expectedDeliveryDate ? new Date(defaultValues.expectedDeliveryDate) : undefined,
        items: processedDefaultItems,
        status: defaultValues?.status || "Pending",
        notes: defaultValues?.notes || "",
        totalAmount: defaultValues?.totalAmount || 0,
      });

      if (!isEditing && processedDefaultItems.length === 0) {
        append({ productName: "", quantity: 1, unitPrice: 0, totalPrice: 0, id: crypto.randomUUID() });
      }
    }
  }, [isOpen, isEditing, defaultValues, form, append]);


  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith("items") && type === "change") {
        const items = form.getValues("items");
        let currentTotal = 0;
        items.forEach((item, index) => {
          const quantity = Number(item.quantity) || 0;
          const unitPrice = Number(item.unitPrice) || 0;
          const itemTotal = quantity * unitPrice;
          if (form.getValues(`items.${index}.totalPrice`) !== itemTotal) {
            form.setValue(`items.${index}.totalPrice`, itemTotal, { shouldValidate: true });
          }
          currentTotal += itemTotal;
        });
        if (form.getValues("totalAmount") !== currentTotal) {
          form.setValue("totalAmount", currentTotal, { shouldValidate: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);


  const handleFormSubmit = (data: PurchaseOrderFormData) => {
    onSubmit({ ...data, id: defaultValues?.id || crypto.randomUUID() });
    // form.reset(); // Reset is handled by dialog close or next open
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); form.reset(); } }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Purchase Order" : "Create New Purchase Order"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of the purchase order." : "Enter details for the new purchase order."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="poNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Number</FormLabel>
                      <FormControl><Input placeholder="e.g., PO-2023-001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl><Input placeholder="Supplier Name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="orderDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Order Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(new Date(field.value), "yyyy-MM-dd") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value ? new Date(field.value): undefined} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedDeliveryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected Delivery Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(new Date(field.value), "yyyy-MM-dd") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value ? new Date(field.value): undefined} onSelect={field.onChange} disabled={(date) => date < (form.getValues("orderDate") || new Date())} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {PO_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <FormLabel>Order Items</FormLabel>
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-end gap-2 p-3 border rounded-md">
                    <FormField
                      control={form.control}
                      name={`items.${index}.productName`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormLabel className="text-xs">Product Name</FormLabel>
                          <FormControl><Input placeholder="Product Name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel className="text-xs">Qty</FormLabel>
                          <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <FormLabel className="text-xs">Unit Price (NRs.)</FormLabel>
                          <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem className="w-32">
                      <FormLabel className="text-xs">Item Total (NRs.)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          value={(form.getValues(`items.${index}.quantity`) * form.getValues(`items.${index}.unitPrice`)).toFixed(2)}
                          readOnly
                          className="bg-muted"
                        />
                      </FormControl>
                    </FormItem>
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ productName: "", quantity: 1, unitPrice: 0, totalPrice: 0, id: crypto.randomUUID() })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
                {form.formState.errors.items && typeof form.formState.errors.items === 'object' && !Array.isArray(form.formState.errors.items) && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>
                )}
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Any additional notes for this order..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-right font-semibold text-lg">
                Total Order Amount: NRs. {(watchedTotalAmount || 0).toFixed(2)}
              </div>
              {/* Hidden input for totalAmount is still useful if schema requires it directly, but display uses watched value */}
              <FormField control={form.control} name="totalAmount" render={({ field }) => <Input type="hidden" {...field} value={watchedTotalAmount || 0} />} />


              <DialogFooter className="sticky bottom-0 bg-background py-4 border-t -mx-6 px-6"> {/* Adjust padding for full width */}
                <Button type="button" variant="outline" onClick={() => { onClose(); form.reset(); }}>Cancel</Button>
                <Button type="submit">{isEditing ? "Save Changes" : "Create Purchase Order"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    