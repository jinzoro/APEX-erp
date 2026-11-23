
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  SUPPLIERS = 'SUPPLIERS',
  SALES = 'SALES',
  CUSTOMERS = 'CUSTOMERS',
  HR = 'HR',
  FINANCE = 'FINANCE',
  SETTINGS = 'SETTINGS',
  AUDIT_LOG = 'AUDIT_LOG',
  CREDIT_NOTES = 'CREDIT_NOTES'
}

export type TimeRange = '1D' | '7D' | '1M' | '1Y' | 'ALL';

export type ItemType = 'CONSUMABLE' | 'FIXED_ASSET';
export type Language = 'EN' | 'FR' | 'AR';
export type CurrencyCode = string;

export interface CompanyInfo {
  name: string;
  legalForm?: string;
  shareCapital?: number;
  logo?: string; // Base64
  address: string;
  phone: string;
  email: string;
  ice: string; // Moroccan Identifiant Commun de l'Entreprise
  if: string;  // Identifiant Fiscal
  rc?: string;
  rcCourt?: string;
  patente?: string; // TP
  cnssNumber?: string;
  bankRib?: string;
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
  ice?: string;
  totalSales: number;
  lastOrderDate: string;
  tier: 'LEAD' | 'RECURRING' | 'VIP';
  image?: string; // Base64 image
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number; // unit price HT (major units)
  vatRate: number; // percent, from tax_rates (TO VERIFY)
  lineHt: number;
  lineVat: number;
  lineTtc: number;
}

export interface Sale {
  id: string;
  orderNumber: string;
  customerName: string;
  customerId?: string;
  buyerIce?: string;
  buyerAddress?: string;
  date: string; // ISO string
  currency: string;
  subtotalHt: number;
  totalVat: number;
  amount: number; // Total TTC
  items: SaleItem[];
  status: 'DRAFT' | 'VALIDATED' | 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
  type?: 'SALE' | 'PURCHASE';
  validatedAt?: string;
  creditNoteId?: string;
  paymentTerms?: string;
  dueDate?: string;
  paymentMethod?: string;
  originalCurrency?: string;
  exchangeRate?: number;
  rateDate?: string;
}

export interface CreditNote {
  id: string;
  number: string;
  originalInvoiceId: string;
  originalInvoiceNumber: string;
  customerName: string;
  buyerIce?: string;
  date: string;
  currency: string;
  subtotalHt: number;
  totalVat: number;
  amount: number; // TTC
  items: SaleItem[];
  reason: string;
  status: 'DRAFT' | 'VALIDATED';
  validatedAt?: string;
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
