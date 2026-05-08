'use client';

import { useEffect, useState } from 'react';
import { ClienteRiskTable } from '@/components/inadimplencia/ClientRiskTable';
import { RiskScoreCard } from '@/components/inadimplencia/RiskScoreCard';
import { calcularScoreParaCliente, ScoreFactors } from '@/lib/ml/inadimplencia-scoring';

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  valorMensalidade: number;
  dataCadastro: string;
}

export default function InadimplenciaPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [scores, setScores] = useState<Map<string, ScoreFactors>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientesRes] = await Promise.all([
        fetch('/api/area-colab/clientes'),
      ]);

      if (!clientesRes.ok) {
        throw new Error('Erro ao carregar clientes');
      }

      const clientesData = await clientesRes.json();
      setClientes(clientesData);

      // Calcular scores para todos os clientes
      if (clientesData.length > 0) {
        const scoresMap = new Map<string, ScoreFactors>();

        for (const cliente of clientesData) {
          // Mock: buscar transações (precisamos implementar API real)
          const transacoesMock: any[] = []; // TODO: fetch da API

          const score = await calcularScoreParaCliente(
            'default-empresa', // TODO: pegar empresa do contexto auth
            cliente.id,
            transacoesMock
          );
          scoresMap.set(cliente.id, score);
        }

        setScores(scoresMap);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalcularScore = async (clienteId: string) => {
    try {
      const res = await fetch(`/api/area-colab/inadimplencia/score?cliente_id=${clienteId}`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Erro ao recalcular score');

      const novoScore = await res.json();
      setScores((prev) => new Map(prev.set(clienteId, novoScore)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendWhatsApp = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (cliente) {
      // TODO: implementar envio via API
      alert(`Enviar cobrança via WhatsApp para ${cliente.nome} (${cliente.telefone || 'sem telefone'})`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Score de Inadimplência</h1>
          <p className="text-sm text-slate-600 mt-1">
            Analise o risco de cada cliente e tome ações preventivas
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Atualizar
          </button>
          <button
            onClick={async () => {
              if (confirm('Recalcular scores de todos os clientes?')) {
                // TODO: implementar batch recalculation
                alert('Funcionalidade em desenvolvimento');
              }
            }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            ⚡ Recalcular Todos
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Total de Clientes</p>
          <p className="text-2xl font-bold text-slate-900">{clientes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
          <p className="text-sm text-red-600">Risco Crítico</p>
          <p className="text-2xl font-bold text-red-600">
            {Array.from(scores.values()).filter((s) => s.zonaRisco === 'Critico').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm">
          <p className="text-sm text-yellow-600">Risco de Alerta</p>
          <p className="text-2xl font-bold text-yellow-600">
            {Array.from(scores.values()).filter((s) => s.zonaRisco === 'Alerta').length}
          </p>
        </div>
      </div>

      {/* Detalhe do Cliente Selecionado */}
      {selectedCliente && scores.get(selectedCliente.id) && (
        <div className="mb-6">
          <RiskScoreCard
            clienteNome={selectedCliente.nome}
            score={scores.get(selectedCliente.id)!}
          />
        </div>
      )}

      {/* Tabela de Clientes */}
      <ClienteRiskTable
        clientes={clientes}
        scores={scores}
        onSendWhatsApp={handleSendWhatsApp}
        onViewDetails={(clienteId) => setSelectedCliente(clientes.find((cliente) => cliente.id === clienteId) ?? null)}
        loading={loading}
      />

      {/* Alertas e Sugestões */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
        <h3 className="font-bold text-amber-900 mb-3">💡 Sugestões de Ação</h3>
        <ul className="space-y-2 text-sm text-amber-800">
          <li>
            • <strong>Score &gt; 70:</strong> Cliente em risco crítico. Envie cobrança imediatamente
            via WhatsApp e considere desconto para pagamento à vista.
          </li>
          <li>
            • <strong>Score 40-69:</strong> Monitorar. Aumente frequência de comunicação.
          </li>
          <li>
            • <strong>Score &lt; 40:</strong> Cliente saudável. Pode oferecer benefícios para fidelização.
          </li>
        </ul>
      </div>
    </div>
  );
}
