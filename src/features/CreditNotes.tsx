import React, { useState, useEffect, useContext } from 'react';
import { CreditNote, Sale } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { AppContext } from '@/lib/context';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useAppToast } from '@/components/ui/ToastProvider';
import { Icons } from '@/lib/constants';

const CreditNotes: React.FC = () => {
  const { currency: baseCurrency } = useContext(AppContext);
  const toast = useAppToast();
  const [notes, setNotes] = useState<CreditNote[]>([]);
  const [invoices, setInvoices] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [reason, setReason] = useState('');

  const fetch = async () => {
    const [n, s] = await Promise.all([backendService.getCreditNotes(), backendService.getSales()]);
    setNotes(n as CreditNote[]);
    setInvoices(s as Sale[]);
    setLoading(false);
  };
  useEffect(() => {
    fetch();
  }, []);

  const handleCreate = async () => {
    const inv = invoices.find((i) => i.id === selectedInvoiceId);
    if (!inv || !reason) {
      toast.error({ title: 'Error', description: 'Please select an invoice and specify a reason' });
      return;
    }
    const number = await backendService.generateNextCreditNoteNumber();
    const note: CreditNote = {
      id: Math.random().toString(36).substr(2, 9),
      number,
      originalInvoiceId: inv.id,
      originalInvoiceNumber: inv.orderNumber,
      customerName: inv.customerName,
      buyerIce: inv.buyerIce,
      date: new Date().toISOString().split('T')[0],
      currency: inv.currency || 'MAD',
      subtotalHt: inv.subtotalHt,
      totalVat: inv.totalVat,
      amount: inv.amount,
      items: inv.items.map((i) => ({ ...i })),
      reason,
      status: 'VALIDATED',
      validatedAt: new Date().toISOString(),
    };
    await backendService.addItem('creditNotes', note);
    toast.success({ title: 'Success', description: 'Credit note issued' });
    setShowModal(false);
    setSelectedInvoiceId('');
    setReason('');
    fetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Avoirs (Credit Notes)"
        description="Invoice credit notes and accounting adjustments"
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Icons.Plus className="w-4 h-4 mr-2" />
            Nouvel avoir
          </Button>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Avoir</TableHead>
              <TableHead>Facture Origine</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Montant TTC</TableHead>
              <TableHead>Motif</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Aucun avoir trouvé
                </TableCell>
              </TableRow>
            ) : (
              notes.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-bold text-slate-900 font-mono text-xs">{n.number}</TableCell>
                  <TableCell className="text-slate-700 font-medium">{n.originalInvoiceNumber}</TableCell>
                  <TableCell className="text-slate-700">{n.customerName}</TableCell>
                  <TableCell className="font-bold text-slate-900">
                    {currencyService.format(n.amount, baseCurrency)}
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">{n.reason}</TableCell>
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
        title="Émettre un avoir"
        description="Sélectionnez une facture validée pour créer une note d'avoir"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Facture d'origine</label>
            <Select value={selectedInvoiceId} onChange={(e) => setSelectedInvoiceId(e.target.value)}>
              <option value="">Sélectionner une facture...</option>
              {invoices.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.orderNumber} - {i.customerName} ({currencyService.format(i.amount, baseCurrency)})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Motif de l'avoir</label>
            <Textarea
              placeholder="Raison du retour, erreur de facturation, remise accordée..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate}>Créer l'avoir</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreditNotes;
