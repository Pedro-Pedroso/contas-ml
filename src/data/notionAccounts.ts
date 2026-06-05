import { Account } from '../types'

const DEFAULT_START = '2026-01-01'
const DEFAULT_END = '2026-12-31'
const DEFAULT_ASSESSOR = 'Não informado'
const DEFAULT_META = 0
const DEFAULT_REALIZADO = 0

const contasNotion = [
  ['notion-35dcf2cc-65a7-81b8-b465-eea1b16b2642', 'Casa do Chumbador'],
  ['notion-35dcf2cc-65a7-8117-9737-eb859385821d', 'NECAP COMERCIO'],
  ['notion-35dcf2cc-65a7-8175-a6e5-e4fc724e0cd1', 'XINGLING'],
  ['notion-35dcf2cc-65a7-8134-a619-c3102d9562c1', 'Kondmedical'],
  ['notion-35dcf2cc-65a7-814f-8841-d242d3f9aadb', 'Kenno'],
  ['notion-35dcf2cc-65a7-8168-a0e8-cd9a65e9cc67', 'Oliveira Ferragens'],
  ['notion-35dcf2cc-65a7-8140-9d70-c6cb6134bdfb', 'Elotrica'],
  ['notion-35dcf2cc-65a7-81c1-ab65-d302c61bd166', 'Ardos'],
  ['notion-35dcf2cc-65a7-81cc-8be4-ccba9de1fc14', 'Vidraçaria Passarela'],
  ['notion-35dcf2cc-65a7-8170-a4d3-cd3385c1c65d', 'WxP'],
  ['notion-35dcf2cc-65a7-8088-9404-cdb5163de6c4', 'Impacto'],
  ['notion-35dcf2cc-65a7-8138-83f1-de4e8b827ddf', 'Silva Auto Peças'],
  ['notion-35dcf2cc-65a7-8146-b1ca-f05dea5cac1b', 'JRN'],
  ['notion-35dcf2cc-65a7-818a-bf62-ee66604f06a5', 'GRIFFATO'],
  ['notion-35dcf2cc-65a7-818d-a376-f30c030e4755', 'TNB'],
  ['notion-35dcf2cc-65a7-811d-8e5a-f7dc4620adb9', 'Tlimpar'],
  ['notion-35dcf2cc-65a7-81d1-820e-e54dc262ee99', 'Clicky'],
  ['notion-35dcf2cc-65a7-810f-8101-dbfd3be7ad7d', 'Ótica Bamboo'],
  ['notion-360cf2cc-65a7-803b-a084-d053402f49c6', 'Concevil'],
  ['notion-35dcf2cc-65a7-8110-9d0f-db62f7aa3302', 'LV EPIS'],
  ['notion-35ecf2cc-65a7-8078-9f72-e2b55339d5d9', 'A.rieping'],
  ['notion-35dcf2cc-65a7-8117-8781-f59e0292a012', 'SOLPAR'],
  ['notion-35dcf2cc-65a7-8198-992e-f8d9c823202c', 'Betarc Engenharia'],
  ['notion-360cf2cc-65a7-80f5-bfca-d4677f9e901b', 'Jardim de Laura'],
  ['notion-360cf2cc-65a7-808c-bae1-dcfc65dcb6c2', 'Garupa'],
]

export const CONTAS_NOTION_V2: Account[] = contasNotion.map(([id, nome_cliente]) => ({
  id,
  nome_cliente,
  assessor: DEFAULT_ASSESSOR,
  tipo: 'lojista_digital',
  estrela: false,
  data_inicio: DEFAULT_START,
  data_termino: DEFAULT_END,
  meta_faturamento: DEFAULT_META,
  faturamento_real: DEFAULT_REALIZADO,
  em_risco: false,
  status: 'ativo',
  observacao: 'Importado da database Contas v2 do Notion. Campos ausentes preenchidos com padrão.',
}))
