'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CalendarDays, LineChart, RefreshCw, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RiskFuzzyResult, RiskPoint } from '@/lib/risco-fuzzy';

const today = new Date().toISOString().slice(0, 10);

type FormState = {
  ticker: string;
  start: string;
  end: string;
  sigma: number;
};

export default function RiscoFuzzyPage() {
  const [form, setForm] = useState<FormState>({
    ticker: 'PETR4.SA',
    start: '2020-01-01',
    end: today,
    sigma: 1.2,
  });
  const [submitted, setSubmitted] = useState(form);
  const [data, setData] = useState<RiskFuzzyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      ticker: submitted.ticker,
      start: submitted.start,
      end: submitted.end,
      sigma: String(submitted.sigma),
    });

    setLoading(true);
    setError(null);

    fetch(`/api/area-colab/risco-fuzzy?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message ?? 'Nao foi possivel calcular o risco fuzzy.');
        }

        return payload as RiskFuzzyResult;
      })
      .then(setData)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setData(null);
          setError(err instanceof Error ? err.message : 'Erro inesperado.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [submitted]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted({
      ...form,
      ticker: form.ticker.trim().toUpperCase(),
    });
  };

  const latest = data?.series.at(-1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
            <ShieldCheck size={16} />
            Risco quantitativo
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">FUZZIO - Risco Fuzzy</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Analise volatilidade historica e zonas de risco para apoiar decisoes financeiras do negocio.
            Os dados sao informativos e nao constituem recomendacao de investimento.
          </p>
        </div>

        {data && (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            Fonte: {data.metadata.source} · Sigma {data.metadata.sigma.toFixed(2)}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5"
      >
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ativo</span>
          <input
            value={form.ticker}
            onChange={(event) => setForm((current) => ({ ...current, ticker: event.target.value }))}
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="PETR4.SA"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inicio</span>
          <input
            type="date"
            value={form.start}
            onChange={(event) => setForm((current) => ({ ...current, start: event.target.value }))}
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fim</span>
          <input
            type="date"
            value={form.end}
            onChange={(event) => setForm((current) => ({ ...current, end: event.target.value }))}
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sigma: {form.sigma.toFixed(2)}
          </span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={form.sigma}
            onChange={(event) => setForm((current) => ({ ...current, sigma: Number(event.target.value) }))}
            className="h-11 w-full accent-primary-600"
          />
        </label>

        <button
          type="submit"
          className="mt-1 inline-flex h-11 items-center justify-center gap-2 self-end rounded-md bg-primary-600 px-4 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          <RefreshCw size={16} className={cn(loading && 'animate-spin')} />
          Atualizar
        </button>
      </form>

      {loading && (
        <div className="flex min-h-80 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500 shadow-sm">
          Calculando risco fuzzy...
        </div>
      )}

      {!loading && error && (
        <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <AlertTriangle size={28} />
          <p className="max-w-xl text-sm font-medium">{error}</p>
        </div>
      )}

      {!loading && data && latest && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <MetricCard icon={LineChart} label="Ativo" value={data.ticker} />
            <MetricCard icon={Activity} label="Risco atual" value={`${data.riskNow.toFixed(1)}%`} tone={data.riskZone} />
            <MetricCard icon={ShieldCheck} label="Zona" value={data.riskZone} tone={data.riskZone} />
            <MetricCard icon={Activity} label="Vol. media" value={`${data.averageVolatility.toFixed(2)}%`} />
            <MetricCard icon={CalendarDays} label="Gatilho HHO" value={`${data.hhoGate.toFixed(2)}%`} />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Preco e risco fuzzy</h2>
                <p className="text-sm text-slate-500">
                  Ultima leitura em {formatDate(latest.date)} · fechamento {formatCurrencyish(latest.close)}
                </p>
              </div>
              <RiskLegend />
            </div>
            <RiskChart points={data.series} />
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  tone?: string;
}) {
  const toneClass =
    tone === 'Critico'
      ? 'text-red-700 bg-red-50 border-red-100'
      : tone === 'Alerta'
        ? 'text-yellow-700 bg-yellow-50 border-yellow-100'
        : tone === 'Seguro'
          ? 'text-green-700 bg-green-50 border-green-100'
          : 'text-primary-700 bg-primary-50 border-primary-100';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <span className={cn('rounded-md border p-2', toneClass)}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 truncate text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function RiskLegend() {
  return (
    <div className="flex flex-wrap gap-2 text-xs font-medium">
      <span className="rounded-full bg-green-100 px-2.5 py-1 text-green-800">Seguro &lt; 40</span>
      <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-yellow-800">Alerta 40-74</span>
      <span className="rounded-full bg-red-100 px-2.5 py-1 text-red-800">Critico &gt;= 75</span>
    </div>
  );
}

function RiskChart({ points }: { points: RiskPoint[] }) {
  const chart = useMemo(() => buildChart(points), [points]);

  if (!chart) {
    return (
      <div className="flex h-96 items-center justify-center rounded-md bg-slate-50 text-sm text-slate-500">
        Sem pontos suficientes para desenhar o grafico.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-[420px] min-w-[760px] w-full" role="img">
        <rect width={chart.width} height={chart.height} rx="8" fill="#f8fafc" />
        <line x1={chart.padding} x2={chart.width - chart.padding} y1={chart.midY} y2={chart.midY} stroke="#cbd5e1" />
        <line x1={chart.padding} x2={chart.width - chart.padding} y1={chart.riskY(40)} y2={chart.riskY(40)} stroke="#eab308" strokeDasharray="5 5" />
        <line x1={chart.padding} x2={chart.width - chart.padding} y1={chart.riskY(75)} y2={chart.riskY(75)} stroke="#dc2626" strokeDasharray="5 5" />

        {chart.yLabels.map((label) => (
          <g key={label.text}>
            <line x1={chart.padding} x2={chart.width - chart.padding} y1={label.y} y2={label.y} stroke="#e2e8f0" />
            <text x={chart.padding - 12} y={label.y + 4} textAnchor="end" fontSize="11" fill="#64748b">
              {label.text}
            </text>
          </g>
        ))}

        <path d={chart.pricePath} fill="none" stroke="#2563eb" strokeWidth="2" />
        <path d={chart.riskPath} fill="none" stroke="#111827" strokeWidth="2" />
        <path d={`${chart.riskAreaPath} L ${chart.lastX} ${chart.bottomY} L ${chart.padding} ${chart.bottomY} Z`} fill="#7c3aed" opacity="0.12" />

        <text x={chart.padding} y={28} fontSize="12" fontWeight="600" fill="#2563eb">
          Preco
        </text>
        <text x={chart.padding + 70} y={28} fontSize="12" fontWeight="600" fill="#111827">
          Risco fuzzy
        </text>
        <text x={chart.width - chart.padding} y={chart.riskY(75) - 8} textAnchor="end" fontSize="11" fill="#dc2626">
          Critico
        </text>
        <text x={chart.width - chart.padding} y={chart.riskY(40) - 8} textAnchor="end" fontSize="11" fill="#ca8a04">
          Alerta
        </text>

        {chart.xLabels.map((label) => (
          <text key={label.text} x={label.x} y={chart.height - 18} textAnchor="middle" fontSize="11" fill="#64748b">
            {label.text}
          </text>
        ))}
      </svg>
    </div>
  );
}

function buildChart(points: RiskPoint[]) {
  if (points.length < 2) {
    return null;
  }

  const width = 1080;
  const height = 420;
  const padding = 54;
  const topY = 44;
  const midY = 196;
  const bottomY = 360;
  const innerWidth = width - padding * 2;
  const priceValues = points.map((point) => point.close);
  const minPrice = Math.min(...priceValues);
  const maxPrice = Math.max(...priceValues);
  const priceRange = maxPrice - minPrice || 1;
  const xFor = (index: number) => padding + (index / (points.length - 1)) * innerWidth;
  const priceY = (value: number) => midY - 20 - ((value - minPrice) / priceRange) * (midY - topY - 36);
  const riskY = (value: number) => bottomY - (value / 100) * (bottomY - midY - 24);
  const pricePath = pathFor(points, (point, index) => [xFor(index), priceY(point.close)]);
  const riskPath = pathFor(points, (point, index) => [xFor(index), riskY(point.risk)]);
  const riskAreaPath = riskPath;
  const lastX = xFor(points.length - 1);
  const yLabels = [
    { text: `${maxPrice.toFixed(0)}`, y: priceY(maxPrice) },
    { text: `${minPrice.toFixed(0)}`, y: priceY(minPrice) },
    { text: '100%', y: riskY(100) },
    { text: '50%', y: riskY(50) },
    { text: '0%', y: riskY(0) },
  ];
  const labelIndexes = [0, Math.floor(points.length / 2), points.length - 1];
  const xLabels = labelIndexes.map((index) => ({
    text: formatShortDate(points[index].date),
    x: xFor(index),
  }));

  return {
    width,
    height,
    padding,
    midY,
    bottomY,
    lastX,
    pricePath,
    riskPath,
    riskAreaPath,
    riskY,
    yLabels,
    xLabels,
  };
}

function pathFor<T>(items: T[], getPoint: (item: T, index: number) => [number, number]) {
  return items
    .map((item, index) => {
      const [x, y] = getPoint(item, index);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' }).format(new Date(`${value}T00:00:00`));
}

function formatCurrencyish(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
