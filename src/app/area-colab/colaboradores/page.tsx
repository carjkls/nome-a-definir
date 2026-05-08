import { CheckCircle2, MessageSquareWarning, TrendingUp, Users } from 'lucide-react';
import { employees } from '@/lib/prototype-data';

function RadarChart() {
  const points = '120,34 198,80 184,170 120,214 52,172 40,82';
  const area = '120,58 176,92 166,154 120,190 72,154 62,96';

  return (
    <div className="relative mx-auto h-[260px] w-[260px]">
      <svg viewBox="0 0 240 240" className="h-60 w-60">
        {[1, 0.72, 0.44].map((scale) => (
          <polygon
            key={scale}
            points={points}
            transform={`translate(${120 - 120 * scale} ${120 - 120 * scale}) scale(${scale})`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        <line x1="120" y1="120" x2="120" y2="34" stroke="#e2e8f0" />
        <line x1="120" y1="120" x2="198" y2="80" stroke="#e2e8f0" />
        <line x1="120" y1="120" x2="184" y2="170" stroke="#e2e8f0" />
        <line x1="120" y1="120" x2="120" y2="214" stroke="#e2e8f0" />
        <line x1="120" y1="120" x2="52" y2="172" stroke="#e2e8f0" />
        <line x1="120" y1="120" x2="40" y2="82" stroke="#e2e8f0" />
        <polygon points={area} fill="rgba(37, 99, 235, 0.2)" stroke="#2563eb" strokeWidth="2" />
      </svg>
      {[
        ['Contratos', 'left-[94px] top-0'],
        ['Vendas', 'right-0 top-[54px]'],
        ['Reunioes', 'right-1 bottom-[62px]'],
        ['Calls', 'bottom-0 left-[108px]'],
        ['CRM', 'bottom-[62px] left-0'],
        ['Margem', 'left-1 top-[54px]'],
      ].map(([label, position]) => (
        <span key={label} className={`absolute ${position} text-[10px] font-bold uppercase tracking-widest text-slate-400`}>
          {label}
        </span>
      ))}
    </div>
  );
}

export default function ColaboradoresPage() {
  const employee = employees[0];

  return (
    <div className="mx-auto max-w-[960px]">
      <div className="paper-shadow rounded-[24px] border border-slate-100 bg-white p-8 font-jakarta">
        <header className="flex flex-col gap-6 border-b border-slate-100 pb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <img src={employee.avatar} alt={employee.name} className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-lg" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Relatorio de rendimento</p>
              <h1 className="mt-1 text-[30px] font-extrabold leading-tight text-slate-950">{employee.name}</h1>
              <p className="text-sm font-semibold text-primary-600">{employee.role}</p>
              <div className="mt-4 grid grid-cols-3 gap-5">
                {[
                  ['Data', '04 MAI 2026'],
                  ['Periodo', '30 DIAS'],
                  ['Gestor', 'Joao Vitor'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="m-0 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="m-0 font-mono text-xs font-bold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex w-40 flex-col items-center rounded-2xl bg-primary-600 p-4 text-white shadow-xl shadow-blue-200/50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Overall score</p>
            <p className="font-mono text-4xl font-black">{employee.score.toFixed(1)}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Out of 5.0</p>
          </div>
        </header>

        <section className="grid gap-8 border-b border-slate-100 py-8 lg:grid-cols-[280px_1fr]">
          <RadarChart />
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['Contratos', employee.contracts, 'fechamentos'],
              ['Vendas', employee.sales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'receita atribuida'],
              ['Reunioes', employee.meetings, 'diagnosticos'],
              ['Calls', employee.calls, 'conversas registradas'],
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                <p className="mt-2 font-mono text-2xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{detail}</p>
              </div>
            ))}
            <div className="md:col-span-2">
              <h2 className="mb-4 text-lg font-extrabold text-slate-950">Forcas observadas</h2>
              <ul className="space-y-2.5">
                {employee.strengths.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h2 className="mb-4 text-lg font-extrabold text-slate-950">Riscos e ajustes</h2>
              <ul className="space-y-2.5">
                {employee.weaknesses.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-slate-700">
                    <MessageSquareWarning className="h-4 w-4 shrink-0 text-amber-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <h2 className="mb-4 text-lg font-extrabold text-slate-950">Feedback formal</h2>
          <div className="max-w-3xl space-y-4 text-sm leading-6 text-slate-600">
            <p className="indent-6">A colaboradora apresenta rendimento acima do esperado, com boa disciplina de CRM e alto volume de conversas qualificadas. O principal ganho operacional vem da relacao entre reunioes consultivas e contratos fechados.</p>
            <p className="indent-6">A recomendacao para o proximo ciclo e preservar o ritmo de follow-up, reduzir concessoes comerciais e registrar melhor as objeções que antecedem descontos. Isso tende a elevar margem sem reduzir volume de fechamento.</p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Recomendacao', 'Manter em contas premium', 'bg-primary-50 border-primary-100 text-primary-900'],
            ['Nivel', 'Senior comercial', 'bg-slate-50 border-slate-100 text-slate-900'],
            ['Time', 'Inside sales B2B', 'bg-slate-50 border-slate-100 text-slate-900'],
          ].map(([label, value, className]) => (
            <div key={label} className={`rounded-2xl border p-5 text-center ${className}`}>
              <TrendingUp className="mx-auto mb-3 h-5 w-5" />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</p>
              <p className="mt-2 font-bold">{value}</p>
            </div>
          ))}
        </section>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {employees.slice(1).map((person) => (
          <div key={person.id} className="rounded-2xl border border-slate-100 bg-white p-5 paper-shadow">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-bold text-slate-950">{person.name}</p>
                <p className="text-sm text-slate-500">{person.role} · score {person.score.toFixed(1)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
