import { NextRequest, NextResponse } from 'next/server';
import { buildRiskFuzzyResult, parseSigma } from '@/lib/risco-fuzzy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticker = searchParams.get('ticker') ?? '';
  const start = searchParams.get('start') ?? '2020-01-01';
  const end = searchParams.get('end') ?? new Date().toISOString().slice(0, 10);
  const sigma = parseSigma(searchParams.get('sigma'));

  try {
    const result = await buildRiskFuzzyResult({
      ticker,
      start,
      end,
      sigma,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado ao calcular risco fuzzy.';

    return NextResponse.json({ message }, { status: 400 });
  }
}
