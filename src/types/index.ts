export interface ServiceRecord {
  id: string;
  date: Date;
  customerName: string;
  contactNo: string;
  bikeModel: string;
  bikeNo: string;
  serviceDetails: string;
  serviceCount: number;
  cost: number;
}

export interface StockItem {
  id: string;
  name: string;
  quantityInStock: number;
  price: number;
  category?: string; // Optional: e.g., "Lubricants", "Spare Parts", "Accessories"
}

export interface Expense {
  id: string;
  date: Date;
  category: string;
  description: string;
  amount: number;
}

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  joiningDate: Date;
  salary: number;
  advanceSalary: number;
  contactNo?: string;
  address?: string;
}

export type ReportType = "daily" | "weekly" | "monthly" | "annually";
