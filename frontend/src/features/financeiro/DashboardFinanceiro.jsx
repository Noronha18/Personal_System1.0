import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import CardsKPI from './CardsKPI';
import GraficoReceita from './GraficoReceita';
import GraficoInadimplencia from './GraficoInadimplencia';

export default function DashboardFinanceiro() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/pagamentos/estatisticas');
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const json = await response.json();
        setDados(json);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
    const intervalo = setInterval(carregarDados, 5 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-emerald-500/20 shadow-lg"></div>
          <span className="text-slate-400 text-sm font-medium animate-pulse">
            Carregando dashboard financeiro...
          </span>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-6">
        <div className="bg-red-950/40 border border-red-800/50 rounded-lg p-6 backdrop-blur-sm">
          <p className="text-red-400 font-semibold text-lg">
            ⚠️ Erro ao carregar dados
          </p>
          <p className="text-red-300/80 text-sm mt-2 font-mono">{erro}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header com Gradiente */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Dashboard Financeiro
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Referência: {dados.referencia_mes} • Atualizado agora
          </p>
        </div>
      </div>

      {/* KPIs */}
      <CardsKPI dados={dados} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoReceita dados={dados.receita_mensal_12m} />
        <GraficoInadimplencia dados={dados} />
      </div>
    </div>
  );
}
