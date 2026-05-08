'use client';

import { Check } from 'lucide-react';
import { daySummary } from '@/lib/prototype-data';

export function DailySummaryCards() {
  return (
    <section className="mx-auto max-w-5xl px-0 py-4 font-sans">
      <div className="mb-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">Resumo do dia</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111] md:text-4xl">Decisoes prontas para salvar e enviar</h2>
      </div>
      <div className="flex flex-col gap-6">
        {daySummary.map((plan) => (
          <div
            key={plan.id}
            className="rounded-[2rem] border border-gray-100/60 bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] md:p-10"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="flex h-full flex-col lg:col-span-5">
                <h3 className="mb-2 text-2xl font-bold tracking-tight">{plan.name}</h3>
                <p className="mb-8 text-sm leading-relaxed text-gray-500">{plan.description}</p>
                <div className="mt-auto">
                  <div className="mb-2 flex flex-wrap items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight text-[#111]">{plan.price}</span>
                    <span className="text-sm font-medium text-gray-500">{plan.note}</span>
                  </div>
                  {plan.alert && <p className="mb-6 text-xs font-medium text-[#FF4F00]">{plan.alert}</p>}
                  <button className="w-full rounded-full bg-black px-6 py-4 font-semibold text-white shadow-[0_12px_24px_-6px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] transition-all duration-300 hover:bg-gray-950 hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-[0.99]">
                    Salvar observacao
                  </button>
                </div>
              </div>
              <div className="relative lg:col-span-7">
                <div className="hidden absolute bottom-0 left-[-1.5rem] top-0 w-px bg-gray-100 lg:block" />
                <div className="mb-8 block h-px w-full bg-gray-100 lg:hidden" />
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF4F00] p-1">
                        <Check className="h-3 w-3 stroke-[3] text-white" />
                      </div>
                      <span className="pt-0.5 text-sm leading-snug text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
