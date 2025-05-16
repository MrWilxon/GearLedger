import type { ServiceRecord, StockItem, Expense, StaffMember } from '@/types';

export const mockServiceRecords: ServiceRecord[] = [
  {
    id: 'SRV001',
    date: new Date('2023-10-15T10:00:00Z'),
    customerName: 'Alice Wonderland',
    contactNo: '555-1234',
    bikeModel: 'Mountain Pro X',
    bikeNo: 'XYZ 123',
    serviceDetails: 'Full Tune-up, Brake Adjustment',
    serviceCount: 1,
    cost: 150.00,
  },
  {
    id: 'SRV002',
    date: new Date('2023-10-16T14:30:00Z'),
    customerName: 'Bob The Builder',
    contactNo: '555-5678',
    bikeModel: 'Roadster Speedster',
    bikeNo: 'ABC 789',
    serviceDetails: 'Tire Replacement, Chain Lubrication',
    serviceCount: 2,
    cost: 75.50,
  },
  {
    id: 'SRV003',
    date: new Date('2023-10-18T09:15:00Z'),
    customerName: 'Charlie Brown',
    contactNo: '555-9012',
    bikeModel: 'BMX Freestyle',
    bikeNo: 'QWE 456',
    serviceDetails: 'Handlebar Grip Change',
    serviceCount: 1,
    cost: 25.00,
  },
];

export const mockStockItems: StockItem[] = [
  {
    id: 'STK001',
    name: 'Premium Chain Lube',
    quantityInStock: 50,
    price: 12.99,
    category: 'Lubricants',
  },
  {
    id: 'STK002',
    name: 'MTB Tire 29"',
    quantityInStock: 25,
    price: 45.50,
    category: 'Spare Parts',
  },
  {
    id: 'STK003',
    name: 'Road Bike Inner Tube',
    quantityInStock: 100,
    price: 5.75,
    category: 'Spare Parts',
  },
  {
    id: 'STK004',
    name: 'Ergonomic Handlebar Grips',
    quantityInStock: 30,
    price: 22.00,
    category: 'Accessories',
  },
  {
    id: 'STK005',
    name: 'Brake Pad Set (Disc)',
    quantityInStock: 40,
    price: 18.50,
    category: 'Spare Parts',
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 'EXP001',
    date: new Date('2023-10-01T00:00:00Z'),
    category: 'Rent',
    description: 'Shop Rent for October',
    amount: 1200.00,
  },
  {
    id: 'EXP002',
    date: new Date('2023-10-05T00:00:00Z'),
    category: 'Utilities',
    description: 'Electricity Bill',
    amount: 150.75,
  },
  {
    id: 'EXP003',
    date: new Date('2023-10-10T00:00:00Z'),
    category: 'Supplies',
    description: 'Cleaning Supplies',
    amount: 45.20,
  },
];

export const mockStaffMembers: StaffMember[] = [
  {
    id: 'STF001',
    name: 'John Doe',
    designation: 'Lead Mechanic',
    joiningDate: new Date('2022-01-15T00:00:00Z'),
    salary: 3500.00,
    advanceSalary: 0,
    contactNo: '555-1111',
    address: '123 Main St, Anytown',
  },
  {
    id: 'STF002',
    name: 'Jane Smith',
    designation: 'Sales Associate',
    joiningDate: new Date('2022-06-01T00:00:00Z'),
    salary: 2800.00,
    advanceSalary: 200,
    contactNo: '555-2222',
    address: '456 Oak Ave, Anytown',
  },
];

export const mockDailySales = {
  total: 250.50,
  count: 3,
};

export const mockStockValue = mockStockItems.reduce((acc, item) => acc + item.price * item.quantityInStock, 0);

export const mockRecentExpenses = mockExpenses.slice(0, 2);

export const salesDataForChart = [
  { date: "2023-10-01", sales: 200 },
  { date: "2023-10-02", sales: 300 },
  { date: "2023-10-03", sales: 250 },
  { date: "2023-10-04", sales: 400 },
  { date: "2023-10-05", sales: 350 },
  { date: "2023-10-06", sales: 500 },
  { date: "2023-10-07", sales: 450 },
];
