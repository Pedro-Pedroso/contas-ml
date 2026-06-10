import { Account } from '../types'
import {
  calcMediaAtingimento,
  calcEncerrandoEm60Dias,
  isContaInicial,
} from '../utils/calculations'

interface Props {
  contas: Account[]
}

export function SummaryCards({ contas }: Props) {
  const ativas = contas.filter((conta) => conta.status === 'ativo')
  const totalAtivas = ativas.length
  const emRisco = ativas.filter((conta) => conta.em_risco).length
  const mediaAtingimento = calcMediaAtingimento(contas)
  const prazosCriticos = calcEncerrandoEm60Dias(contas).length
  const contasIniciais = ativas.filter(isContaInicial).length

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
      detalhe: contasIniciais > 0
        ? `${contasIniciais} em fase inicial (excluídas)`
        : 'Média das contas rampadas',
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
