
import { Product, Customer, DashboardStats, Employee, Transaction, Sale, Supplier, CompanyInfo, AuditLog, TimeRange, SalesHistoryPoint } from '../types';

const DB_KEY = 'APEX_ERP_PRODUCTION_DB_V10';
const COMPANY_KEY = 'APEX_COMPANY_PROFILE_V1';

interface DBState {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  employees: Employee[];
  transactions: Transaction[];
  sales: Sale[];
  auditLogs: AuditLog[];
  orderCounter: number;
}

const emptyState: DBState = {
  products: [],
  customers: [],
  suppliers: [],
  employees: [],
  transactions: [],
  sales: [],
  auditLogs: [],
  orderCounter: 0
};

const getDB = (): DBState => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) return emptyState;
  const parsed = JSON.parse(data);
  if (parsed.orderCounter === undefined) parsed.orderCounter = 0;
  if (!parsed.auditLogs) parsed.auditLogs = [];
  return parsed;
};

const saveDB = (state: DBState) => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
};

export const backendService = {
  // Fix: Added checkLicense to provide machine identification for activation
  async checkLicense(): Promise<{ machineId: string }> {
    let mid = localStorage.getItem('APEX_MACHINE_ID');
    if (!mid) {
      mid = 'APX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      localStorage.setItem('APEX_MACHINE_ID', mid);
    }
    return { machineId: mid };
  },

  // Fix: Added activateLicense to handle system authorization logic
  async activateLicense(key: string): Promise<boolean> {
    if (key && key.startsWith('APEX-') && key.length > 10) {
      localStorage.setItem('APEX_LIC_ACTIVE', 'true');
      this.logAction('System Activation', `Node authorized with key: ${key}`);
      return true;
    }
    return false;
  },

  async getCompanyInfo(): Promise<CompanyInfo> {
    const data = localStorage.getItem(COMPANY_KEY);
    return data ? JSON.parse(data) : { name: 'Apex Enterprise', address: '', phone: '', email: '', ice: '', if: '', taxId: '' };
  },

  async saveCompanyInfo(info: CompanyInfo) {
    localStorage.setItem(COMPANY_KEY, JSON.stringify(info));
    this.logAction('Settings Updated', 'Company profile information was modified');
  },

  async factoryReset() {
    localStorage.clear();
  },

  logAction(action: string, details: string) {
    const db = getDB();
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      user: 'Administrator',
      action,
      details
    };
    db.auditLogs.unshift(log);
    saveDB(db);
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const db = getDB();
    return db.auditLogs;
  },

  generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  async generateUniqueSKU(): Promise<string> {
    const db = getDB();
    let length = 8;
    let attempts = 0;
    while (true) {
      const candidate = this.generateRandomString(length);
      const exists = db.products.some(p => p.sku === candidate);
      if (!exists) return candidate;
      attempts++;
      if (attempts > 100) {
        length++;
        attempts = 0;
      }
    }
  },

  async generateNextOrderNumber(): Promise<string> {
    const db = getDB();
    const company = await this.getCompanyInfo();
    const prefix = (company.name || 'APX').substring(0, 3).toUpperCase();
    const counterStr = String(db.orderCounter).padStart(10, '0');
    const orderNumber = `${prefix}-${counterStr}`;
    db.orderCounter++;
    saveDB(db);
    return orderNumber;
  },

  async getCollection<K extends keyof DBState>(key: K): Promise<DBState[K]> {
    return getDB()[key];
  },

  async logTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    const db = getDB();
    const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString() } as Transaction;
    db.transactions.push(newTx);
    saveDB(db);
    this.logAction('Transaction Logged', `${tx.type}: ${tx.description} (${tx.amount} MAD)`);
    return newTx;
  },

  async addItem<K extends keyof DBState>(collection: K, item: any): Promise<{success: boolean, data: any}> {
    const db = getDB();
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    
    if (newItem.date && newItem.date.length === 10) {
      newItem.date = new Date(newItem.date).toISOString();
    } else if (!newItem.date) {
      newItem.date = new Date().toISOString();
    }

    if (collection === 'sales') {
      const order = newItem as Sale;
      const isSale = order.type === 'SALE';
      order.items.forEach(basketItem => {
        const prod = db.products.find(p => p.id === basketItem.productId);
        if (prod) {
          if (isSale) prod.stock -= basketItem.quantity;
          else prod.stock += basketItem.quantity;
        }
      });

      const tx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: isSale ? 'INCOME' : 'EXPENSE',
        category: 'Trade Hub',
        amount: order.amount,
        currency: 'MAD',
        date: order.date,
        description: `${isSale ? 'SALE' : 'PURCHASE'} - ${order.orderNumber}`
      };
      db.transactions.push(tx);
    }

    (db[collection] as any[]).push(newItem);
    saveDB(db);
    this.logAction(`Added ${collection}`, `Created new record for ${item.name || item.orderNumber || 'Entity'}`);
    return { success: true, data: newItem };
  },

  async updateItem<K extends keyof DBState>(collection: K, id: string, updates: any): Promise<{success: boolean}> {
    const db = getDB();
    const coll = db[collection] as any[];
    const idx = coll.findIndex((i: any) => i.id === id);
    if (idx !== -1) {
      const oldItem = coll[idx];
      coll[idx] = { ...coll[idx], ...updates };
      saveDB(db);
      this.logAction(`Updated ${collection}`, `Modified record ID: ${id} (${oldItem.name || 'Entity'})`);
      return { success: true };
    }
    return { success: false };
  },

  async deleteItem<K extends keyof DBState>(collection: K, id: string): Promise<void> {
    const db = getDB();
    const item = (db[collection] as any[]).find((i: any) => i.id === id);
    (db as any)[collection] = (db[collection] as any[]).filter((i: any) => i.id !== id);
    saveDB(db);
    this.logAction(`Deleted ${collection}`, `Archived record for ${item?.name || 'Entity'}`);
  },

  async getProducts() { return this.getCollection('products'); },
  async getEmployees() { return this.getCollection('employees'); },
  async getCustomers() { return this.getCollection('customers'); },
  async getSuppliers() { return this.getCollection('suppliers'); },
  async getSales() { return this.getCollection('sales'); },
  async getTransactions() { return this.getCollection('transactions'); },

  async getDashboardStats(range: TimeRange = '7D'): Promise<DashboardStats> {
    const db = getDB();
    const products = db.products || [];
    const transactions = db.transactions || [];
    const employees = db.employees || [];

    const inventoryVal = products.filter(p => p.type === 'CONSUMABLE').reduce((acc, p) => acc + (p.stock * (p.cost || 0)), 0);
    const assetVal = products.filter(p => p.type === 'FIXED_ASSET').reduce((acc, p) => acc + (p.stock * (p.cost || 0)), 0);
    const payroll = employees.filter(e => e.status === 'ACTIVE').reduce((acc, e) => acc + (e.salary || 0), 0);
    const income = transactions.filter(t => t.type === 'INCOME').reduce((a, b) => a + (b.amount || 0), 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + (b.amount || 0), 0);
    
    let history: SalesHistoryPoint[] = [];
    const now = new Date();

    if (range === '1D') {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now);
        d.setHours(d.getHours() - i, 0, 0, 0);
        const nextH = new Date(d);
        nextH.setHours(d.getHours() + 1);
        
        const amount = transactions
          .filter(t => t.type === 'INCOME' && new Date(t.date) >= d && new Date(t.date) < nextH)
          .reduce((sum, t) => sum + t.amount, 0);
          
        history.push({ 
          label: `${d.getHours()}:00`, 
          amount, 
          timestamp: d.toISOString() 
        });
      }
    } else if (range === '7D') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);

        const amount = transactions
          .filter(t => t.type === 'INCOME' && new Date(t.date) >= d && new Date(t.date) < nextD)
          .reduce((sum, t) => sum + t.amount, 0);
          
        history.push({ 
          label: d.toLocaleDateString(undefined, { weekday: 'short' }), 
          amount, 
          timestamp: d.toISOString() 
        });
      }
    } else if (range === '1M') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);

        const amount = transactions
          .filter(t => t.type === 'INCOME' && new Date(t.date) >= d && new Date(t.date) < nextD)
          .reduce((sum, t) => sum + t.amount, 0);
          
        history.push({ 
          label: `${d.getDate()}/${d.getMonth() + 1}`, 
          amount, 
          timestamp: d.toISOString() 
        });
      }
    } else if (range === '1Y') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextM = new Date(d.getFullYear(), d.getMonth() + 1, 1);

        const amount = transactions
          .filter(t => t.type === 'INCOME' && new Date(t.date) >= d && new Date(t.date) < nextM)
          .reduce((sum, t) => sum + t.amount, 0);
          
        history.push({ 
          label: d.toLocaleDateString(undefined, { month: 'short' }), 
          amount, 
          timestamp: d.toISOString() 
        });
      }
    } else if (range === 'ALL') {
      const sortedTxs = [...transactions].filter(t => t.type === 'INCOME').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (sortedTxs.length > 0) {
        const startYear = new Date(sortedTxs[0].date).getFullYear();
        const endYear = now.getFullYear();
        for (let y = startYear; y <= endYear; y++) {
          const d = new Date(y, 0, 1);
          const nextY = new Date(y + 1, 0, 1);
          const amount = transactions
            .filter(t => t.type === 'INCOME' && new Date(t.date) >= d && new Date(t.date) < nextY)
            .reduce((sum, t) => sum + t.amount, 0);
          history.push({ label: `${y}`, amount, timestamp: d.toISOString() });
        }
      } else {
        history = [{ label: `${now.getFullYear()}`, amount: 0, timestamp: now.toISOString() }];
      }
    }

    return {
      revenue: income,
      profit: income - expense,
      inventoryValue: inventoryVal,
      assetValue: assetVal,
      payrollMonthly: payroll,
      orderCount: db.sales?.length || 0,
      topProducts: products.sort((a, b) => b.stock - a.stock).slice(0, 5).map(p => ({ 
        name: p.name, 
        sales: p.stock,
        price: p.price
      })),
      recentActivities: [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
      salesHistory: history,
      madRates: []
    };
  }
};
