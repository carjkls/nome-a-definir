# EscolaFlux - Area Colab

Dashboard colaborativo em Next.js para area financeira, reunioes, cobrancas,
inadimplencia, investimentos e resumo operacional.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy na Vercel

Este repositorio esta organizado para deploy direto pela Vercel a partir da raiz:

- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: padrao do Next.js

Quando o Supabase estiver criado, configure as variaveis de ambiente na Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Banco de dados

O schema inicial esta em `supabase/migrations/001_initial_schema.sql`.
