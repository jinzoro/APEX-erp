import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Customer } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { AppContext } from '@/lib/context';
import { customerSchema } from '@/lib/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppToast } from '@/components/ui/ToastProvider';
import { Icons } from '@/lib/constants';
import { z } from 'zod';

type CustomerFormData = z.infer<typeof customerSchema>;

const Customers: React.FC = () => {
  const { t, currency } = useContext(AppContext);
  const toast = useAppToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      tier: 'LEAD',
    },
  });

  const loadCustomers = async () => {
    const data = await backendService.getCustomers();
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        ice: customer.ice || '',
        address: customer.address || '',
        tier: customer.tier,
      });
    } else {
      setEditingCustomer(null);
      reset({
        name: '',
        email: '',
        phone: '',
        ice: '',
        address: '',
        tier: 'LEAD',
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (editingCustomer) {
        await backendService.updateCustomer(editingCustomer.id, { ...editingCustomer, ...data });
        toast.success({ title: 'Success', description: 'Customer updated successfully' });
      } else {
        await backendService.addCustomer(data);
        toast.success({ title: 'Success', description: 'Customer created successfully' });
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (e) {
      toast.error({ title: 'Error', description: 'Failed to save customer' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      await backendService.deleteCustomer(id);
      toast.success({ title: 'Deleted', description: 'Customer removed' });
      loadCustomers();
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (val: number) => currencyService.format(val, currency);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.customers}
        description="Client database and relations"
        actions={
          <Button onClick={() => handleOpenModal()}>
            <Icons.Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        }
      />

      <Card className="p-4">
        <div className="w-full md:w-64">
          <Input
            placeholder="Search customer name or email..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-slate-500">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-500">No customers found.</div>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900">{customer.name}</h3>
                    <p className="text-xs text-slate-500">{customer.email}</p>
                  </div>
                  <Badge variant={customer.tier === 'VIP' ? 'default' : 'secondary'}>
                    {customer.tier}
                  </Badge>
                </div>

                <div className="mt-4 space-y-1 text-xs text-slate-600">
                  <p><strong>Phone:</strong> {customer.phone}</p>
                  {customer.ice && <p><strong>ICE:</strong> {customer.ice}</p>}
                  {customer.address && <p><strong>Address:</strong> {customer.address}</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total Sales</span>
                  <span className="text-sm font-bold text-slate-900">{fmt(customer.totalSales)}</span>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenModal(customer)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(customer.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Customer / Company Name</label>
            <Input {...register('name')} error={errors.name?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <Input {...register('email')} error={errors.email?.message} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Phone</label>
              <Input {...register('phone')} error={errors.phone?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">ICE (15 Digits)</label>
              <Input {...register('ice')} error={errors.ice?.message} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Tier</label>
              <Select {...register('tier')}>
                <option value="LEAD">LEAD</option>
                <option value="RECURRING">RECURRING</option>
                <option value="VIP">VIP</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Address</label>
            <Input {...register('address')} error={errors.address?.message} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
