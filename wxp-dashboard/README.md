# WXP · Painel de Contas

Painel executivo para gestão e acompanhamento das contas WXP no Mercado Livre.

---

## Instalação e execução local

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior

Para verificar se já tem instalado, abra o terminal e rode:
```bash
node -v
```

### Passos

```bash
# 1. Acesse a pasta do projeto
cd wxp-dashboard

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:5173** no navegador.

---

## Build para produção (hospedagem)

```bash
npm run build
```

Isso gera uma pasta `dist/` com os arquivos prontos para hospedar em qualquer serviço estático.

### Opções gratuitas de hospedagem

- **[Vercel](https://vercel.com)** — recomendado. Conecte seu GitHub e faça deploy com 1 clique.
- **[Netlify](https://netlify.com)** — arraste a pasta `dist/` direto no painel.
- **[GitHub Pages](https://pages.github.com)** — precisa de configuração adicional no `vite.config.js`.

---

## Como usar

### Dados persistentes
Os dados são salvos automaticamente no `localStorage` do navegador. Não é necessário banco de dados ou servidor.

### Adicionar uma conta
Clique em **Nova Conta** no canto superior direito e preencha o formulário.

### Editar uma conta
Clique no ícone de lápis (✏️) na linha da conta na tabela.

### Excluir uma conta
Clique no ícone de lixeira (🗑️) na linha da conta. Uma confirmação será exibida.

### Exportar para CSV
Clique em **Exportar CSV**. O arquivo pode ser aberto no Excel ou Google Sheets.  
O separador utilizado é `;` (ponto e vírgula) — padrão brasileiro.

### Importar via CSV
O CSV importado deve ter o mesmo formato do exportado (com cabeçalho na primeira linha).  
As contas importadas são **adicionadas** às existentes, não substituem.

---

## Campos de cada conta

| Campo | Descrição |
|---|---|
| Cliente | Nome da conta |
| Assessor | Responsável da equipe |
| Tipo | Mensalista ou Lojista Digital |
| Estrela | Cliente prioritário (⭐) |
| Em Risco | Alerta manual de risco (⚠️) |
| Início / Término | Datas do contrato |
| Meses Restantes | Calculado automaticamente |
| Meta (R$) | Faturamento alvo do mês |
| Real (R$) | Faturamento realizado do mês |
| % Atingido | Calculado automaticamente |
| Status | Ativo / Pausado / Concluído |

---

## Legenda de cores

- 🟢 **Verde** — ≥ 80% da meta atingida
- 🟡 **Amarelo** — 50 a 79% da meta
- 🔴 **Vermelho** — abaixo de 50% da meta
- 🟠 **Laranja** — conta encerrando em até 2 meses

---

## Personalização

Para alterar os nomes dos assessores, edite o arquivo:
```
src/utils/data.js → array ASSESSORES
```

Para alterar as contas de exemplo iniciais, edite:
```
src/utils/data.js → array INITIAL_ACCOUNTS
```

---

Desenvolvido com React + Vite.
