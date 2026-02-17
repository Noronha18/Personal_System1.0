import { DollarSign, TrendingUp, AlertTriangle, Users } from 'lucide-react';

function CardKPI({ titulo, valor, subtitulo, icone: Icon, corFundo, corTexto, corIcone }) {
  return (
    <div className={`${corFundo} border border-slate-800 rounded-xl p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-slate-700`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">
            {titulo}
          </p>
          <p className={`text-3xl font-extrabold mt-3 ${corTexto}`}>
            {valor}
          </p>
          {subtitulo && (
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {subtitulo}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${corIcone} shadow-lg`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export default function CardsKPI({ dados }) {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <CardKPI
        titulo="Receita do Mês"
        valor={formatarMoeda(dados.receita_total)}
        subtitulo={`${dados.alunos_em_dia} alunos pagaram`}
        icone={DollarSign}
        corFundo="bg-gradient-to-br from-emerald-950/50 to-slate-900"
        corTexto="text-emerald-400"
        corIcone="bg-emerald-500/20 text-emerald-400"
      />
      
      <CardKPI
        titulo="Ticket Médio"
        valor={formatarMoeda(dados.ticket_medio)}
        subtitulo="Por aluno ativo"
        icone={TrendingUp}
        corFundo="bg-gradient-to-br from-cyan-950/50 to-slate-900"
        corTexto="text-cyan-400"
        corIcone="bg-cyan-500/20 text-cyan-400"
      />
      
      <CardKPI
        titulo="Taxa de Inadimplência"
        valor={formatarPorcentagem(dados.inadimplencia)}
        subtitulo={`${dados.alunos_inadimplentes} alunos pendentes`}
        icone={AlertTriangle}
        corFundo={`bg-gradient-to-br ${dados.inadimplencia > 0.2 ? 'from-red-950/50' : 'from-amber-950/50'} to-slate-900`}
        corTexto={dados.inadimplencia > 0.2 ? 'text-red-400' : 'text-amber-400'}
        corIcone={dados.inadimplencia > 0.2 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}
      />
      
      <CardKPI
        titulo="Total de Alunos"
        valor={dados.total_alunos}
        subtitulo={`${dados.alunos_em_dia} em dia`}
        icone={Users}
        corFundo="bg-gradient-to-br from-violet-950/50 to-slate-900"
        corTexto="text-violet-400"
        corIcone="bg-violet-500/20 text-violet-400"
      />
    </div>
  );
}
