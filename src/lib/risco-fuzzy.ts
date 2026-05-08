export type RiskZone = 'Seguro' | 'Alerta' | 'Critico';

export type RiskPoint = {
  date: string;
  close: number;
  returns: number;
  volatility: number;
  risk: number;
};

export type RiskFuzzyResult = {
  ticker: string;
  riskNow: number;
  riskZone: RiskZone;
  riskColor: string;
  averageVolatility: number;
  hhoGate: number;
  series: RiskPoint[];
  metadata: {
    start: string;
    end: string;
    sigma: number;
    source: string;
  };
};

type YahooQuote = {
  timestamp?: number[];
  indicators?: {
    quote?: Array<{
      close?: Array<number | null>;
    }>;
  };
};

type YahooChartResponse = {
  chart?: {
    result?: YahooQuote[];
    error?: { description?: string };
  };
};

const TRADING_DAYS = 252;
const VOLATILITY_WINDOW = 21;
const VOLATILITY_EWM_SPAN = 10;
const RISK_EWM_SPAN = 8;

export function normalizeTicker(ticker: string) {
  return ticker.trim().toUpperCase();
}

export function parseSigma(value: string | null) {
  const parsed = Number(value ?? 1.2);

  if (!Number.isFinite(parsed)) {
    return 1.2;
  }

  return Math.min(2, Math.max(0.5, parsed));
}

export function classifyRisk(risk: number): { zone: RiskZone; color: string } {
  if (risk >= 75) {
    return { zone: 'Critico', color: '#dc2626' };
  }

  if (risk >= 40) {
    return { zone: 'Alerta', color: '#ca8a04' };
  }

  return { zone: 'Seguro', color: '#15803d' };
}

export async function buildRiskFuzzyResult(params: {
  ticker: string;
  start: string;
  end: string;
  sigma: number;
}): Promise<RiskFuzzyResult> {
  const ticker = normalizeTicker(params.ticker);

  if (!ticker) {
    throw new Error('Informe um ticker valido.');
  }

  const startDate = parseDate(params.start, 'Data inicial invalida.');
  const endDate = parseDate(params.end, 'Data final invalida.');

  if (startDate >= endDate) {
    throw new Error('A data inicial deve ser anterior a data final.');
  }

  const quotes = await fetchYahooQuotes(ticker, startDate, endDate);
  const series = calculateSeries(quotes, startDate, endDate, params.sigma);

  if (series.length < 10) {
    throw new Error('Dados insuficientes para o periodo selecionado. Amplie o intervalo de datas.');
  }

  const riskNow = series[series.length - 1].risk;
  const risk = classifyRisk(riskNow);

  return {
    ticker,
    riskNow,
    riskZone: risk.zone,
    riskColor: risk.color,
    averageVolatility: mean(series.map((point) => point.volatility)),
    hhoGate: calculateHhoGate(series.map((point) => point.volatility), params.sigma),
    series,
    metadata: {
      start: toIsoDate(startDate),
      end: toIsoDate(endDate),
      sigma: params.sigma,
      source: 'Yahoo Finance',
    },
  };
}

async function fetchYahooQuotes(ticker: string, startDate: Date, endDate: Date) {
  const bufferedStart = new Date(startDate);
  bufferedStart.setMonth(bufferedStart.getMonth() - 3);

  const period1 = Math.floor(bufferedStart.getTime() / 1000);
  const period2 = Math.floor(endDate.getTime() / 1000);
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}`);

  url.searchParams.set('period1', String(period1));
  url.searchParams.set('period2', String(period2));
  url.searchParams.set('interval', '1d');
  url.searchParams.set('events', 'history');
  url.searchParams.set('includeAdjustedClose', 'true');

  const response = await fetch(url, {
    next: { revalidate: 900 },
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PorquimSaaS/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel consultar o Yahoo Finance agora.');
  }

  const payload = (await response.json()) as YahooChartResponse;
  const error = payload.chart?.error?.description;
  const quote = payload.chart?.result?.[0];
  const timestamps = quote?.timestamp;
  const closes = quote?.indicators?.quote?.[0]?.close;

  if (error) {
    throw new Error(error);
  }

  if (!timestamps?.length || !closes?.length) {
    throw new Error(`Nenhum dado encontrado para ${ticker}. Verifique o ticker.`);
  }

  return timestamps
    .map((timestamp, index) => ({
      date: new Date(timestamp * 1000),
      close: closes[index],
    }))
    .filter((point): point is { date: Date; close: number } =>
      typeof point.close === 'number' && Number.isFinite(point.close) && point.close > 0
    );
}

function calculateSeries(
  quotes: Array<{ date: Date; close: number }>,
  startDate: Date,
  endDate: Date,
  sigma: number
) {
  const withReturns = quotes
    .map((quote, index) => {
      const previous = quotes[index - 1]?.close;
      const returns = previous ? Math.log(quote.close / previous) : Number.NaN;

      return { ...quote, returns };
    })
    .filter((point) => Number.isFinite(point.returns));

  const rollingVolatility = withReturns.map((point, index) => {
    if (index + 1 < VOLATILITY_WINDOW) {
      return Number.NaN;
    }

    const window = withReturns
      .slice(index + 1 - VOLATILITY_WINDOW, index + 1)
      .map((item) => item.returns);
    const volatility = standardDeviation(window) * 100 * Math.sqrt(TRADING_DAYS);

    return volatility;
  });

  const smoothedVolatility = ewm(rollingVolatility, VOLATILITY_EWM_SPAN);
  const filtered = withReturns
    .map((point, index) => ({
      date: point.date,
      close: point.close,
      returns: point.returns,
      volatility: smoothedVolatility[index],
    }))
    .filter(
      (point) =>
        point.date >= startDate &&
        point.date <= endDate &&
        Number.isFinite(point.volatility)
    );

  if (filtered.length < 10) {
    return [];
  }

  const volatilities = filtered.map((point) => point.volatility);
  const hhoGate = calculateHhoGate(volatilities, sigma);
  const vMax = Math.max(Math.max(...volatilities) * 1.5, hhoGate * 2);
  const rawRisks = volatilities.map((volatility) => inferRisk(volatility, hhoGate, vMax));
  const risks = ewm(rawRisks, RISK_EWM_SPAN);

  return filtered.map((point, index) => ({
    date: toIsoDate(point.date),
    close: round(point.close, 2),
    returns: round(point.returns, 6),
    volatility: round(point.volatility, 2),
    risk: round(risks[index], 2),
  }));
}

function inferRisk(volatility: number, hhoGate: number, vMax: number) {
  const clipped = Math.min(Math.max(volatility, 0), vMax);
  const memberships = {
    safe: trapezoid(clipped, 0, 0, hhoGate * 0.4, hhoGate * 0.75),
    alert: triangle(clipped, hhoGate * 0.7, hhoGate, hhoGate * 1.3),
    critical: trapezoid(clipped, hhoGate * 1.1, vMax * 0.7, vMax, vMax),
  };

  let numerator = 0;
  let denominator = 0;

  for (let x = 0; x <= 100; x += 1) {
    const safe = Math.min(memberships.safe, triangle(x, 0, 0, 40));
    const alert = Math.min(memberships.alert, triangle(x, 30, 50, 70));
    const critical = Math.min(memberships.critical, triangle(x, 60, 100, 100));
    const aggregated = Math.max(safe, alert, critical);

    numerator += x * aggregated;
    denominator += aggregated;
  }

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

function triangle(x: number, a: number, b: number, c: number) {
  if (a === b && x <= b) {
    return x === b ? 1 : 0;
  }

  if (b === c && x >= b) {
    return x === b ? 1 : 0;
  }

  if (x <= a || x >= c) {
    return 0;
  }

  if (x === b) {
    return 1;
  }

  return x < b ? (x - a) / (b - a) : (c - x) / (c - b);
}

function trapezoid(x: number, a: number, b: number, c: number, d: number) {
  const values = [a, b, c, d].sort((left, right) => left - right);
  const [left, plateauStart, plateauEnd, right] = values;

  if (x < left || x > right) {
    return 0;
  }

  if (x >= plateauStart && x <= plateauEnd) {
    return 1;
  }

  if (x < plateauStart) {
    return plateauStart === left ? 1 : (x - left) / (plateauStart - left);
  }

  return right === plateauEnd ? 1 : (right - x) / (right - plateauEnd);
}

function ewm(values: number[], span: number) {
  const alpha = 2 / (span + 1);
  let previous: number | null = null;

  return values.map((value) => {
    if (!Number.isFinite(value)) {
      return Number.NaN;
    }

    previous = previous === null ? value : alpha * value + (1 - alpha) * previous;
    return previous;
  });
}

function calculateHhoGate(volatilities: number[], sigma: number) {
  return percentile(volatilities, 75) * sigma;
}

function percentile(values: number[], percentileValue: number) {
  const sorted = values.filter(Number.isFinite).sort((left, right) => left - right);

  if (!sorted.length) {
    throw new Error('A serie de volatilidade esta vazia.');
  }

  const position = (percentileValue / 100) * (sorted.length - 1);
  const lower = Math.floor(position);
  const upper = Math.ceil(position);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = position - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function standardDeviation(values: number[]) {
  const avg = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;

  return Math.sqrt(variance);
}

function mean(values: number[]) {
  const finite = values.filter(Number.isFinite);

  if (!finite.length) {
    return 0;
  }

  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
}

function parseDate(value: string, message: string) {
  const date = new Date(`${value}T00:00:00Z`);

  if (!value || Number.isNaN(date.getTime())) {
    throw new Error(message);
  }

  return date;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}
