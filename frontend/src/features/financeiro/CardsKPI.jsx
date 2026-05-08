import { DollarSign, TrendingUp, AlertTriangle, Users } from 'lucide-react';

function CardKPI({ titulo, valor, subtitulo, icone: Icon, corIcone, corTexto, subtituloCor }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
            {titulo}
          </p>
          <p className={`text-2xl sm:text-3xl font-bold font-mono tracking-tighter truncate ${corTexto}`}>
            {valor}
          </p>
          {subtitulo && (
            <p className={`text-xs mt-2 font-bold uppercase tracking-wide truncate ${subtituloCor || 'text-text-secondary'}`}>
              {subtitulo}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${corIcone} ml-4 border border-current/10 shadow-inner`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default function CardsKPI({ dados }) {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(valor);
  };

  const formatarPorcentagem = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(valor);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
      <CardKPI
        titulo="Receita Mensal"
        valor={formatarMoeda(dados.receita_total)}
        subtitulo={`${dados.alunos_em_dia} ativos pagos`}
        icone={DollarSign}
        corTexto="text-text-primary"
        corIcone="bg-accent/10 text-accent"
      />

      <CardKPI
        titulo="Ticket Médio"
        valor={formatarMoeda(dados.ticket_medio)}
        subtitulo="Valor por contrato"
        icone={TrendingUp}
        corTexto="text-text-primary"
        corIcone="bg-overlay text-text-secondary"
      />
      
      <CardKPI
        titulo="Inadimplência"
        valor={formatarPorcentagem(dados.inadimplencia)}
        subtitulo={`${dados.alunos_inadimplentes} pendências`}
        icone={AlertTriangle}
        corTexto={dados.inadimplencia > 0.2 ? 'text-danger' : 'text-warning'}
        subtituloCor={dados.inadimplencia > 0.2 ? 'text-danger' : 'text-warning'}
        corIcone={dados.inadimplencia > 0.2 ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}
      />

      <CardKPI
        titulo="Base Operacional"
        valor={dados.total_alunos}
        subtitulo="Alunos sob gestão"
        icone={Users}
        corTexto="text-text-primary"
        corIcone="bg-text-secondary/10 text-text-secondary"
      />
    </div>
  );
}
