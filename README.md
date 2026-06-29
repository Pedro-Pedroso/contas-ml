# WXP — Painel de Gestão de Contas

Painel executivo dark-mode para gestão de carteira da WXP.
Stack: **React 18 + Vite + TypeScript** · Backend: **Supabase** (Postgres + Auth).

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm v9 ou superior

## Instalação e uso

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (http://localhost:5173)
npm run dev

# Gerar build de produção (pasta dist/) — roda tsc + vite build
npm run build

# Prévia do build de produção
npm run preview
```

## Backend (Supabase)

Os dados ficam numa tabela `contas` no Supabase. O acesso é controlado por
**Row Level Security** — só usuário autenticado lê e grava. A chave usada no
front é a *publishable key* (segura para ficar no código do site); a proteção
real vem do RLS. URL e chave estão em [`src/lib/supabase.ts`](src/lib/supabase.ts).

A autenticação é por e-mail/senha ([`Login.tsx`](src/components/Login.tsx)); a
sessão é persistida no dispositivo pelo próprio cliente do Supabase.

## Funcionalidades

- **Login** — acesso restrito por e-mail/senha; sessão persistida no dispositivo
- **Visão da carteira** — hero com atingimento global, saldo sobre a meta e contas em risco, mais uma strip de 5 indicadores de segundo nível
- **Tabela de contas** — busca, filtros rápidos (todas / em risco / iniciais / prazo crítico), ordenação e % de meta colorida por faixa
- **Desempenho do time** — assessores rankeados por atingimento, com GMV gerido, crescimento médio e contas expansíveis
- **Cadastro / edição** — modal com campos condicionais por tipo de conta (mensalista × lojista digital)
- **Exportar / Importar CSV** — planilha-modelo em pt-BR; importação faz upsert por nome de cliente, com cabeçalhos flexíveis

## Regras de negócio (resumo)

- **Faturamento considerado**: lojista digital usa os últimos 60 dias; mensalista, os últimos 30.
- **% de meta do lojista**: faturamento e pedidos valem 50% cada (cap por métrica — exceder uma não compensa a outra).
- **Crescimento**: últimos 30 dias vs. os 30 anteriores (derivados de 60d − 30d).
- **Conta inicial**: até 60 dias desde a data de início — fica de fora das médias de atingimento.

Detalhes em [`src/utils/calculations.ts`](src/utils/calculations.ts).

## Estrutura de arquivos

```
src/
  App.tsx                  # Raiz — alterna Login × Dashboard pela sessão
  main.tsx                 # Entry point
  types/index.ts           # Tipagem (Account, TipoConta, StatusConta)
  styles/globals.css       # CSS variables, reset, dark theme
  lib/supabase.ts          # Cliente Supabase
  hooks/useAccounts.ts     # Carga + CRUD das contas no Supabase
  utils/
    calculations.ts        # % meta, crescimento, faixas de cor, formatação
    csv.ts                 # Exportação / importação CSV
  components/
    Dashboard.tsx          # Shell + telas Carteira e Time
    Sidebar.tsx            # Navegação + usuário/logout
    SummaryCards.tsx       # Strip de indicadores
    AccountsTable.tsx      # Tabela com busca, filtros e CSV
    AccountForm.tsx        # Modal de cadastro / edição
    AdvisorView.tsx        # Ranking de assessores
    Primitives.tsx         # Icon, Avatar, Bar, Growth, StatusTag
```

## Deploy

Deploy automático para GitHub Pages a cada push na `main`
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). O `base` do
Vite está configurado como `/contas-ml/`.
