'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Calendar,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Newspaper,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/area-colab', icon: LayoutDashboard },
  { label: 'Colaboradores', href: '/area-colab/colaboradores', icon: Users },
  { label: 'Contabilidade', href: '/area-colab/contador', icon: FileText },
  { label: 'Notícias', href: '/area-colab/noticias', icon: Newspaper },
  { label: 'Investimentos', href: '/area-colab/investimentos', icon: Wallet },
  { label: 'Despesas', href: '/area-colab/despesas', icon: Receipt },
  { label: 'Resumo do dia', href: '/area-colab/resumo', icon: BarChart3 },
  { label: 'Agenda', href: '/area-colab/reunioes', icon: Calendar },
  { label: 'Risco Fuzzy', href: '/area-colab/risco-fuzzy', icon: Activity },
];

export default function AreaColabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f8fafc] font-jakarta text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-100 px-6 py-5">
          <Link href="/area-colab" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl shadow-blue-200/50">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="m-0 text-lg font-extrabold leading-tight text-slate-950">EscolaFlux</p>
              <p className="m-0 text-[10px] font-bold uppercase tracking-widest text-slate-400">Developer preview</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                  active ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <div className="rounded-2xl bg-primary-50 p-4 text-primary-900">
            <p className="m-0 text-[10px] font-bold uppercase tracking-widest text-primary-500">Sistema</p>
            <p className="mt-2 text-sm font-semibold">Preview publico sem login ativo para devs e colaboradores.</p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="m-0 text-[10px] font-bold uppercase tracking-widest text-slate-400">SaaS operacional</p>
              <h1 className="m-0 text-lg font-extrabold text-slate-950">Painel para devs, gestores e colaboradores</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">Online</span>
              <div className="hidden -space-x-2 sm:flex">
                {['JV', 'AR', 'HC'].map((initials) => (
                  <span key={initials} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-xs font-bold text-white">
                    {initials}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
