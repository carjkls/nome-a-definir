'use client';

import { useState } from 'react';
import { ExpenseRow } from './ExpenseRow';
import { cn } from '@/lib/utils';

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  source: 'Open Finance' | 'Manual';
  bank?: string;
}

interface ExpenseDashboardProps {
  openFinanceExpenses: Expense[];
  manualExpenses: Expense[];
  onAddManual: (expense: { description: string; amount: number; category: string; date: string }) => void;
  onDeleteManual: (id: string) => void;
  onEditManual?: (id: string, updates: Partial<Expense>) => void;
  className?: string;
}

const CATEGORIES = ['Viagens', 'Assinaturas', 'Comida', 'Marketing', 'Roupas', 'Gasolina', 'Outros'];

export function ExpenseDashboard({
  openFinanceExpenses,
  manualExpenses,
  onAddManual,
  onDeleteManual,
  onEditManual,
  className
}: ExpenseDashboardProps) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Outros',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    onAddManual({
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      date: form.date
    });
    setForm({ description: '', amount: '', category: 'Outros', date: new Date().toISOString().split('T')[0] });
  };

  // Combine and sort
  const allExpenses: Expense[] = [...openFinanceExpenses, ...manualExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Totals
  const totalOF = openFinanceExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalManual = manualExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAll = totalOF + totalManual;
  const subscriptionSpend = allExpenses
    .filter((expense) => expense.category === 'Assinaturas')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const marketingSpend = allExpenses
    .filter((expense) => expense.category === 'Marketing')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const potentialSavings = subscriptionSpend * 0.55 + marketingSpend * 0.18;

  // Category breakdown (only manual? or all? for chart, include all)
  const categoryTotals: Record<string, number> = {};
  allExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const categories = Object.keys(categoryTotals);
  const totalCategorySum = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Generate conic gradient for pie chart
  let gradientStr = '';
  let currentAngle = 0;
  categories.forEach((cat) => {
    const value = categoryTotals[cat];
    const percentage = (value / totalCategorySum) * 100;
    const angle = (percentage / 100) * 360;
    const color = getCategoryColor(cat);
    gradientStr += `${color} ${currentAngle}deg ${currentAngle + angle}deg, `;
    currentAngle += angle;
  });
  gradientStr = gradientStr.slice(0, -2); // remove trailing comma

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Despesas Open Finance</p>
          <p className="text-2xl font-bold text-slate-900">
            {totalOF.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Despesas Manuais</p>
          <p className="text-2xl font-bold text-primary-600">
            {totalManual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Total Geral</p>
          <p className="text-2xl font-bold text-slate-900">
            {totalAll.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      {/* Main Content: Form + Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Manual Expense Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 mb-4">Adicionar Despesa Manual</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <input
                type="text"
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="Ex: Almoço com cliente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
            >
              Adicionar Despesa
            </button>
          </form>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center">
          <h3 className="font-bold text-lg text-slate-900 mb-4 self-start">Distribuição por Categoria</h3>
          <div
            className="w-48 h-48 rounded-full mb-4"
            style={{
              background: `conic-gradient(${gradientStr})`,
              transition: 'background 0.3s ease'
            }}
          />
          {totalCategorySum > 0 ? (
            <div className="space-y-2 w-full">
              {categories.map((cat) => {
                const value = categoryTotals[cat];
                const percent = ((value / totalCategorySum) * 100).toFixed(1);
                return (
                  <div key={cat} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }} />
                      <span className="text-slate-700">{cat}</span>
                    </div>
                    <span className="font-medium text-slate-900">
                      {percent}% ({value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Sem dados para exibir</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-2">Dica Financeira</h3>
            <p className="text-primary-100 leading-relaxed text-sm">
              A maior economia aparece em assinaturas duplicadas e anuncios com baixa conversao. Corte a assinatura redundante antes de reduzir aquisicao.
            </p>
            <div className="mt-5 space-y-3">
              {[
                ['Assinaturas', subscriptionSpend, 'economia vem de ferramenta duplicada'],
                ['Marketing', marketingSpend, 'economia vem de pausar campanhas com CAC alto'],
              ].map(([label, value, detail]) => (
                <div key={label as string} className="rounded-xl bg-white/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="font-mono text-sm font-bold">
                      {(value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-primary-100">{detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-primary-200">Economia potencial</div>
            <div className="text-3xl font-bold">{potentialSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div className="text-xs text-primary-300 mt-1">Renegociando assinatura e pausando anuncios com CAC alto</div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-900">Todas as Despesas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Data</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Descrição</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Categoria</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Valor</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Fonte</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {allExpenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  date={expense.date}
                  description={expense.description}
                  category={expense.category}
                  amount={expense.amount}
                  source={expense.source}
                  onEdit={expense.source === 'Manual' ? () => onEditManual?.(expense.id, {}) : undefined}
                  onDelete={expense.source === 'Manual' ? () => onDeleteManual(expense.id) : undefined}
                />
              ))}
              {allExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Nenhuma despesa cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Viagens: '#3B82F6',
    Assinaturas: '#10B981',
    Comida: '#F59E0B',
    Marketing: '#2563EB',
    Roupas: '#EF4444',
    Gasolina: '#8B5CF6',
    Outros: '#6B7280'
  };
  return colors[category] || '#6B7280';
}

export default ExpenseDashboard;
