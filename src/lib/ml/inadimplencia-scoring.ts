/**
 * Score de Inadimplência - Algoritmo de cálculo
 *
 * Fórmula ponderada baseada em:
 * - Histórico de pagamento (30%)
 * - Valor da mensalidade vs média (25%)
 * - Dias de atraso atual (20%)
 * - Resposta a cobranças anteriores (15%)
 * - Tempo como cliente (10%)
 *
 * Score final: 1-100
 * Zonas de risco:
 * - 1-39: Seguro (verde)
 * - 40-69: Alerta (amarelo)
 * - 70-100: Crítico (vermelho)
 */

export type ScoreFactors = {
  historicoAtrasos: number; // 0-20 pontos
  valorRelativo: number; // 0-25 pontos
  diasAtraso: number; // 0-20 pontos
  respostaCobrancas: number; // 0-15 pontos
  tempoCliente: number; // 0-10 pontos
  scoreFinal: number; // 1-100
  zonaRisco: 'Seguro' | 'Alerta' | 'Critico';
};

export type ClienteScoringInput = {
  clienteId: string;
  valorMensalidade: number;
  mediaMensalidadeEmpresa: number;
  historicoTransacoes: Array<{
    dataVencimento: Date;
    dataPagamento: Date | null;
    valor: number;
  }>;
  totalCobrancasEnviadas: number;
  cobrancasComResposta: number;
  dataCadastro: Date;
};

const PESOS = {
  historico: 0.30,
  valor: 0.25,
  diasAtraso: 0.20,
  resposta: 0.15,
  tempo: 0.10,
};

export function calcularScoreInadimplencia(input: ClienteScoringInput): ScoreFactors {
  const hoje = new Date();

  // 1. Histórico de atrasos (0-20 pontos normalizado -> 0-30 final)
  const totalTransacoes = input.historicoTransacoes.length;
  const transacoesAtrasadas = input.historicoTransacoes.filter(
    (t) => t.dataPagamento && t.dataVencimento > t.dataPagamento
  ).length;

  const taxaAtrasoHistorico = totalTransacoes > 0 ? transacoesAtrasadas / totalTransacoes : 0;
  const pontosHistorico = Math.min(taxaAtrasoHistorico * 20, 20); // 0-20 pontos

  // 2. Valor da mensalidade vs média (0-25 pontos)
  const ratioValor = input.mediaMensalidadeEmpresa > 0
    ? input.valorMensalidade / input.mediaMensalidadeEmpresa
    : 1;
  // Clientes com valores muito acima da média são risco maior
  let pontosValor = 0;
  if (ratioValor <= 0.5) pontosValor = 5;
  else if (ratioValor <= 0.8) pontosValor = 10;
  else if (ratioValor <= 1.0) pontosValor = 15;
  else if (ratioValor <= 1.5) pontosValor = 20;
  else pontosValor = 25;

  // 3. Dias de atraso atual (0-20 pontos)
  // Verificar se a última transação (receita) está atrasada
  const ultimaTransacao = input.historicoTransacoes[input.historicoTransacoes.length - 1];
  let diasAtraso = 0;

  if (ultimaTransacao && !ultimaTransacao.dataPagamento) {
    const diff = Math.floor(
      (hoje.getTime() - new Date(ultimaTransacao.dataVencimento).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    diasAtraso = Math.max(0, diff);
  }

  const pontosDiasAtraso = Math.min((diasAtraso / 30) * 20, 20); // 0-20 pontos (máx 30 dias = 20 pts)

  // 4. Resposta a cobranças anteriores (0-15 pontos)
  let pontosResposta = 0;
  if (input.totalCobrancasEnviadas > 0) {
    const taxaResposta = input.cobrancasComResposta / input.totalCobrancasEnviadas;
    pontosResposta = (1 - taxaResposta) * 15; // 0-15 pontos (menos resposta = mais risco)
  }

  // 5. Tempo como cliente (0-10 pontos)
  const mesesComoCliente =
    (hoje.getTime() - new Date(input.dataCadastro).getTime()) /
    (1000 * 60 * 60 * 24 * 30);
  let pontosTempo = 0;
  if (mesesComoCliente < 3) pontosTempo = 10; // Novo = risco alto
  else if (mesesComoCliente < 6) pontosTempo = 7;
  else if (mesesComoCliente < 12) pontosTempo = 4;
  else pontosTempo = 0; // Cliente antigo e fiel = baixo risco

  // Aplicar pesos
  const scoreBruto =
    pontosHistorico * PESOS.historico +
    pontosValor * PESOS.valor +
    pontosDiasAtraso * PESOS.diasAtraso +
    pontosResposta * PESOS.resposta +
    pontosTempo * PESOS.tempo;

  // Escalar para 1-100
  const scoreFinal = Math.min(Math.max(Math.round(scoreBruto * 2.5), 1), 100);

  // Determinar zona de risco
  let zonaRisco: ScoreFactors['zonaRisco'] = 'Seguro';
  if (scoreFinal >= 70) zonaRisco = 'Critico';
  else if (scoreFinal >= 40) zonaRisco = 'Alerta';

  return {
    historicoAtrasos: Math.round(pontosHistorico),
    valorRelativo: Math.round(pontosValor),
    diasAtraso: Math.round(pontosDiasAtraso),
    respostaCobrancas: Math.round(pontosResposta),
    tempoCliente: Math.round(pontosTempo),
    scoreFinal,
    zonaRisco,
  };
}

/**
 * Calcular score para um cliente usando dados do banco
 */
export async function calcularScoreParaCliente(
  empresaId: string,
  clienteId: string,
  transacoes: any[],
  configuracoes?: any
): Promise<ScoreFactors> {
  // Filtrar transações de receita do cliente
  const receitasCliente = transacoes.filter(
    (t) => t.tipo === 'receita' && t.cliente_id === clienteId
  );

  // Calcular média de mensalidades da empresa
  const todasReceitas = transacoes.filter((t) => t.tipo === 'receita');
  const somaMensalidades = todasReceitas.reduce((acc, t) => acc + t.valor, 0);
  const mediaMensalidadeEmpresa =
    todasReceitas.length > 0 ? somaMensalidades / todasReceitas.length : 0;

  // Encontrar valor da "mensalidade" do cliente (última receita ou média)
  const valorMensalidade = receitasCliente.length > 0
    ? receitasCliente[receitasCliente.length - 1].valor
    : 0;

  // Buscar contagem de cobranças enviadas
  // (isso viria do banco, aqui mockamos por enquanto)
  const totalCobrancasEnviadas = 0;
  const cobrancasComResposta = 0;

  // Data de cadastro (precisamos buscar do banco, mock por enquanto)
  const dataCadastro = new Date(); // TODO: buscar do banco

  const input: ClienteScoringInput = {
    clienteId,
    valorMensalidade,
    mediaMensalidadeEmpresa,
    historicoTransacoes: receitasCliente.map((t) => ({
      dataVencimento: new Date(t.data_vencimento),
      dataPagamento: t.data_pagamento ? new Date(t.data_pagamento) : null,
      valor: t.valor,
    })),
    totalCobrancasEnviadas,
    cobrancasComResposta,
    dataCadastro,
  };

  return calcularScoreInadimplencia(input);
}

/**
 * Calcular scores para todos os clientes de uma empresa
 */
export async function recalcularTodosScores(
  empresaId: string,
  supabase: any
): Promise<{ clienteId: string; score: ScoreFactors }[]> {
  // Buscar todos os clientes da empresa
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id')
    .eq('empresa_id', empresaId);

  if (!clientes || clientes.length === 0) {
    return [];
  }

  // Buscar todas as transações da empresa
  const { data: transacoes } = await supabase
    .from('transacoes')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('tipo', 'receita');

  // Buscar configurações da empresa
  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('empresa_id', empresaId)
    .single();

  const resultados = [];

  for (const cliente of clientes) {
    const score = await calcularScoreParaCliente(
      empresaId,
      cliente.id,
      transacoes || [],
      config
    );
    resultados.push({ clienteId: cliente.id, score });
  }

  return resultados;
}

export function getCorZonaRisco(zona: ScoreFactors['zonaRisco']): string {
  switch (zona) {
    case 'Seguro':
      return '#15803d'; // green-600
    case 'Alerta':
      return '#ca8a04'; // yellow-600
    case 'Critico':
      return '#dc2626'; // red-600
    default:
      return '#6b7280';
  }
}

export function getBgColorZonaRisco(zona: ScoreFactors['zonaRisco']): string {
  switch (zona) {
    case 'Seguro':
      return 'bg-green-50 border-green-200';
    case 'Alerta':
      return 'bg-yellow-50 border-yellow-200';
    case 'Critico':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-slate-50 border-slate-200';
  }
}

export function getTextColorZonaRisco(zona: ScoreFactors['zonaRisco']): string {
  switch (zona) {
    case 'Seguro':
      return 'text-green-700';
    case 'Alerta':
      return 'text-yellow-700';
    case 'Critico':
      return 'text-red-700';
    default:
      return 'text-slate-700';
  }
}
