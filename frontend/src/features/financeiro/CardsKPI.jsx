import { DollarSign, TrendingUp, AlertTriangle, Users } from 'lucide-react';

function CardKPI({ titulo, valor, subtitulo, icone: Icon, corIcone, corTexto, subtituloCor }) {
  return (
    <div className="bg-white border border-black/5 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-black/5 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 sm:mb-4">
            {titulo}
          </p>
          <p className={`text-2xl sm:text-4xl font-black tracking-tight truncate ${corTexto}`}>
            {valor}
          </p>
          {subtitulo && (
            <p className={`text-[10px] sm:text-xs mt-1 sm:mt-2 font-semibold truncate ${subtituloCor || 'text-slate-400'}`}>
              {subtitulo}
            </p>
          )}
        </div>
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${corIcone} shadow-inner ml-2 sm:ml-4`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-2">
      <CardKPI
        titulo="Receita Mensal"
        valor={formatarMoeda(dados.receita_total)}
        subtitulo={`${dados.alunos_em_dia} pagamentos`}
        icone={DollarSign}
        corTexto="text-slate-900"
        corIcone="bg-emerald-50 text-emerald-500"
      />
      
      <CardKPI
        titulo="Ticket Médio"
        valor={formatarMoeda(dados.ticket_medio)}
        subtitulo="Valor por plano ativo"
        icone={TrendingUp}
        corTexto="text-slate-900"
        corIcone="bg-blue-50 text-blue-500"
      />
      
      <CardKPI
        titulo="Inadimplência"
        valor={formatarPorcentagem(dados.inadimplencia)}
        subtitulo={`${dados.alunos_inadimplentes} pendências críticas`}
        icone={AlertTriangle}
        corTexto={dados.inadimplencia > 0.2 ? 'text-red-500' : 'text-amber-500'}
        subtituloCor={dados.inadimplencia > 0.2 ? 'text-red-400' : 'text-amber-400'}
        corIcone={dados.inadimplencia > 0.2 ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}
      />
      
      <CardKPI
        titulo="Base de Alunos"
        valor={dados.total_alunos}
        subtitulo={`${dados.alunos_em_dia} alunos em dia`}
        icone={Users}
        corTexto="text-slate-900"
        corIcone="bg-violet-50 text-violet-500"
      />
    </div>
  );
}
