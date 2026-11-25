import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { AppContext } from '@/lib/context';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useAppToast } from '@/components/ui/ToastProvider';
import { Icons } from '@/lib/constants';

const Finance: React.FC = () => {
  const { currency: baseCurrency, rates } = useContext(AppContext);
  const toast = useAppToast();

  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    description: '',
    amount: 0,
    localAmount: 0,
    category: 'Operation',
    type: 'EXPENSE',
    date: new Date().toISOString().split('T')[0],
    currency: 'MAD',
  });

  const fetchTxs = async () => {
    const data = await backendService.getTransactions();
    setTxs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTxs();
  }, []);

  useEffect(() => {
    if (newTx.localAmount !== undefined && newTx.currency) {
      const converted = currencyService.convert(newTx.localAmount, newTx.currency, baseCurrency, rates);
      setNewTx((prev) => ({ ...prev, amount: converted }));
    }
  }, [newTx.localAmount, newTx.currency, baseCurrency, rates]);

  const handleLog = async () => {
    if (!newTx.description || !newTx.amount) {
      toast.error({ title: 'Error', description: 'Please fill in all fields' });
      return;
    }
    await backendService.logTransaction(newTx as Transaction);
    toast.success({ title: 'Success', description: 'Transaction logged' });
    setIsModalOpen(false);
    setNewTx({
      description: '',
      amount: 0,
      localAmount: 0,
      category: 'Operation',
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
      currency: 'MAD',
    });
    fetchTxs();
  };

  const totals = useMemo(
    () => ({
      income: txs.filter((v) => v.type === 'INCOME').reduce((a, b) => a + b.amount, 0),
      expense: txs.filter((v) => v.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0),
    }),
    [txs]
  );

  const allCurrencyCodes = useMemo(() => Object.keys(rates).sort(), [rates]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance & Treasury"
        description="Accounting ledger and transaction management"
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Icons.Plus className="w-4 h-4 mr-2" />
            Log Entry
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">Inflow</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">
              {currencyService.format(totals.income, baseCurrency)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-rose-100">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase text-rose-600 tracking-wider">Outflow</p>
            <p className="text-2xl font-bold text-rose-900 mt-1">
              {currencyService.format(totals.expense, baseCurrency)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Net Position</p>
            <p className="text-2xl font-bold mt-1">
              {currencyService.format(totals.income - totals.expense, baseCurrency)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : txs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              txs.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-xs text-slate-500">{t.date}</TableCell>
                  <TableCell className="font-medium text-slate-900">{t.description}</TableCell>
                  <TableCell className="text-sm">{t.category}</TableCell>
                  <TableCell className={`text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {currencyService.format(t.amount, baseCurrency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Transaction"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={newTx.type === 'INCOME' ? 'default' : 'outline'}
              onClick={() => setNewTx({ ...newTx, type: 'INCOME' })}
            >
              Income
            </Button>
            <Button
              variant={newTx.type === 'EXPENSE' ? 'default' : 'outline'}
              onClick={() => setNewTx({ ...newTx, type: 'EXPENSE' })}
            >
              Expense
            </Button>
          </div>
          <Input
            placeholder="Description"
            value={newTx.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTx({ ...newTx, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={newTx.currency}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewTx({ ...newTx, currency: e.target.value })}
            >
              {allCurrencyCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              placeholder="Amount"
              value={newTx.localAmount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTx({ ...newTx, localAmount: Number(e.target.value) })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLog}>Commit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Finance;
