import React, { useState, useEffect, useContext } from 'react';
import { Supplier } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { AppContext } from '@/lib/context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppToast } from '@/components/ui/ToastProvider';
import { Icons } from '@/lib/constants';

const Suppliers: React.FC = () => {
  const { t, currency } = useContext(AppContext);
  const toast = useAppToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    contact: '',
    email: '',
    category: 'Wholesale',
    rating: 5,
    totalSpent: 0,
    image: '',
  });

  const fetchSuppliers = async () => {
    const data = await backendService.getSuppliers();
    setSuppliers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error({ title: 'Error', description: 'Name and email are required' });
      return;
    }
    if (editId) {
      await backendService.updateItem('suppliers', editId, formData);
      toast.success({ title: 'Success', description: 'Supplier updated' });
    } else {
      await backendService.addItem('suppliers', formData);
      toast.success({ title: 'Success', description: 'Supplier added' });
    }
    setShowModal(false);
    setEditId(null);
    setFormData({ name: '', contact: '', email: '', category: 'Wholesale', rating: 5, totalSpent: 0, image: '' });
    fetchSuppliers();
  };

  const handleEdit = (s: Supplier) => {
    setFormData({ ...s });
    setEditId(s.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Blacklist this supplier?')) {
      await backendService.deleteItem('suppliers', id);
      toast.success({ title: 'Deleted', description: 'Supplier removed' });
      fetchSuppliers();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.suppliers}
        description="Vendor network management and supply chain"
        actions={
          <Button
            onClick={() => {
              setEditId(null);
              setFormData({ name: '', contact: '', email: '', category: 'Wholesale', rating: 5, totalSpent: 0, image: '' });
              setShowModal(true);
            }}
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-slate-500">Loading suppliers...</div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-500">No supply partners found.</div>
        ) : (
          suppliers.map((s) => (
            <Card key={s.id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg overflow-hidden">
                      {s.image ? <img src={s.image} className="w-full h-full object-cover" /> : s.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{s.name}</h3>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    {s.category}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total Spent</span>
                  <span className="text-sm font-bold text-slate-900">{currencyService.format(s.totalSpent, currency)}</span>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(s)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditId(null);
        }}
        title={editId ? 'Edit Supplier' : 'Register Vendor'}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative cursor-pointer hover:border-slate-500">
              {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <Icons.Plus />}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Vendor Entity</label>
            <Input
              placeholder="Company Name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Electronic Mail</label>
            <Input
              type="email"
              placeholder="contact@vendor.com"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Partner</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Suppliers;
