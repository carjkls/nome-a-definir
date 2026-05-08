'use client';

import { useState } from 'react';
import { ExpenseDashboard, type Expense } from '@/components/area-colab/ExpenseDashboard';
import { expenses } from '@/lib/prototype-data';

export default function DespesasPage() {
  const [openFinance] = useState<Expense[]>(expenses);
  const [manual, setManual] = useState<Expense[]>([
    { id: 'm1', date: '2026-05-04', description: 'Cafe com cliente enterprise', amount: 164, category: 'Comida', source: 'Manual' },
  ]);

  const handleAddManual = (expense: { description: string; amount: number; category: string; date: string }) => {
    setManual((current) => [
      {
        id: `m-${Date.now()}`,
        ...expense,
        source: 'Manual',
      },
      ...current,
    ]);
  };

  const handleDeleteManual = (id: string) => {
    setManual((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-600">Open Finance expenses</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-950">Despesas e economia potencial</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          O painel mantém a estrutura atual, mas a dica financeira agora explica quais gastos geram economia real.
        </p>
      </div>
      <ExpenseDashboard
        openFinanceExpenses={openFinance}
        manualExpenses={manual}
        onAddManual={handleAddManual}
        onDeleteManual={handleDeleteManual}
      />
    </div>
  );
}
