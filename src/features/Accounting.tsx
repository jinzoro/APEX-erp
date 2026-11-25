import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Account, JournalEntry } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { AppContext } from '@/lib/context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { PageHeader } from '@/components/ui/PageHeader';

const TABS = [
  { key: 'ledger' as const, label: 'Plan Comptable' },
  { key: 'journal' as const, label: 'Journal' },
  { key: 'trial' as const, label: 'Balance' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const Accounting: React.FC = () => {
  const { currency: baseCurrency } = useContext(AppContext);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('ledger');

  const fetch = async () => {
    const [a, j] = await Promise.all([
      backendService.getCollection('accounts' as any),
      backendService.getCollection('journalEntries' as any),
    ]);
    setAccounts(a as Account[]);
    setEntries(j as JournalEntry[]);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  // Trial balance aggregation
  const balances = useMemo(() => {
    const map: Record<string, { debit: number; credit: number }> = {};
    for (const e of entries) {
      for (const l of e.lines) {
        if (!map[l.accountCode]) map[l.accountCode] = { debit: 0, credit: 0 };
        map[l.accountCode].debit += l.debit;
        map[l.accountCode].credit += l.credit;
      }
    }
    return map;
  }, [entries]);

  const totalDebit = useMemo(
    () => Object.values(balances).reduce((sum, b) => sum + b.debit, 0),
    [balances]
  );
  const totalCredit = useMemo(
    () => Object.values(balances).reduce((sum, b) => sum + b.credit, 0),
    [balances]
  );
  const trialRows = useMemo(
    () =>
      accounts
        .map((a) => {
          const b = balances[a.code] || { debit: 0, credit: 0 };
          if (b.debit === 0 && b.credit === 0) return null;
          return { account: a, balance: b };
        })
        .filter(Boolean) as { account: Account; balance: { debit: number; credit: number } }[],
    [accounts, balances]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comptabilité (CGNC)"
        description="Chart of accounts, sales journal, ledger & trial balance"
        actions={
          <Button variant="outline" size="sm">
            Nouvelle écriture
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Comptabilité onglets">
          {TABS.map((t) => (
            <Button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              variant={tab === t.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-end gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Devise</span>
          <span className="font-mono text-sm font-bold text-slate-900">{baseCurrency}</span>
        </div>
      </div>

      <Card className="flex-1">
        {tab === 'ledger' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code CGNC</TableHead>
                <TableHead>Compte</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Solde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Chargement du plan comptable…
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Aucun compte configuré.
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((a) => {
                  const b = balances[a.code] || { debit: 0, credit: 0 };
                  const solde = b.debit - b.credit;
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs font-bold text-slate-900">{a.code}</TableCell>
                      <TableCell className="text-slate-700 font-medium">{a.name}</TableCell>
                      <TableCell className="text-slate-500 text-xs uppercase tracking-widest">{a.type}</TableCell>
                      <TableCell className="text-right font-bold text-slate-900">
                        {currencyService.format(solde, baseCurrency)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
        {tab === 'journal' && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-20 text-slate-500">Chargement du journal…</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-black uppercase text-xs tracking-widest">Aucune écriture comptable</div>
            ) : (
              entries.map((e) => (
                <div key={e.id} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm">{e.number} — {e.journal}</span>
                    <span className="text-xs text-slate-400">{new Date(e.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{e.description}</p>
                  <Table className="text-xs">
                    <thead>
                      <TableRow>
                        <TableHead>Compte</TableHead>
                        <TableHead className="text-right">Débit</TableHead>
                        <TableHead className="text-right">Crédit</TableHead>
                      </TableRow>
                    </thead>
                    <TableBody>
                      {e.lines.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell>{l.accountCode} — {l.accountName}</TableCell>
                          <TableCell className="text-right text-slate-900">
                            {l.debit ? currencyService.format(l.debit, baseCurrency) : '—'}
                          </TableCell>
                          <TableCell className="text-right text-slate-900">
                            {l.credit ? currencyService.format(l.credit, baseCurrency) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            )}
          </div>
        )}
        {tab === 'trial' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code CGNC</TableHead>
                <TableHead>Compte</TableHead>
                <TableHead className="text-right">Débit</TableHead>
                <TableHead className="text-right">Crédit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Chargement de la balance…
                  </TableCell>
                </TableRow>
              ) : trialRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Aucune écriture avec solde.
                  </TableCell>
                </TableRow>
              ) : (
                trialRows.map(({ account, balance }) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">{account.code}</TableCell>
                    <TableCell className="text-slate-700 font-medium">{account.name}</TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {currencyService.format(balance.debit, baseCurrency)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {currencyService.format(balance.credit, baseCurrency)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableRow className="border-t border-slate-200 font-black bg-slate-50">
              <TableCell className="px-4 py-3 text-slate-500 text-xs uppercase">Total</TableCell>
              <TableCell className="px-4 py-3 text-slate-900"></TableCell>
              <TableCell className="text-right px-4 py-3 font-bold text-slate-900">
                {currencyService.format(totalDebit, baseCurrency)}
              </TableCell>
              <TableCell className="text-right px-4 py-3 font-bold text-slate-900">
                {currencyService.format(totalCredit, baseCurrency)}
              </TableCell>
            </TableRow>
          </Table>
        )}
      </Card>

      {tab === 'trial' && (
        <Card>
          <div className="p-6">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Équilibre comptable</p>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-600">Débit total:</span>
              <span className="font-mono font-bold text-slate-900">{currencyService.format(totalDebit, baseCurrency)}</span>
              <span className={`text-sm font-bold ${totalDebit === totalCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                {totalDebit === totalCredit ? 'ÉQUILIBRÉ' : 'DÉSÉQUILIBRÉ'}
              </span>
              <span className="text-sm font-semibold text-slate-600">Crédit total:</span>
              <span className="font-mono font-bold text-slate-900">{currencyService.format(totalCredit, baseCurrency)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Accounting;
