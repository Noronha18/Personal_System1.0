export default function CardsKPI({ dados }) {
  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(valor);

  const formatarPorcentagem = (valor) => new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(valor);

  const inadimplenciaCor = dados.inadimplencia > 0.2
    ? 'text-danger'
    : dados.inadimplencia > 0.1
      ? 'text-warning'
      : 'text-text-primary';

  return (
    <div className="mx-2 bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border">

        {/* Receita — seção principal, peso visual maior */}
        <div className="flex-[2] p-6 sm:p-8">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Receita Mensal</p>
          <p className="text-3xl sm:text-4xl font-bold font-mono text-text-primary tracking-tighter tabular-nums">
            {formatarMoeda(dados.receita_total)}
          </p>
          <p className="text-xs text-text-secondary font-medium mt-2">
            {dados.alunos_em_dia} {dados.alunos_em_dia === 1 ? 'aluno ativo pago' : 'alunos ativos pagos'}
          </p>
        </div>

        {/* Inadimplência — urgência */}
        <div className="flex-[1.5] p-6 sm:p-8">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Inadimplência</p>
          <p className={`text-2xl sm:text-3xl font-bold font-mono tracking-tighter tabular-nums ${inadimplenciaCor}`}>
            {formatarPorcentagem(dados.inadimplencia)}
          </p>
          <p className={`text-xs font-medium mt-2 ${dados.alunos_inadimplentes > 0 ? 'text-danger' : 'text-text-secondary'}`}>
            {dados.alunos_inadimplentes > 0
              ? `${dados.alunos_inadimplentes} ${dados.alunos_inadimplentes === 1 ? 'pendência em aberto' : 'pendências em aberto'}`
              : 'Sem pendências'}
          </p>
        </div>

        {/* Ticket + Base — dados secundários compactos */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col gap-5">
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Ticket Médio</p>
            <p className="text-xl font-bold font-mono text-text-primary tracking-tighter tabular-nums">
              {formatarMoeda(dados.ticket_medio)}
            </p>
          </div>
          <div className="border-t border-border-faint pt-5">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Base Operacional</p>
            <p className="text-xl font-bold font-mono text-text-primary tracking-tighter tabular-nums">
              {dados.total_alunos}{' '}
              <span className="text-sm font-medium text-text-secondary">alunos</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
