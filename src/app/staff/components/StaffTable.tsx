
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import type { StaffMember } from "@/types";
import { format } from "date-fns";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from "@tanstack/react-table";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";
import React from "react";
import { Input } from "@/components/ui/input";

interface StaffTableProps {
  data: StaffMember[];
  onEdit: (staff: StaffMember) => void;
  onDelete: (id: string) => void;
}

const currencyFormatter = (value: number) => `NRs. ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const columns: ColumnDef<StaffMember>[] = [
  {
    id: "select",
    header: ({ table }) => (<Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all"/>),
    cell: ({ row }) => (<Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row"/>),
    enableSorting: false, enableHiding: false,
  },
  { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Name" /> },
  { accessorKey: "designation", header: "Designation" },
  { accessorKey: "joiningDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Joining Date" />, cell: ({ row }) => format(new Date(row.getValue("joiningDate")), "yyyy-MM-dd") },
  { accessorKey: "salary", header: ({ column }) => <DataTableColumnHeader column={column} title="Salary (NRs.)" />, cell: ({ row }) => <div className="text-right">{currencyFormatter(row.getValue("salary"))}</div> },
  { accessorKey: "advanceSalary", header: ({ column }) => <DataTableColumnHeader column={column} title="Adv. Salary (NRs.)" />, cell: ({ row }) => <div className="text-right">{currencyFormatter(row.getValue("advanceSalary"))}</div>},
  { accessorKey: "contactNo", header: "Contact No." },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const staff = row.original;
      const { onEdit, onDelete } = (table.options.meta as StaffTableProps);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(staff)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(staff.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function StaffTable({ data, onEdit, onDelete }: StaffTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting, getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters, getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection, state: { sorting, columnFilters, rowSelection }, meta: { onEdit, onDelete }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Input placeholder="Filter by name..." value={(table.getColumn("name")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)} className="max-w-sm"/>
      </div>
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>{table.getHeaderGroups().map((headerGroup) => (<TableRow key={headerGroup.id}>{headerGroup.headers.map((header) => (<TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (table.getRowModel().rows.map((row) => (<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>)))
            : (<TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
      </div>
    </div>
  );
}
