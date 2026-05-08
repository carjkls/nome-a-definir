import { TrendingUp, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvestmentCardProps {
  type: string;
  bank?: string;
  rate: string;
  minAmount: number;
  risk: 'Muito Baixo' | 'Baixo' | 'Moderado' | 'Alto';
  return: string;
  reason: string;
  action: string;
  when: string;
  how: string;
  onApply?: () => void;
  className?: string;
}

export function InvestmentCard({
  type,
  bank,
  rate,
  minAmount,
  risk,
  return: expectedReturn,
  reason,
  action,
  when,
  how,
  onApply,
  className
}: InvestmentCardProps) {
  const riskColors: Record<string, string> = {
    'Muito Baixo': 'bg-green-100 text-green-800',
    Baixo: 'bg-blue-100 text-blue-800',
    Moderado: 'bg-yellow-100 text-yellow-800',
    Alto: 'bg-red-100 text-red-800'
  };

  return (
    <div className={cn('bg-white rounded-2xl p-6 shadow-sm border border-slate-100', className)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{type}</h3>
          {bank && <p className="text-sm text-slate-500">{bank}</p>}
        </div>
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', riskColors[risk] || 'bg-gray-100')}>
          {risk}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp size={16} className="text-primary-600" />
          <span className="text-slate-700">Retorno esperado: </span>
          <span className="font-semibold text-slate-900">{expectedReturn}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-700">Taxa: </span>
          <span className="font-semibold text-slate-900">{rate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock size={16} className="text-primary-600" />
          <span className="text-slate-700">Quando: </span>
          <span className="font-semibold text-slate-900">{when}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={16} className="text-primary-600" />
          <span className="text-slate-700">Como: </span>
          <span className="font-semibold text-slate-900">{how}</span>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-slate-600">
          <span className="font-semibold">Por quê: </span>
          {reason}
        </p>
      </div>

      <div className="text-xs text-slate-400 mb-4">
        Valor mínimo: R$ {minAmount.toLocaleString('pt-BR')}
      </div>

      <button
        onClick={onApply}
        className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
      >
        Aplicar agora
      </button>
    </div>
  );
}
