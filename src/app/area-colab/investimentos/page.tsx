import { AnimatedInvestmentList } from '@/components/area-colab/AnimatedInvestmentList';
import { investments } from '@/lib/prototype-data';
import { ArrowDownUp, Shield, TrendingUp } from 'lucide-react';

export default function InvestimentosPage() {
  const sorted = [...investments].sort((a, b) => a.performanceIndex - b.performanceIndex);
  const total = investments.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary-600">Open Finance investments</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-950">Investimentos por desempenho</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            A lista esta em ordem crescente: o menor indice aparece primeiro e o maior fica por ultimo.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-5 py-3 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">total monitorado</p>
          <p className="font-mono text-xl font-bold">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <AnimatedInvestmentList items={investments} />

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 paper-shadow">
            <div className="mb-4 flex items-center gap-2">
              <ArrowDownUp className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-extrabold text-slate-950">Ordem aplicada</h2>
            </div>
            <div className="space-y-3">
              {sorted.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{index + 1}. {item.name}</p>
                    <p className="text-xs text-slate-500">{item.bank}</p>
                  </div>
                  <span className="font-mono text-sm font-black text-primary-600">{item.performanceIndex.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 paper-shadow">
              <TrendingUp className="mb-3 h-5 w-5 text-green-600" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">maior indice</p>
              <p className="mt-2 font-mono text-2xl font-black text-slate-950">{sorted.at(-1)?.performanceIndex.toFixed(1)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 paper-shadow">
              <Shield className="mb-3 h-5 w-5 text-primary-600" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">menor risco</p>
              <p className="mt-2 font-mono text-2xl font-black text-slate-950">Baixo</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
