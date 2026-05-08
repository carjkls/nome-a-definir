import { NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server-client';

interface PrevisaoDia {
  data: string;
  otimista: number;
  base: number;
  pessimista: number;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClientSupabase();

    // Verificar auth
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar empresa do usuário
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('empresa_id')
      .eq('auth_id', session.user.id)
      .single();

    if (!usuario?.empresa_id) {
      return NextResponse.json(
        { error: 'Usuário não possui empresa associada' },
        { status: 404 }
      );
    }

    const empresaId = usuario.empresa_id;

    // Buscar saldo atual (receitas pagas - despesas pagas)
    const { data: transacoesPagas } = await supabase
      .from('transacoes')
      .select('tipo, valor')
      .eq('empresa_id', empresaId)
      .in('status', ['pago']);

    const saldoAtual = transacoesPagas?.reduce((acc, t) => {
      return acc + (t.tipo === 'receita' ? t.valor : -t.valor);
    }, 0) || 0;

    // Buscar contas a receber pendentes (futuras)
    const hoje = new Date().toISOString().split('T')[0];
    const { data: contasReceber } = await supabase
      .from('transacoes')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('tipo', 'receita')
      .eq('status', 'pendente')
      .gte('data_vencimento', hoje)
      .order('data_vencimento', { ascending: true });

    // Buscar contas a pagar pendentes (futuras)
    const { data: contasPagar } = await supabase
      .from('transacoes')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('tipo', 'despesa')
      .eq('status', 'pendente')
      .gte('data_vencimento', hoje)
      .order('data_vencimento', { ascending: true });

    // Configuração de dias de previsão
    const diasPrevisao = 90;

    // Gerar datas
    const previsao: PrevisaoDia[] = [];
    const datas: string[] = [];

    for (let i = 0; i < diasPrevisao; i++) {
      const data = new Date();
      data.setDate(data.getDate() + i);
      const dataStr = data.toISOString().split('T')[0];
      datas.push(dataStr);
    }

    // Acumular saldos para cada cenário
    let saldoOtimista = saldoAtual;
    let saldoBase = saldoAtual;
    let saldoPessimista = saldoAtual;

    // Agrupar contas por data
    const receitasPorData = new Map<string, number>();
    const despesasPorData = new Map<string, number>();

    contasReceber?.forEach((c) => {
      const valor = c.valor;
      receitasPorData.set(
        c.data_vencimento,
        (receitasPorData.get(c.data_vencimento) || 0) + valor
      );
    });

    contasPagar?.forEach((c) => {
      const valor = c.valor;
      despesasPorData.set(
        c.data_vencimento,
        (despesasPorData.get(c.data_vencimento) || 0) + valor
      );
    });

    // Calcular para cada dia
    let alertaRombo: { tipo: 'negativo' | 'critico'; dias: number; data: string } | null = null;

    for (let i = 0; i < diasPrevisao; i++) {
      const data = datas[i];

      const receitaDia = receitasPorData.get(data) || 0;
      const despesaDia = despesasPorData.get(data) || 0;

      // Aplicar fatores de cenário
      saldoOtimista += receitaDia * 0.9 - despesaDia * 1.0;
      saldoBase += receitaDia * 0.7 - despesaDia * 1.0;
      saldoPessimista += receitaDia * 0.5 - despesaDia * 1.1;

      previsao.push({
        data,
        otimista: Math.round(saldoOtimista * 100) / 100,
        base: Math.round(saldoBase * 100) / 100,
        pessimista: Math.round(saldoPessimista * 100) / 100,
      });

      // Detectar primeiro rombo no cenário pessimista
      if (!alertaRombo && saldoPessimista < 0) {
        alertaRombo = {
          tipo: 'negativo',
          dias: i + 1,
          data: data,
        };
      }
    }

    // Determinar se é crítico (saldo negativo por mais de 7 dias no pessimista)
    if (alertaRombo) {
      const diasNegativo = previsao.slice(alertaRombo.dias - 1).filter((p) => p.pessimista < 0).length;
      if (diasNegativo >= 7) {
        alertaRombo.tipo = 'critico';
      }
    }

    return NextResponse.json({
      datas: datas.map((d) => d.slice(5)), // MM-DD para exibição
      cenarios: {
        otimista: previsao.map((p) => p.otimista),
        base: previsao.map((p) => p.base),
        pessimista: previsao.map((p) => p.pessimista),
      },
      saldoAtual: Math.round(saldoAtual * 100) / 100,
      alerta: alertaRombo,
    });
  } catch (error) {
    console.error('Erro em GET /api/area-colab/caixa/previsao:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
