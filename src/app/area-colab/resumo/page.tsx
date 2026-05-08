import { DailySummaryCards } from '@/components/area-colab/DailySummaryCards';

export default function ResumoPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">Daily command center</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-950">Resumo do dia</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Caixa perdido, noticias do mercado, reunioes discutidas e observacoes prontas para enviar ao contador.
        </p>
      </div>
      <DailySummaryCards />
    </div>
  );
}
