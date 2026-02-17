import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, CheckCircle2, XCircle, AlertTriangle, Trash2, Loader2 } from 'lucide-react';

export const IndicadorFrequencia = ({ alunoId }) => {
  const [dados, setDados] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletando, setDeletando] = useState(null); // ID da sessão sendo deletada

  const hoje = new Date();
  const mesAtual = `${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // 1. Busca Frequência (Resumo)
      const resFreq = await fetch(`http://localhost:8000/sessoes/frequencia/${alunoId}?referencia_mes=${mesAtual}`);
      if (resFreq.ok) {
        const jsonFreq = await resFreq.json();
        setDados(jsonFreq);
      }

      // 2. Busca Lista de Sessões do Mês
      // Ajuste o endpoint conforme sua rota. Supondo GET /sessoes/?aluno_id=...
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const resList = await fetch(`http://localhost:8000/sessoes/?aluno_id=${alunoId}&de=${inicioMes}&ate=${fimMes}&limit=50`);
      if (resList.ok) {
        const jsonList = await resList.json();
        // Ordena por data (mais recente primeiro)
        setSessoes(jsonList.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora)));
      }

    } catch (error) {
      console.error("Erro ao carregar frequência:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletarSessao = async (sessaoId) => {
    if (!confirm("Tem certeza que deseja apagar este registro?")) return;
    
    setDeletando(sessaoId);
    try {
      const res = await fetch(`http://localhost:8000/sessoes/${sessaoId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        // Atualiza lista localmente e recarrega totais
        setSessoes(prev => prev.filter(s => s.id !== sessaoId));
        carregarDados(); // Recarrega para atualizar a porcentagem
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
    } finally {
      setDeletando(null);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [alunoId]);

  if (loading && !dados) return (
    <div className="flex items-center justify-center p-6 bg-slate-800/50 rounded-xl border border-slate-700 h-full">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
    </div>
  );

  if (!dados) return null;

  // Definição de Cores e Ícones
  const isPositive = dados.taxa_adesao >= 0.75; // Meta de 75%
  const porcentagem = Math.round(dados.taxa_adesao * 100);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      
      {/* 1. Cabeçalho (Resumo) */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/50 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Frequência ({mesAtual})
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className={`text-3xl font-bold ${isPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {porcentagem}%
              </h3>
              <span className="text-sm text-slate-500 font-mono">
                ({dados.sessoes_realizadas}/{dados.sessoes_previstas})
              </span>
            </div>
          </div>
          
          <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
        </div>
        
        {/* Barra de Progresso */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isPositive ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(porcentagem, 100)}%` }}
          />
        </div>
      </div>

      {/* 2. Lista de Registros (Scrollable) */}
      <div className="flex-1 overflow-y-auto max-h-[220px] custom-scrollbar p-2 space-y-1">
        {sessoes.length > 0 ? (
          sessoes.map((sessao) => {
            // Lógica de Ícone e Cor baseada no status
            let statusConfig = {
              icon: CheckCircle2,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
              label: 'Realizada'
            };

            if (!sessao.realizada) {
              if (sessao.precisa_reposicao) {
                statusConfig = {
                  icon: AlertTriangle,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10 border-amber-500/20',
                  label: 'Reposição'
                };
              } else {
                statusConfig = {
                  icon: XCircle,
                  color: 'text-red-400',
                  bg: 'bg-red-500/10 border-red-500/20',
                  label: 'Falta'
                };
              }
            }

            const Icon = statusConfig.icon;

            return (
              <div 
                key={sessao.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${statusConfig.bg} transition-all hover:bg-opacity-20 group`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${statusConfig.color}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {new Date(sessao.data_hora).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      <span className="ml-2 text-xs text-slate-500">
                        {new Date(sessao.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                    <p className={`text-xs ${statusConfig.color} font-medium`}>
                      {statusConfig.label}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => deletarSessao(sessao.id)}
                  disabled={deletando === sessao.id}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Apagar registro"
                >
                  {deletando === sessao.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            Nenhum registro este mês.
          </div>
        )}
      </div>
    </div>
  );
};
