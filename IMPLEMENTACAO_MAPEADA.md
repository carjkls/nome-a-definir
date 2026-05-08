# Implementação mapeada das tasks para base de código

## O que já está pronto nesta base

- Autenticação básica para empresários (cadastro/login JWT).
- Lançamentos financeiros (entrada/saída por categoria).
- Resumo executivo de caixa (receitas, despesas, saldo e risco simples).
- Projeção inicial de fluxo de caixa em 3 meses.
- Estrutura inicial para painel web e integração futura com WhatsApp/N8N.

## Como isso conversa com os documentos do repositório

- `01-VISÃO_GERAL.md`: visão de produto e dor principal.
- `02-FUNCIONALIDADES_E_BRAINSTORMING.md`: funcionalidades priorizadas no MVP.
- `03-ARQUITETURA_TECNICA.md`: estrutura técnica aplicada aqui (API + frontend + automação).
- `04-INTEGRACAO_WHATSAPP_N8N.md`: base do fluxo n8n para CFO via WhatsApp.
- `07-ROADMAP_DETALHADO.md`: próximos incrementos da base.

## Próximos componentes recomendados

1. Banco relacional com Prisma e migrations.
2. Multi-tenant (empresa > usuários).
3. Cobrança automática e score de inadimplência por cliente.
4. Motor de notícias setoriais com ranking de impacto no caixa.
5. Alertas automáticos no WhatsApp com IA.