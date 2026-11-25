import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Product, ItemType } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { AppContext } from '@/lib/context';
import { productSchema } from '@/lib/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppToast } from '@/components/ui/ToastProvider';
import { Icons } from '@/lib/constants';
import { z } from 'zod';

type ProductFormData = z.infer<typeof productSchema>;

const Inventory: React.FC = () => {
  const { t, currency } = useContext(AppContext);
  const toast = useAppToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | ItemType>('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: 'CONSUMABLE',
      stock: 0,
      minStock: 5,
      cost: 0,
      price: 0,
      warehouse: 'Main Warehouse',
    },
  });

  const costValue = watch('cost');

  const loadProducts = async () => {
    const data = await backendService.getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      reset(product);
    } else {
      setEditingProduct(null);
      reset({
        name: '',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: 'General',
        type: 'CONSUMABLE',
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 5,
        warehouse: 'Main Warehouse',
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await backendService.updateProduct(editingProduct.id, { ...editingProduct, ...data });
        toast.success({ title: 'Success', description: 'Product updated successfully' });
      } else {
        await backendService.addProduct(data);
        toast.success({ title: 'Success', description: 'Product created successfully' });
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (e) {
      toast.error({ title: 'Error', description: 'Failed to save product' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await backendService.deleteProduct(id);
      toast.success({ title: 'Deleted', description: 'Product removed' });
      loadProducts();
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesFilter = filter === 'ALL' || p.type === filter;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const fmt = (val: number) => currencyService.format(val, currency);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.inventory}
        description="Manage stock levels, pricing, and assets"
        actions={
          <Button onClick={() => handleOpenModal()}>
            <Icons.Plus className="w-4 h-4 mr-2" />
            {t.add_item}
          </Button>
        }
      />

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            {(['ALL', 'CONSUMABLE', 'FIXED_ASSET'] as const).map((type) => (
              <Button
                key={type}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(type)}
              >
                {type}
              </Button>
            ))}
          </div>
          <div className="w-full md:w-64">
            <Input
              placeholder="Search products or SKU..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Product Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Loading inventory...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                  <TableCell className="text-slate-500">{product.sku}</TableCell>
                  <TableCell>
                    <Badge variant={product.type === 'CONSUMABLE' ? 'default' : 'secondary'}>
                      {product.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{fmt(product.cost)}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{fmt(product.price)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.stock <= product.minStock
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(product)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Product Name</label>
              <Input {...register('name')} error={errors.name?.message} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">SKU</label>
              <Input {...register('sku')} error={errors.sku?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <Input {...register('category')} error={errors.category?.message} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Type</label>
              <Select {...register('type')}>
                <option value="CONSUMABLE">CONSUMABLE</option>
                <option value="FIXED_ASSET">FIXED_ASSET</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Cost ({currency})</label>
              <Input
                type="number"
                step="0.01"
                {...register('cost', { valueAsNumber: true })}
                error={errors.cost?.message}
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700">Price ({currency})</label>
                <button
                  type="button"
                  onClick={() => setValue('price', Math.round(costValue * 1.35))}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Suggest +35%
                </button>
              </div>
              <Input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                error={errors.price?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Stock Quantity</label>
              <Input
                type="number"
                {...register('stock', { valueAsNumber: true })}
                error={errors.stock?.message}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Min Alert Stock</label>
              <Input
                type="number"
                {...register('minStock', { valueAsNumber: true })}
                error={errors.minStock?.message}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Warehouse</label>
              <Input {...register('warehouse')} error={errors.warehouse?.message} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
