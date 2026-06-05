# WXP — Painel de Gestão de Contas

Painel executivo dark-mode para gestão de contas da WXP.  
Stack: React 18 + Vite + TypeScript | Persistência: localStorage | Sem backend.

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm v9 ou superior

## Instalação e uso

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (http://localhost:5173)
npm run dev

# Gerar build de produção (pasta dist/)
npm run build

# Prévia do build de produção
npm run preview
```

## Funcionalidades

- **Resumo executivo** — 4 cards com métricas consolidadas (contas ativas, em risco, atingimento médio, encerrando em 60 dias)
- **Tabela de contas** — todas as contas com % de meta colorida, meses restantes e badges de status/tipo
- **Filtros** — por assessor, tipo, status, risco e busca por nome
- **Cadastro/edição** — modal completo com validação de campos obrigatórios
- **Exportar CSV** — baixa arquivo `wxp-contas-YYYY-MM-DD.csv` respeitando filtros ativos
- **Importar CSV** — lê arquivo, valida e faz upsert por nome_cliente (com toast de resultado)
- **Persistência offline** — 100% localStorage, sem chamadas de API externas

## Estrutura de arquivos

```
src/
  App.tsx                  # Componente raiz
  main.tsx                 # Entry point
  types/index.ts           # Tipagem TypeScript
  styles/globals.css       # CSS variables, reset, dark theme
  hooks/useAccounts.ts     # CRUD + localStorage
  utils/calculations.ts    # % meta, meses restantes, médias
  utils/csv.ts             # Exportação e importação CSV
  components/
    Dashboard.tsx          # View principal
    SummaryCards.tsx       # 4 cards de resumo
    AccountsTable.tsx      # Tabela com filtros e CSV
    AccountForm.tsx        # Modal de cadastro/edição
    Filters.tsx            # Barra de filtros
```
