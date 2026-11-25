import React, { useState, useEffect, useContext } from 'react';
import { DeliveryNote, Sale } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { AppContext } from '@/lib/context';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useAppToast } from '@/components/ui/ToastProvider';
import { Icons } from '@/lib/constants';

const DeliveryNotes: React.FC = () => {
  const {} = useContext(AppContext);
  const toast = useAppToast();
  const [notes, setNotes] = useState<DeliveryNote[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [qtys, setQtys] = useState<Record<string, number>>({});

  const fetch = async () => {
    const [n, s] = await Promise.all([backendService.getDeliveryNotes(), backendService.getSales()]);
    setNotes(n as DeliveryNote[]);
    setSales(s as Sale[]);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  const selectedSale = sales.find((s) => s.id === selectedSaleId);

  const openModal = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;
    setSelectedSaleId(saleId);
    const q: Record<string, number> = {};
    for (const it of sale.items) q[it.productId] = it.quantity;
    setQtys(q);
    setShowModal(true);
  };

  const handleCreate = async () => {
    const sale = sales.find((s) => s.id === selectedSaleId);
    if (!sale) {
      toast.error({ title: 'Error', description: 'Please select a sale order' });
      return;
    }
    const number = await backendService.generateNextDeliveryNoteNumber();
    const note: DeliveryNote = {
      id: Math.random().toString(36).substr(2, 9),
      number,
      date: new Date().toISOString().split('T')[0],
      saleId: sale.id,
      saleNumber: sale.orderNumber,
      customerName: sale.customerName,
      buyerIce: sale.buyerIce,
      items: sale.items.map((it) => ({
        productId: it.productId,
        name: it.name,
        quantity: it.quantity,
        delivered: qtys[it.productId] || 0,
      })),
      status: 'VALIDATED',
      validatedAt: new Date().toISOString(),
    };
    await backendService.addItem('deliveryNotes', note);
    toast.success({ title: 'Success', description: 'Delivery note created' });
    setShowModal(false);
    setSelectedSaleId('');
    fetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bons de livraison"
        description="Delivery notes, partial shipments, and stock movement logs"
        actions={
          <Button
            onClick={() => {
              if (sales.length > 0) openModal(sales[0].id);
              else toast.error({ title: 'No Sales', description: 'Create a sale before generating a delivery note' });
            }}
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            Nouveau BL
          </Button>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° BL</TableHead>
              <TableHead>N° Facture</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Aucun bon de livraison trouvé
                </TableCell>
              </TableRow>
            ) : (
              notes.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-bold text-slate-900 font-mono text-xs">{n.number}</TableCell>
                  <TableCell className="text-slate-700 font-medium">{n.saleNumber}</TableCell>
                  <TableCell className="text-slate-700">{n.customerName}</TableCell>
                  <TableCell className="text-slate-500 text-xs">{n.date}</TableCell>
                  <TableCell>
                    <Badge variant="success">{n.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Créer un Bon de Livraison"
        description="Consignez la quantité livrée pour chaque ligne de commande"
        size="md"
      >
        {selectedSale && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Facture associée</label>
              <Select value={selectedSaleId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => openModal(e.target.value)}>
                {sales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.orderNumber} - {s.customerName}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-slate-700">Quantités livrées</label>
              {selectedSale.items.map((it) => (
                <div key={it.productId} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-800">
                    {it.name} <span className="text-xs text-slate-500">(Commandé: {it.quantity})</span>
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={it.quantity}
                    className="w-24 text-center font-bold"
                    value={qtys[it.productId] ?? it.quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQtys({ ...qtys, [it.productId]: Number(e.target.value) })}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate}>Valider le BL</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeliveryNotes;
