'use client';

import { useEffect, useState } from 'react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  overdueAmount: number;
  invoiceNumber: string;
  dueDate: string;
  daysOverdue: number;
  score: number;
  sector: string;
}

export default function CobrancasPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/area-colab/cobrancas')
      .then(res => res.json())
      .then(data => {
        setClients(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const sendWhatsApp = (client: Client) => {
    const message = `Olá ${client.name.split(' ')[0]}, identificamos um atraso no pagamento da fatura ${client.invoiceNumber} no valor de R$ ${client.overdueAmount.toFixed(2)}. Gostaríamos de regularizar sua situação. Entre em contato conosco.`;
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encoded}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-500">Carregando clientes inadimplentes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Cobranças</h1>

      {/* Simple Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">Inadimplência por Setor</h2>
        <div className="space-y-3">
          {Array.from(new Set(clients.map(c => c.sector))).map(sector => {
            const total = clients
              .filter(c => c.sector === sector)
              .reduce((sum, c) => sum + c.overdueAmount, 0);
            const max = Math.max(...Array.from(new Set(clients.map(c => c.sector)))
              .map(s => clients.filter(c => c.sector === s).reduce((sum, c) => sum + c.overdueAmount, 0)));
            return (
              <div key={sector} className="flex items-center gap-4">
                <span className="w-32 text-sm text-slate-600">{sector}</span>
                <div className="flex-1 bg-slate-200 rounded-full h-6 relative">
                  <div
                    className="bg-primary-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(total / max) * 100}%` }}
                  >
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                      R$ {total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-lg text-slate-900">Clientes Inadimplentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Cliente</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Setor</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Valor Vencido</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Dias Atraso</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Score</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{client.sector}</td>
                  <td className="px-4 py-3 text-sm font-medium text-red-600">
                    R$ {client.overdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{client.daysOverdue}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.score >= 70 ? 'bg-green-100 text-green-800' :
                      client.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {client.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => sendWhatsApp(client)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                    >
                      WhatsApp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
