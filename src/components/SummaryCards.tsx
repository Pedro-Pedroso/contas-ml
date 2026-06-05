import { Account } from '../types'
import {
  calcMediaAtingimento,
  calcEncerrandoEm60Dias,
} from '../utils/calculations'

interface Props {
  contas: Account[]
}

export function SummaryCards({ contas }: Props) {
  const totalAtivas = contas.filter((conta) => conta.status === 'ativo').length
  const emRisco = contas.filter((conta) => conta.em_risco && conta.status === 'ativo').length
  const mediaAtingimento = calcMediaAtingimento(contas)
  const prazosCriticos = calcEncerrandoEm60Dias(contas).length

  const cards = [
    {
      label: 'Contas ativas',
      valor: totalAtivas,
      sufixo: '',
      detalhe: `${contas.length} contas na base`,
      tom: 'info',
    },
    {
      label: 'Contas em risco',
      valor: emRisco,
      sufixo: '',
      detalhe: 'Prioridade de retenção',
      tom: emRisco > 0 ? 'danger' : 'success',
    },
    {
      label: 'Atingimento médio',
      valor: mediaAtingimento,
      sufixo: '%',
      detalhe: 'Média das contas ativas',
      tom: mediaAtingimento >= 80 ? 'success' : mediaAtingimento >= 50 ? 'warning' : 'danger',
    },
    {
      label: 'Prazos críticos',
      valor: prazosCriticos,
      sufixo: '',
      detalhe: 'Vencidos ou até 60 dias',
      tom: prazosCriticos > 0 ? 'warning' : 'success',
    },
  ]

  return (
    <section className="summary-grid" aria-label="Resumo executivo da carteira">
      {cards.map((card) => (
        <article key={card.label} className={`summary-card tone-${card.tom}`}>
          <div className="summary-card__top">
            <span>{card.label}</span>
            <span className="summary-card__mark" aria-hidden="true" />
          </div>
          <strong>
            {card.valor}
            {card.sufixo}
          </strong>
          <p>{card.detalhe}</p>
        </article>
      ))}
    </section>
  )
}
