'use client';

import { useState } from 'react';
import { ScoreFactors } from '@/lib/ml/inadimplencia-scoring';
import { cn } from '@/lib/utils';

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  valorMensalidade: number;
}

interface ClienteRiskTableProps {
  clientes: Cliente[];
  scores: Map<string, ScoreFactors>;
  onSendWhatsApp?: (clienteId: string) => void;
  onViewDetails?: (clienteId: string) => void;
  loading?: boolean;
}

export function ClienteRiskTable({
  clientes,
  scores,
  onSendWhatsApp,
  onViewDetails,
  loading,
}: ClienteRiskTableProps) {
  const [filter, setFilter] = useState<'todos' | 'critico' | 'alerta' | 'seguro'>('todos');
  const [sortBy, setSortBy] = useState<'score' | 'valor' | 'nome'>('score');

  const clientesComScore = clientes
    .map((cliente) => ({
      ...cliente,
      score: scores.get(cliente.id),
    }))
    .filter((c) => c.score)
    .filter((c) => {
      if (filter === 'todos') return true;
      return c.score?.zonaRisco.toLowerCase() === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.score?.scoreFinal || 0) - (a.score?.scoreFinal || 0);
      }
      if (sortBy === 'valor') {
        return b.valorMensalidade - a.valorMensalidade;
      }
      return a.nome.localeCompare(b.nome);
    });

  const getBadgeClass = (zona: ScoreFactors['zonaRisco']) => {
    switch (zona) {
      case 'Critico':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Alerta':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Seguro':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Clientes em Análise</h3>
            <p className="text-sm text-slate-500">
              {clientesComScore.length} clientes • ordenados por risco
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="todos">Todos os Níveis</option>
              <option value="critico">Apenas Críticos</option>
              <option value="alerta">Apenas Alerta</option>
              <option value="seguro">Apenas Seguros</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="score">Ordenar por Score</option>
              <option value="valor">Ordenar por Valor</option>
              <option value="nome">Ordenar por Nome</option>
            </select>
          </div>
        </div>
      </div>

      {clientesComScore.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-slate-500">Nenhum cliente encontrado para os filtros selecionados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Zona de Risco
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Valor Mensal
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Dias Atraso
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientesComScore.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{cliente.nome}</p>
                      {cliente.email && (
                        <p className="text-sm text-slate-500">{cliente.email}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'text-xl font-bold',
                        getScoreColor(cliente.score!.scoreFinal)
                      )}
                    >
                      {cliente.score!.scoreFinal}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold border',
                        getBadgeClass(cliente.score!.zonaRisco)
                      )}
                    >
                      {cliente.score!.zonaRisco}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {cliente.valorMensalidade.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-900">
                      {cliente.score!.diasAtraso > 0 ? (
                        <span className="text-red-600">{cliente.score!.diasAtraso} dias</span>
                      ) : (
                        <span className="text-green-600">Em dia</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {onSendWhatsApp && (
                        <button
                          onClick={() => onSendWhatsApp(cliente.id)}
                          className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          WhatsApp
                        </button>
                      )}
                      {onViewDetails && (
                        <button
                          onClick={() => onViewDetails(cliente.id)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          Detalhes
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
