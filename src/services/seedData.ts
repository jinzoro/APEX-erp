// Demo seed data for local-first mode. Runs once when the DB is empty.
import { backendService } from './backendSimulator';

export async function seedDemoData(): Promise<void> {
  const products = await backendService.getProducts();
  if (products && products.length > 0) return; // already seeded

  await backendService.saveCompanyInfo({
    name: 'SARL Atlas Négoce',
    legalForm: 'SARL',
    shareCapital: 100000,
    address: '12, Rue Ibn Sina, Casablanca 20000, Maroc',
    phone: '+212 5 22 00 00 00',
    email: 'contact@atlas-negoce.ma',
    ice: '001234567000089',
    if: '12345678',
    rc: '123456',
    rcCourt: 'Tribunal de Commerce de Casablanca',
    patente: '12345678',
    cnssNumber: '1234567',
    bankRib: '000000000000000000000000',
    taxId: '12345678',
    primaryColor: '#2563eb',
    logo: '',
  });

  const prods = [
    { sku: 'PRD-001', name: 'Ordinateur portable 15"', category: 'Informatique', type: 'CONSUMABLE', price: 8500, cost: 6200, stock: 12, minStock: 3, warehouse: 'Principal' },
    { sku: 'PRD-002', name: 'Imprimante laser', category: 'Informatique', type: 'CONSUMABLE', price: 2400, cost: 1700, stock: 8, minStock: 2, warehouse: 'Principal' },
    { sku: 'PRD-003', name: 'Papier A4 (rame)', category: 'Fournitures', type: 'CONSUMABLE', price: 45, cost: 32, stock: 120, minStock: 20, warehouse: 'Principal' },
    { sku: 'PRD-004', name: 'Chaise de bureau', category: 'Mobilier', type: 'FIXED_ASSET', price: 1200, cost: 800, stock: 15, minStock: 2, warehouse: 'Principal' },
    { sku: 'PRD-005', name: 'Bureau métallique', category: 'Mobilier', type: 'FIXED_ASSET', price: 2800, cost: 1900, stock: 6, minStock: 1, warehouse: 'Principal' },
  ];
  for (const p of prods) await backendService.addItem('products', p);

  const custs = [
    { name: 'Société Maroc Distribution', email: 'contact@md.ma', phone: '+212 6 00 00 00 01', address: 'Casablanca', totalSales: 0, lastOrderDate: new Date().toISOString(), tier: 'VIP' },
    { name: 'Entreprise Atlas SARL', email: 'info@atlas.ma', phone: '+212 6 00 00 00 02', address: 'Rabat', totalSales: 0, lastOrderDate: new Date().toISOString(), tier: 'RECURRING' },
    { name: 'Client Particulier', email: 'client@example.com', phone: '+212 6 00 00 00 03', address: 'Marrakech', totalSales: 0, lastOrderDate: new Date().toISOString(), tier: 'LEAD' },
  ];
  for (const c of custs) await backendService.addItem('customers', c);

  const supps = [
    { name: 'Fournisseur Tech SARL', contact: 'Ahmed', email: 'tech@fournisseur.ma', category: 'Informatique', rating: 5, totalSpent: 0 },
    { name: 'Papeterie Centrale', contact: 'Fatima', email: 'papier@centrale.ma', category: 'Fournitures', rating: 4, totalSpent: 0 },
  ];
  for (const s of supps) await backendService.addItem('suppliers', s);

  const emps = [
    { firstName: 'Youssef', lastName: 'Alami', cin: 'AB123456', role: 'Gérant', department: 'Direction', salary: 12000, email: 'y.alami@atlas-negoce.ma', phone: '+212 6 11 11 11 11', address: 'Casablanca', joinDate: '2023-01-15', status: 'ACTIVE' },
    { firstName: 'Khadija', lastName: 'Bennani', cin: 'CD789012', role: 'Comptable', department: 'Finance', salary: 8500, email: 'k.bennani@atlas-negoce.ma', phone: '+212 6 22 22 22 22', address: 'Casablanca', joinDate: '2023-06-01', status: 'ACTIVE' },
  ];
  for (const e of emps) await backendService.addItem('employees', e);
}
