import { z } from 'zod';

export const iceSchema = z.string().regex(/^\d{15}$/, 'ICE must be exactly 15 digits');
export const ifSchema = z.string().regex(/^\d{1,10}$/, 'Identifiant Fiscal must be 1 to 10 digits');
export const ribSchema = z.string().regex(/^\d{24}$/, 'RIB must be exactly 24 digits');
export const cinSchema = z.string().regex(/^[A-Za-z]{1,2}\d{5,6}$/, 'Invalid Moroccan CIN format');
export const cnssSchema = z.string().regex(/^\d{9}$/, 'CNSS number must be 9 digits');

export const isValidICE = (val: string) => iceSchema.safeParse(val).success;
export const isValidIF = (val: string) => ifSchema.safeParse(val).success;
export const isValidRIB = (val: string) => ribSchema.safeParse(val).success;

export const companySchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(8, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  ice: iceSchema,
  if: ifSchema,
  bankRib: ribSchema.optional().or(z.literal('')),
  cnssNumber: cnssSchema.optional().or(z.literal('')),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(2, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  cost: z.number().min(0, 'Cost must be positive'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  minStock: z.number().int().min(0, 'Min stock must be non-negative'),
  type: z.enum(['CONSUMABLE', 'FIXED_ASSET']),
  warehouse: z.string().min(2, 'Warehouse is required'),
});

export const customerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number is required'),
  ice: iceSchema.optional().or(z.literal('')),
  if: ifSchema.optional().or(z.literal('')),
  rib: ribSchema.optional().or(z.literal('')),
  cin: cinSchema.optional().or(z.literal('')),
  cnssNumber: cnssSchema.optional().or(z.literal('')),
  patente: z.string().optional().or(z.literal('')),
  rc: z.string().optional().or(z.literal('')),
  rcCourt: z.string().optional().or(z.literal('')),
  taxId: z.string().optional().or(z.literal('')),
  bankRib: ribSchema.optional().or(z.literal('')),
  shareCapital: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().min(0, 'Share capital must be positive').optional()
  ),
  legalForm: z.string().optional().or(z.literal('')),
  address: z.string().optional(),
  tier: z.enum(['LEAD', 'RECURRING', 'VIP']),
});

export const employeeSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  cin: cinSchema,
  cnssNumber: cnssSchema.optional().or(z.literal('')),
  role: z.string().min(2, 'Role is required'),
  department: z.string().min(2, 'Department is required'),
  grossSalary: z.number().min(0, 'Salary must be positive'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number is required'),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED']),
});
