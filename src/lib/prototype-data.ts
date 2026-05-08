export const dashboardCards = [
  { label: 'Colaboradores', value: '18', detail: '+14% em fechamentos', href: '/area-colab/colaboradores' },
  { label: 'Investimentos', value: '7 ativos', detail: 'Performance de 2.1% a 12.8%', href: '/area-colab/investimentos' },
  { label: 'Contabilidade', value: '4 lembretes', detail: '2 prioridades para hoje', href: '/area-colab/contador' },
  { label: 'Notícias', value: '12 leituras', detail: '3 materiais salvos', href: '/area-colab/noticias' },
];

export const employees = [
  {
    id: 'ana',
    name: 'Ana Ribeiro',
    role: 'Gerente Comercial',
    email: 'ana@empresa.dev',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    score: 4.7,
    contracts: 18,
    sales: 248000,
    meetings: 34,
    calls: 89,
    strengths: ['Fechamentos com ciclo 18% menor', 'Alta conversao em calls consultivas', 'Excelente registro de proximos passos'],
    weaknesses: ['Precisa reduzir descontos no fechamento', 'Delegar follow-ups de baixo valor'],
  },
  {
    id: 'marcos',
    name: 'Marcos Lima',
    role: 'Closer',
    email: 'marcos@empresa.dev',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    score: 4.2,
    contracts: 12,
    sales: 173500,
    meetings: 27,
    calls: 61,
    strengths: ['Boa recuperacao de propostas frias', 'Consistencia em reunioes de diagnostico'],
    weaknesses: ['Registrar objeções com mais detalhe', 'Aumentar velocidade de resposta no CRM'],
  },
];

export const accountingMessages = [
  { author: 'Helena Costa', role: 'Contadora', time: '09:14', text: 'Fechei a conciliacao de abril. Preciso validar tres despesas recorrentes antes de enviar a pre-apuracao.', mine: false },
  { author: 'Voce', role: 'Empresario', time: '09:22', text: 'Pode priorizar assinaturas e reembolsos. Vou anexar os comprovantes dos contratos fechados hoje.', mine: true },
  { author: 'Rafael', role: 'Gerente financeiro', time: '10:03', text: 'A economia potencial em ferramentas duplicadas passou de R$ 3.800 no trimestre.', mine: false },
  { author: 'Voce', role: 'Empresario', time: '10:11', text: 'Salva essa observacao no resumo do dia e envia para a pasta do contador.', mine: true },
];

export const notifications = [
  'Enviar comprovantes das reunioes B2B',
  'Validar contratos com split de comissao',
  'Responder lembrete de DAS ate 17h',
];

export const news = [
  {
    id: 'n1',
    category: 'Mercado',
    title: 'Credito para PMEs cresce com novas linhas atreladas ao Open Finance',
    summary: 'Instituicoes passam a usar dados transacionais para reduzir juros e antecipar analises de risco.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    author: 'Livia Monteiro',
    credential: 'Analista de economia digital',
  },
  {
    id: 'n2',
    category: 'Vendas',
    title: 'Times comerciais adotam score de reuniao para prever fechamento',
    summary: 'Empresas combinam ata, follow-up e origem de receita para medir produtividade por colaborador.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
    author: 'Carlos Neri',
    credential: 'Editor de negocios',
  },
  {
    id: 'n3',
    category: 'Tributos',
    title: 'Contadores pedem rotina compartilhada de lembretes fiscais',
    summary: 'Alertas integrados reduzem atraso no envio de documentos e aumentam previsibilidade de caixa.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80',
    author: 'Priscila Dias',
    credential: 'Especialista fiscal',
  },
  {
    id: 'n4',
    category: 'Investimentos',
    title: 'Caixa parado vira pauta em empresas com saldos distribuídos',
    summary: 'Leituras diarias ajudam donos a decidir entre liquidez, CDI e vencimentos curtos.',
    image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=900&q=80',
    author: 'Renan Castro',
    credential: 'Estrategista de carteira',
  },
];

export const readingMaterials = [
  { title: 'Checklist fiscal da semana', type: 'PDF', minutes: 8 },
  { title: 'Podcast: caixa e margem', type: 'Audio', minutes: 21 },
  { title: 'Guia de leitura do mercado', type: 'Doc', minutes: 12 },
];

export const investments = [
  { id: 'tesouro', name: 'Tesouro Selic 2029', bank: 'Open Finance', type: 'Liquidez', performanceIndex: 2.1, rate: 'CDI + 0.1%', amount: 28000, risk: 'Baixo', note: 'Reserva operacional com baixa volatilidade.' },
  { id: 'cdb-banco-a', name: 'CDB Banco Alfa', bank: 'Banco Alfa', type: 'Renda fixa', performanceIndex: 4.8, rate: '104% CDI', amount: 42000, risk: 'Baixo', note: 'Bom para caixa com uso em ate 90 dias.' },
  { id: 'fundo-caixa', name: 'Fundo Caixa Premium', bank: 'Hub Invest', type: 'Fundo DI', performanceIndex: 7.4, rate: '108% CDI', amount: 36000, risk: 'Medio', note: 'Compensa quando o saldo passa de R$ 30 mil.' },
  { id: 'lci', name: 'LCI Empresarial', bank: 'Banco Sul', type: 'Isento IR', performanceIndex: 9.2, rate: '92% CDI isento', amount: 22000, risk: 'Medio', note: 'Aumenta eficiencia liquida em caixa previsivel.' },
  { id: 'credito', name: 'Credito privado curto', bank: 'Asset Connect', type: 'Credito', performanceIndex: 12.8, rate: 'CDI + 2.6%', amount: 18000, risk: 'Alto', note: 'Maior retorno para excedente fora do operacional.' },
];

export const expenses = [
  { id: 'of1', date: '2026-05-03', description: 'Assinatura CRM duplicada', amount: 1280, category: 'Assinaturas', source: 'Open Finance' as const, bank: 'Inter' },
  { id: 'of2', date: '2026-05-02', description: 'Anuncios de baixa conversao', amount: 3420, category: 'Marketing', source: 'Open Finance' as const, bank: 'Nubank' },
  { id: 'of3', date: '2026-05-01', description: 'Reembolso viagens comerciais', amount: 980, category: 'Viagens', source: 'Open Finance' as const, bank: 'Itau' },
];

export const daySummary = [
  {
    id: 'cash',
    name: 'Caixa perdido',
    description: 'Onde o dinheiro ficou parado ou saiu sem retorno claro.',
    price: 'R$ 7.420',
    note: 'principal impacto do dia',
    alert: 'R$ 3.800 ligados a ferramentas duplicadas.',
    features: ['CRM duplicado identificado em Open Finance', 'Campanha com CAC 28% acima da media', 'Saldo sem rendimento por 11 dias'],
  },
  {
    id: 'market',
    name: 'Mercado do usuario',
    description: 'Noticias que afetam operacao, vendas e fluxo financeiro.',
    price: '3 sinais',
    note: 'para acompanhar',
    features: ['Credito PME mais barato via dados abertos', 'Concorrentes aumentando investimento em inside sales', 'Mudanca fiscal exige comprovantes organizados'],
  },
  {
    id: 'meetings',
    name: 'Reunioes e contador',
    description: 'Decisoes do dia prontas para salvar e enviar.',
    price: '6 notas',
    note: 'registradas',
    features: ['Enviar comprovantes de contratos fechados', 'Separar despesas de reembolso', 'Priorizar economia em assinaturas'],
  },
];
