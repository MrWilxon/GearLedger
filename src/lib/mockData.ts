
import type { ServiceRecord, StockItem, Expense, StaffMember } from '@/types';

export const mockServiceRecords: ServiceRecord[] = [];

export const mockStockItems: StockItem[] = [];

export const mockExpenses: Expense[] = [];

export const mockStaffMembers: StaffMember[] = [];

export const mockDailySales = {
  total: 0,
  count: 0,
};

// This will now be 0 as mockStockItems is empty
export const mockStockValue = mockStockItems.reduce((acc, item) => acc + item.price * item.quantityInStock, 0);

// This will now be an empty array
export const mockRecentExpenses: Expense[] = [];

export const salesDataForChart: { date: string; sales: number }[] = [];
