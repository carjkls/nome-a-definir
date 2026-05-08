'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DigitalWallet } from '@/components/area-colab/DigitalWallet'
import { PomodoroTimer } from '@/components/area-colab/PomodoroTimer'
import { DailySummaryCards } from '@/components/area-colab/DailySummaryCards'
import { dashboardCards, investments, news, readingMaterials } from '@/lib/prototype-data'
import { ArrowRight, BookOpen } from 'lucide-react'

interface DashboardData {
  balance: number
  bankName: string
  weeklyRevenue: number
  alerts: Array<{ type: string; message: string }>
  quickStats: {
    pendingInvoices: number
    overdueInvoices: number
    upcomingMeetings: number
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/area-colab/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <div className='text-slate-500'>Carregando dashboard...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <div className='text-red-500'>Erro ao carregar dados</div>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary-600">Open Finance dashboard</p>
          <h1 className='mt-1 text-3xl font-extrabold text-slate-950'>Visao inicial do SaaS</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Caixa, agenda, noticias, colaboradores, contabilidade e investimentos organizados para que devs e gestores naveguem no produto sem login.
          </p>
        </div>
        <Link href="/area-colab/resumo" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]">
          Ver resumo do dia <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='lg:col-span-2'>
          <DigitalWallet
            balance={data.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            bankName={data.bankName}
            weeklyRevenue={data.weeklyRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          />
        </div>
        <div>
          <PomodoroTimer />
        </div>
        <div className='bg-white rounded-2xl p-4 border border-slate-100 shadow-sm'>
          <h3 className='font-semibold text-slate-900 mb-3'>Notas do Dev</h3>
          <div className='space-y-2'>
            {data.alerts.length > 0 ? (
              data.alerts.map((alert, idx) => (
                <div key={idx} className={`p-2 rounded-lg text-sm ${alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800' : 'bg-blue-50 text-blue-800'}`}>
                  {alert.message}
                </div>
              ))
            ) : (
              <p className='text-sm text-slate-500'>Nenhum alerta</p>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <Link key={card.href} href={card.href} className="group rounded-2xl border border-slate-100 bg-white p-5 paper-shadow transition-all duration-200 hover:-translate-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{card.label}</p>
            <p className="mt-3 text-2xl font-extrabold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-600">
              Abrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white p-4 rounded-xl border border-slate-100 shadow-sm'>
          <p className='text-sm text-slate-500'>Faturas Pendentes</p>
          <p className='text-2xl font-bold text-slate-900'>{data.quickStats.pendingInvoices}</p>
        </div>
        <div className='bg-white p-4 rounded-xl border border-slate-100 shadow-sm'>
          <p className='text-sm text-slate-500'>Vencidas</p>
          <p className='text-2xl font-bold text-red-600'>{data.quickStats.overdueInvoices}</p>
        </div>
        <div className='bg-white p-4 rounded-xl border border-slate-100 shadow-sm'>
          <p className='text-sm text-slate-500'>Próximas Reuniões</p>
          <p className='text-2xl font-bold text-primary-600'>{data.quickStats.upcomingMeetings}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 paper-shadow">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Alocacao de caixa</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-950">Materiais de leitura e acoes sugeridas</h2>
            </div>
            <BookOpen className="h-5 w-5 text-primary-600" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {readingMaterials.map((material) => (
              <details key={material.title} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all open:bg-white open:shadow-lg">
                <summary className="cursor-pointer list-none">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600">{material.type}</span>
                  <p className="mt-2 font-bold text-slate-900">{material.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{material.minutes} min de leitura</p>
                </summary>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Material aberto com orientacoes praticas para decidir entre liquidez, rendimento e prioridade contabil.
                </p>
              </details>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 paper-shadow">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Invest cards</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950">Top oportunidades</h2>
          <div className="mt-4 space-y-3">
            {investments.slice(-3).reverse().map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.rate} · {item.risk}</p>
                </div>
                <span className="font-mono text-lg font-bold text-primary-600">{item.performanceIndex.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-800 shadow-xl overflow-hidden'>
        <div className='p-6 border-b border-slate-700/50 flex justify-between items-center'>
          <div>
            <h3 className='font-bold text-white text-lg flex items-center gap-2'>
              <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse'></span>
              Mercado Financeiro
            </h3>
            <p className='text-slate-400 text-sm mt-1'>Algoritmo de Notícias Inteligente</p>
          </div>
          <div className='text-right'>
            <div className='text-emerald-400 font-medium'>IBOV +1.24%</div>
            <div className='text-slate-400 text-xs'>Atualizado há 2 min</div>
          </div>
        </div>
        
        <div className='divide-y divide-slate-700/50'>
          {news.slice(0, 3).map((item) => (
            <div key={item.id} className='p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group flex items-start gap-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-blue-300'>{item.category}</span>
                  <span className='text-xs text-slate-500'>Hoje</span>
                </div>
                <p className='text-slate-200 group-hover:text-blue-400 transition-colors font-medium leading-relaxed'>{item.title}</p>
              </div>
              <div className='text-slate-500 group-hover:translate-x-1 transition-transform'>
                →
              </div>
            </div>
          ))}
        </div>
        
        <div className='p-4 bg-slate-900/50 text-center'>
          <button className='text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors'>
            Carregar mais notícias do algoritmo
          </button>
        </div>
      </div>
      <DailySummaryCards />
    </div>
  )
}
