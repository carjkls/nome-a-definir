'use client';

import { Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpenseRowProps {
  date: string;
  description: string;
  category: string;
  amount: number;
  source: 'Open Finance' | 'Manual';
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ExpenseRow({
  date,
  description,
  category,
  amount,
  source,
  onEdit,
  onDelete,
  className
}: ExpenseRowProps) {
  const formattedAmount = amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const formattedDate = new Date(date).toLocaleDateString('pt-BR');

  return (
    <tr className={cn('border-b border-slate-100 hover:bg-slate-50 transition-colors', className)}>
      <td className="px-4 py-3 text-sm text-slate-700">{formattedDate}</td>
      <td className="px-4 py-3 text-sm text-slate-900">{description}</td>
      <td className="px-4 py-3 text-sm text-slate-600">
        <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">{category}</span>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-slate-900">{formattedAmount}</td>
      <td className="px-4 py-3 text-sm">
        <span className={cn(
          'px-2 py-1 rounded-full text-xs',
          source === 'Open Finance' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        )}>
          {source}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onEdit}
            className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
