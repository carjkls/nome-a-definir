-- EscolaFlux - Schema Inicial do Banco de Dados
-- Supabase PostgreSQL

-- Habilitar RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;

-- ============================================
-- Tabela: empresas
-- ============================================
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  segmento VARCHAR(100), -- 'educacao', 'energia_solar', 'construcao', 'ong', 'comercio', 'servicos'
  setup_completo BOOLEAN DEFAULT FALSE,
  plano VARCHAR(50) DEFAULT 'freemium', -- 'freemium', 'essential', 'professional', 'enterprise'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Tabela: usuarios
-- ============================================
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  cargo VARCHAR(100), -- 'owner', 'cfo', 'financeiro', 'gestor'
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Tabela: clientes
-- ============================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  cnpj_cpf VARCHAR(20),
  segmento VARCHAR(100),
  data_cadastro DATE DEFAULT CURRENT_DATE,
  observacoes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar clientes por empresa rapidamente
CREATE INDEX idx_clientes_empresa_id ON clientes(empresa_id);

-- ============================================
-- Tabela: transacoes
-- (Contas a Receber e Contas a Pagar)
-- ============================================
CREATE TABLE transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria VARCHAR(100) NOT NULL,
  subcategoria VARCHAR(100),
  descricao TEXT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  comprovante_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices importantes para consultas de inadimplência e caixa
CREATE INDEX idx_transacoes_empresa_tipo ON transacoes(empresa_id, tipo);
CREATE INDEX idx_transacoes_vencimento ON transacoes(data_vencimento, status, empresa_id);
CREATE INDEX idx_transacoes_cliente ON transacoes(cliente_id);

-- ============================================
-- Tabela: scores_inadimplencia
-- (Histórico de scores por cliente)
-- ============================================
CREATE TABLE scores_inadimplencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 100),
  zona_risco VARCHAR(20) NOT NULL CHECK (zona_risco IN ('Seguro', 'Alerta', 'Critico')),
  fatores JSONB NOT NULL, -- { historicoAtrasos: 2, valorMensalidade: 1500, ... }
  calculado_em TIMESTAMPTZ DEFAULT NOW(),
  validado_em TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  UNIQUE(empresa_id, cliente_id, calculado_em)
);

CREATE INDEX idx_scores_cliente ON scores_inadimplencia(cliente_id, calculado_em DESC);
CREATE INDEX idx_scores_empresa_risco ON scores_inadimplencia(empresa_id, zona_risco, score);

-- ============================================
-- Tabela: cobrancas
-- (Histórico de cobranças enviadas)
-- ============================================
CREATE TABLE cobrancas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  transacao_id UUID REFERENCES transacoes(id) ON DELETE SET NULL,
  canal VARCHAR(20) NOT NULL CHECK (canal IN ('whatsapp', 'email', 'sms', 'call')),
  template_usado VARCHAR(100),
  mensagem TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'enviado' CHECK (status IN ('enviado', 'entregue', 'lido', 'erro')),
  enviado_em TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_cobrancas_cliente ON cobrancas(cliente_id, enviado_em DESC);
CREATE INDEX idx_cobrancas_status ON cobrancas(status, enviado_em);

-- ============================================
-- Tabela: previsoes_caixa
-- (Previsão de fluxo de caixa)
-- ============================================
CREATE TABLE previsoes_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  data_previsao DATE NOT NULL,
  cenario VARCHAR(20) NOT NULL CHECK (cenario IN ('pessimista', 'base', 'otimista')),
  saldo_previsto DECIMAL(12,2) NOT NULL,
  contas_a_receber_estimadas DECIMAL(12,2),
  contas_a_pagar_estimadas DECIMAL(12,2),
  confianca_score DECIMAL(5,2) BETWEEN 0 AND 100,
  alerta_rombo BOOLEAN DEFAULT FALSE,
  dias_ate_rombo INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_previsoes_empresa_data_cenario ON previsoes_caixa(empresa_id, data_previsao, cenario);
CREATE INDEX idx_previsoes_empresa ON previsoes_caixa(empresa_id, data_previsao DESC);

-- ============================================
-- Tabela: dre_registros
-- (Registros do DRE - Demonstração de Resultados)
-- ============================================
CREATE TABLE dre_registros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('receita_bruta', 'custo_direto', 'despesa_operacional', 'investimento', 'outro')),
  categoria VARCHAR(100) NOT NULL,
  subcategoria VARCHAR(100),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  produto_servico VARCHAR(255),
  valor DECIMAL(12,2) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dre_empresa_periodo ON dre_registros(empresa_id, periodo_inicio, periodo_fim);
CREATE INDEX idx_dre_tipo_categoria ON dre_registros(tipo, categoria);
CREATE INDEX idx_dre_cliente ON dre_registros(cliente_id);

-- ============================================
-- Tabela: open_finance_contas
-- (Contas bancárias conectadas via Open Finance)
-- ============================================
CREATE TABLE open_finance_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  banco_codigo VARCHAR(10) NOT NULL,
  banco_nome VARCHAR(255) NOT NULL,
  agencia VARCHAR(20),
  conta VARCHAR(50),
  tipo_conta VARCHAR(50) NOT NULL, -- 'corrente', 'poupanca', 'investimento'
  token_encrypted TEXT NOT NULL, -- token criptografado
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMPTZ,
  saldo_atual DECIMAL(12,2) DEFAULT 0,
  ultima_sincronizacao TIMESTAMPTZ,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_open_finance_empresa ON open_finance_contas(empresa_id);

-- ============================================
-- Tabela: notificacoes
-- (Log de notificações enviadas - WhatsApp, email, push)
-- ============================================
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'alerta_caixa', 'cobranca', 'projeto_semana', 'obrigacao_fiscal'
  canal VARCHAR(20) NOT NULL CHECK (canal IN ('whatsapp', 'email', 'push')),
  destinatario VARCHAR(255) NOT NULL, -- email ou telefone
  conteudo JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'entregue', 'lido', 'erro')),
  enviado_em TIMESTAMPTZ,
  lido_em TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notificacoes_empresa_status ON notificacoes(empresa_id, status, created_at DESC);

-- ============================================
-- Tabela: projetos_semana
-- (Projeto da Semana - sugestões IA)
-- ============================================
CREATE TABLE projetos_semana (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  data_geracao DATE NOT NULL DEFAULT CURRENT_DATE,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  resumo_executivo TEXT,
  indicadores_chave JSONB NOT NULL, -- { margem: 15.2, inadimplencia: 5.3, ... }
  alertas JSONB DEFAULT '[]',
  oportunidades JSONB DEFAULT '[]',
  acoes_recomendadas JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'gerado' CHECK (status IN ('gerado', 'enviado', 'lido', 'acao_tomada')),
  enviado_ao_contador BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_projeto_semana_empresa_periodo ON projetos_semana(empresa_id, periodo_inicio, periodo_fim);
CREATE INDEX idx_projeto_semana_status ON projetos_semana(status, data_geracao DESC);

-- ============================================
-- Tabela: obrigacoes_fiscais
-- (Checklist de obrigações)
-- ============================================
CREATE TABLE obrigacoes_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'SPED', 'ECF', 'DCTF', 'GIA', 'outro'
  periodicidade VARCHAR(50) NOT NULL, -- 'mensal', 'trimestral', 'anual', 'eventual'
  proximo_vencimento DATE NOT NULL,
  ultima_entregue DATE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'a_vencer', 'concluida', 'atrasada')),
  responsavel VARCHAR(255), -- 'contador', 'empresa'
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_obrigacoes_empresa_vencimento ON obrigacoes_fiscais(empresa_id, proximo_vencimento, status);

-- ============================================
-- Tabela: configuracoes
-- (Configurações por empresa)
-- ============================================
CREATE TABLE configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE UNIQUE,
 RegraParaCobrancaAutomatica JSONB DEFAULT '{"diasAtraso": 1, "template": "lembrete_amigavel"}',
  configNotificacoes JSONB DEFAULT '{"whatsappAtivo": true, "emailAtivo": true}',
  metaReservaEmergencia INTEGER DEFAULT 3, -- meses
  scoreInadimplenciaParams JSONB DEFAULT '{"pesoHistorico": 0.3, "pesoValor": 0.25, "pesoDiasAtraso": 0.2, "pesoResposta": 0.15, "pesoTempoCliente": 0.1}',
  integracaoOpenFinanceAtiva BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Functions e Triggers
-- ============================================

-- Function: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores_inadimplencia FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_previsoes_updated_at BEFORE UPDATE ON previsoes_caixa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dre_updated_at BEFORE UPDATE ON dre_registros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_open_finance_updated_at BEFORE UPDATE ON open_finance_contas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_obrigacoes_updated_at BEFORE UPDATE ON obrigacoes_fiscais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: atualizar status de transações automaticamente
CREATE OR REPLACE FUNCTION update_transacao_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.data_pagamento IS NOT NULL THEN
    NEW.status = 'pago';
  ELSIF NEW.data_vencimento < CURRENT_DATE AND NEW.status != 'cancelado' THEN
    NEW.status = 'atrasado';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transacao_status_trigger BEFORE INSERT OR UPDATE ON transacoes FOR EACH ROW EXECUTE FUNCTION update_transacao_status();

-- ============================================
-- Views úteis
-- ============================================

-- View: Resumo financeiro por empresa
CREATE OR REPLACE VIEW vw_resumo_financeiro AS
SELECT
  e.id as empresa_id,
  COUNT(DISTINCT c.id) as total_clientes,
  COUNT(DISTINCT t.id) as total_transacoes,
  COALESCE(SUM(CASE WHEN t.tipo = 'receita' AND t.status = 'pago' THEN t.valor ELSE 0 END), 0) as total_receitas,
  COALESCE(SUM(CASE WHEN t.tipo = 'despesa' AND t.status = 'pago' THEN t.valor ELSE 0 END), 0) as total_despesas,
  COALESCE(SUM(CASE WHEN t.tipo = 'receita' AND t.status = 'pendente' THEN t.valor ELSE 0 END), 0) as contas_a_receber,
  COALESCE(SUM(CASE WHEN t.tipo = 'despesa' AND t.status = 'pendente' THEN t.valor ELSE 0 END), 0) as contas_a_pagar,
  COALESCE(SUM(CASE WHEN t.tipo = 'receita' AND t.status = 'atrasado' THEN t.valor ELSE 0 END), 0) as contas_atrasadas
FROM empresas e
LEFT JOIN clientes c ON c.empresa_id = e.id
LEFT JOIN transacoes t ON t.empresa_id = e.id
GROUP BY e.id;

-- View: Top clientes em atraso
CREATE OR REPLACE VIEW vw_clientes_atraso AS
SELECT
  c.id as cliente_id,
  c.nome,
  c.empresa_id,
  COUNT(t.id) as total_atrasos,
  COALESCE(SUM(t.valor), 0) as valor_total_atrasado,
  MAX(t.data_vencimento) as ultimo_vencimento,
  COALESCE(AVG(s.score), 0) as score_medio
FROM clientes c
LEFT JOIN transacoes t ON t.cliente_id = c.id AND t.status = 'atrasado' AND t.tipo = 'receita'
LEFT JOIN (
  SELECT cliente_id, empresa_id, AVG(score) as score
  FROM scores_inadimplencia
  GROUP BY cliente_id, empresa_id
) s ON s.cliente_id = c.id AND s.empresa_id = c.empresa_id
WHERE c.empresa_id IS NOT NULL
GROUP BY c.id, c.nome, c.empresa_id
HAVING COALESCE(SUM(t.valor), 0) > 0
ORDER BY valor_total_atrasado DESC;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- Habilitar RLS em todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores_inadimplencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE previsoes_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE dre_registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_finance_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos_semana ENABLE ROW LEVEL SECURITY;
ALTER TABLE obrigacoes_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver/editar apenas dados da própria empresa
CREATE POLICY "Usuarios podem ver dados da propria empresa" ON empresas
  FOR ALL USING (id IN (
    SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Usuarios podem ver clientes da propria empresa" ON clientes
  FOR ALL USING (empresa_id IN (
    SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Usuarios podem ver transacoes da propria empresa" ON transacoes
  FOR ALL USING (empresa_id IN (
    SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Usuarios podem ver scores da propria empresa" ON scores_inadimplencia
  FOR ALL USING (empresa_id IN (
    SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Usuarios podem ver configuracoes da propria empresa" ON configuracoes
  FOR ALL USING (empresa_id IN (
    SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
  ));

-- Todas as outras tabelas seguem o mesmo padrão
CREATE POLICY "Usuarios podem ver dados da propria empresa" ON cobrancas
  FOR ALL USING (empresa_id IN (
    SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Usuarios podem ver dados da propria empresa" ON previsoes_caixa
  FOR ALL USING (empresa_id IN (
    SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Usuarios podem ver dados da propria empresa" ON dre_registros
  FOR ALL USING (empresa_id IN (
    SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Usuarios podem ver dados da propria empresa" ON open_finance_contas
  FOR ALL USING (empresa_id IN (
    SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Usuarios podem ver dados da propria empresa" ON notificacoes
  FOR ALL USING (empresa_id IN (
    SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Usuarios podem ver dados da propria empresa" ON projetos_semana
  FOR ALL USING (empresa_id IN (
    SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Usuarios podem ver dados da propria empresa" ON obrigacoes_fiscais
  FOR ALL USING (empresa_id IN (
    SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
  ));

-- Policy: Usuários podem editar apenas próprios registros
CREATE POLICY "Usuarios podem editar proprios dados" ON usuarios
  FOR ALL USING (auth_id = auth.uid());

COMMIT;

-- ============================================
-- Seed de dados iniciais (opcional)
-- ============================================
-- Inserir segmentos comuns (para uso em dropdowns)
-- Dados podem ser gerenciados via admin panel ou migration separada
