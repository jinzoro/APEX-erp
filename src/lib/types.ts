
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  SUPPLIERS = 'SUPPLIERS',
  SALES = 'SALES',
  CUSTOMERS = 'CUSTOMERS',
  HR = 'HR',
  FINANCE = 'FINANCE',
  SETTINGS = 'SETTINGS',
  AUDIT_LOG = 'AUDIT_LOG'
}

export type TimeRange = '1D' | '7D' | '1M' | '1Y' | 'ALL';

export type ItemType = 'CONSUMABLE' | 'FIXED_ASSET';
export type Language = 'EN' | 'FR' | 'AR';
export type CurrencyCode = string;

export interface CompanyInfo {
  name: string;
  logo?: string; // Base64
  address: string;
  phone: string;
  email: string;
  ice: string; // Moroccan Identifiant Commun de l'Entreprise
  if: string;  // Identifiant Fiscal
  taxId: string;
  primaryColor?: string; // Hex code for theme
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  type: ItemType;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  warehouse: string;
  image?: string; // Base64 image
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  category: string;
  rating: number;
  totalSpent: number;
  image?: string; // Base64 image
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  cin: string; // Moroccan National ID
  role: string;
  department: string;
  salary: number;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalSales: number;
  lastOrderDate: string;
  tier: 'LEAD' | 'RECURRING' | 'VIP';
  image?: string; // Base64 image
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  orderNumber: string;
  customerName: string;
  customerId?: string;
  date: string; // ISO string
  amount: number; // This acts as Total TTC
  tva: number; // Percentage (e.g., 20)
  items: SaleItem[];
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  type?: 'SALE' | 'PURCHASE';
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  localAmount?: number;
  currency: string;
  date: string; // ISO string
  description: string;
  linkedEntityId?: string;
  linkedSku?: string;
  quantity?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface SalesHistoryPoint {
  label: string;
  amount: number;
  timestamp: string;
}

export interface DashboardStats {
  revenue: number;
  profit: number;
  inventoryValue: number;
  assetValue: number;
  payrollMonthly: number;
  orderCount: number;
  topProducts: { name: string; sales: number; price: number }[];
  recentActivities: Transaction[];
  salesHistory: SalesHistoryPoint[];
  madRates: { code: string; rate: number }[];
}
