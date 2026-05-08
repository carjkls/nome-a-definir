'use client';

import { ScoreFactors } from '@/lib/ml/inadimplencia-scoring';
import { cn } from '@/lib/utils';

interface RiskScoreCardProps {
  score: ScoreFactors;
  clienteNome: string;
  className?: string;
}

export function RiskScoreCard({ score, clienteNome, className }: RiskScoreCardProps) {
  const getCorScore = (score: number) => {
    if (score >= 70) return '#dc2626'; // red-600
    if (score >= 40) return '#ca8a04'; // yellow-600
    return '#15803d'; // green-600
  };

  const getBgColorZona = (zona: ScoreFactors['zonaRisco']) => {
    switch (zona) {
      case 'Seguro': return 'bg-green-50 border-green-200';
      case 'Alerta': return 'bg-yellow-50 border-yellow-200';
      case 'Critico': return 'bg-red-50 border-red-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const getTextColorZona = (zona: ScoreFactors['zonaRisco']) => {
    switch (zona) {
      case 'Seguro': return 'text-green-700';
      case 'Alerta': return 'text-yellow-700';
      case 'Critico': return 'text-red-700';
      default: return 'text-slate-700';
    }
  };

  const fatores = [
    { label: 'Histórico', value: score.historicoAtrasos, max: 20 },
    { label: 'Valor (relativo)', value: score.valorRelativo, max: 25 },
    { label: 'Dias Atraso', value: score.diasAtraso, max: 20 },
    { label: 'Resposta Cobranças', value: score.respostaCobrancas, max: 15 },
    { label: 'Tempo como Cliente', value: score.tempoCliente, max: 10 },
  ];

  return (
    <div className={cn('bg-white rounded-xl border shadow-sm overflow-hidden', className)}>
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900">{clienteNome}</h3>
            <p className="text-sm text-slate-500">Score de Inadimplência</p>
          </div>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: getCorScore(score.scoreFinal) }}
          >
            {score.scoreFinal}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm font-semibold',
              getTextColorZona(score.zonaRisco),
              getBgColorZona(score.zonaRisco)
            )}
          >
            {score.zonaRisco}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-sm text-slate-600 mb-4">
          Breakdown dos fatores que contribuem para o score:
        </p>

        <div className="space-y-3">
          {fatores.map((fator) => {
            const percentage = (fator.value / fator.max) * 100;
            const barColor =
              percentage >= 70 ? 'bg-red-500' :
              percentage >= 40 ? 'bg-yellow-500' : 'bg-green-500';

            return (
              <div key={fator.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-slate-600">{fator.label}</span>
                  <span className="text-xs font-bold text-slate-900">
                    {fator.value}/{fator.max}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', barColor)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700">Score Final</span>
            <span
              className="text-2xl font-bold"
              style={{ color: getCorScore(score.scoreFinal) }}
            >
              {score.scoreFinal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
