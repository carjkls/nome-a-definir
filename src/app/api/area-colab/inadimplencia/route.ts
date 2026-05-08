import { NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server-client';
import { recalcularTodosScores, ScoreFactors } from '@/lib/ml/inadimplencia-scoring';

export async function GET() {
  try {
    const supabase = await createClientSupabase();

    // Verificar auth
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar usuário logado
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

    // Buscar clientes da empresa
    const { data: clientes } = await supabase
      .from('clientes')
      .select('id, nome, email, telefone, data_cadastro')
      .eq('empresa_id', empresaId);

    if (!clientes || clientes.length === 0) {
      return NextResponse.json({ clientes: [], scores: [] });
    }

    // Buscar todas as transações de receita da empresa
    const { data: transacoes } = await supabase
      .from('transacoes')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('tipo', 'receita');

    // Buscar scores já calculados anteriormente
    const { data: scoresDb } = await supabase
      .from('scores_inadimplencia')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('calculado_em', { ascending: false });

    // Manter apenas o score mais recente por cliente
    type ScoreDb = NonNullable<typeof scoresDb>[number];
    const scoresRecentes = new Map<string, ScoreDb>();
    scoresDb?.forEach((score) => {
      if (!scoresRecentes.has(score.cliente_id)) {
        scoresRecentes.set(score.cliente_id, score);
      }
    });

    // Preparar resposta
    const clientesComScore = clientes.map((cliente) => {
      const scoreDb = scoresRecentes.get(cliente.id);
      if (scoreDb) {
        return {
          ...cliente,
          valorMensalidade: 0, // será preenchido depois se necessário
          dataCadastro: cliente.data_cadastro,
          score: {
            scoreFinal: scoreDb.score,
            zonaRisco: scoreDb.zona_risco as any,
            historicoAtrasos: scoreDb.fatores?.historicoAtrasos || 0,
            valorRelativo: scoreDb.fatores?.valorRelativo || 0,
            diasAtraso: scoreDb.fatores?.diasAtraso || 0,
            respostaCobrancas: scoreDb.fatores?.respostaCobrancas || 0,
            tempoCliente: scoreDb.fatores?.tempoCliente || 0,
          },
        };
      }

      // Se não tem score, marcar como null (será calculado sob demanda)
      return {
        ...cliente,
        valorMensalidade: 0,
        dataCadastro: cliente.data_cadastro,
        score: null,
      };
    });

    return NextResponse.json({
      clientes: clientesComScore,
      scores: Array.from(scoresRecentes.values()),
    });
  } catch (error) {
    console.error('Erro em GET /api/area-colab/inadimplencia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClientSupabase();

    // Verificar auth
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar usuário logado
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

    const { cliente_id }: { cliente_id: string } = await request.json();

    if (!cliente_id) {
      return NextResponse.json({ error: 'cliente_id é obrigatório' }, { status: 400 });
    }

    // Buscar transações do cliente
    const { data: transacoes } = await supabase
      .from('transacoes')
      .select('*')
      .eq('empresa_id', usuario.empresa_id)
      .eq('cliente_id', cliente_id)
      .eq('tipo', 'receita');

    // Buscar configurações da empresa
    const { data: config } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('empresa_id', usuario.empresa_id)
      .single();

    // Buscar dados do cliente
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id, data_cadastro')
      .eq('id', cliente_id)
      .single();

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Calcular todas as transações da empresa para média
    const { data: todasTransacoes } = await supabase
      .from('transacoes')
      .select('valor')
      .eq('empresa_id', usuario.empresa_id)
      .eq('tipo', 'receita');

    const somaMensalidades = todasTransacoes?.reduce((acc, t) => acc + t.valor, 0) || 0;
    const mediaMensalidadeEmpresa =
      todasTransacoes && todasTransacoes.length > 0 ? somaMensalidades / todasTransacoes.length : 0;

    // Encontrar valor da mensalidade do cliente (última receita)
    const transacoesCliente = transacoes || [];
    const valorMensalidade = transacoesCliente.length > 0
      ? transacoesCliente[0].valor
      : 0;

    // Mock de cobranças (precisamos implementar tabela real)
    const totalCobrancasEnviadas = 0;
    const cobrancasComResposta = 0;

    // Calcular score
    const { calcularScoreInadimplencia } = await import('@/lib/ml/inadimplencia-scoring');
    const scoreInput = {
      clienteId: cliente.id,
      valorMensalidade,
      mediaMensalidadeEmpresa,
      historicoTransacoes: transacoesCliente.map((t) => ({
        dataVencimento: new Date(t.data_vencimento),
        dataPagamento: t.data_pagamento ? new Date(t.data_pagamento) : null,
        valor: t.valor,
      })),
      totalCobrancasEnviadas,
      cobrancasComResposta,
      dataCadastro: new Date(cliente.data_cadastro),
    };

    const score = calcularScoreInadimplencia(scoreInput);

    // Salvar no banco
    const { error: insertError } = await supabase
      .from('scores_inadimplencia')
      .insert({
        empresa_id: usuario.empresa_id,
        cliente_id: cliente.id,
        score: score.scoreFinal,
        zona_risco: score.zonaRisco,
        fatores: {
          historicoAtrasos: score.historicoAtrasos,
          valorRelativo: score.valorRelativo,
          diasAtraso: score.diasAtraso,
          respostaCobrancas: score.respostaCobrancas,
          tempoCliente: score.tempoCliente,
        },
      });

    if (insertError) {
      console.error('Erro ao salvar score:', insertError);
    }

    return NextResponse.json(score);
  } catch (error) {
    console.error('Erro em POST /api/area-colab/inadimplencia/score:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
