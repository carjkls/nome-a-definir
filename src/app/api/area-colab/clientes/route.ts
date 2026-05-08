import { NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server-client';

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

    // Buscar clientes da empresa
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('id, nome, email, telefone, data_cadastro')
      .eq('empresa_id', usuario.empresa_id)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
    }

    // Buscar última transação de receita para cada cliente (para valor mensalidade)
    const clientesComValor = await Promise.all(
      (clientes || []).map(async (cliente) => {
        const { data: transacoes } = await supabase
          .from('transacoes')
          .select('valor, data_vencimento')
          .eq('empresa_id', usuario.empresa_id)
          .eq('cliente_id', cliente.id)
          .eq('tipo', 'receita')
          .order('data_vencimento', { ascending: false })
          .limit(1);

        const ultimaTransacao = transacoes?.[0];
        return {
          ...cliente,
          valorMensalidade: ultimaTransacao?.valor || 0,
          dataCadastro: cliente.data_cadastro,
        };
      })
    );

    return NextResponse.json(clientesComValor);
  } catch (error) {
    console.error('Erro em GET /api/area-colab/clientes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
