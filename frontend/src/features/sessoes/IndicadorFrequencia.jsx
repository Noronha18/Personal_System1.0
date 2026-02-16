import { use } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Fetcher com cache simples (para React 19 use())
const cache = new Map();

function fetchFrequencia(alunoId) {
  const url = `http://localhost:8000/sessoes/frequencia/${alunoId}`;
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then(res => res.json()));
  }
  return cache.get(url);
}

export function IndicadorFrequencia({ alunoId }) {
  // Dispara suspense se a promise não resolveu
  const dados = use(fetchFrequencia(alunoId));
  
  // Lógica visual
  const percentual = Math.round(dados.taxa_adesao * 100);
  let corTexto = 'text-slate-500';
  let Icone = Minus;
  
  if (percentual >= 80) {
      corTexto = 'text-emerald-500';
      Icone = TrendingUp;
  } else if (percentual < 50) {
      corTexto = 'text-red-500';
      Icone = TrendingDown;
  }

  return (
    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className={`p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm ${corTexto}`}>
        <Icone className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Frequência Mensal</p>
        <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{percentual}%</span>
            <span className="text-xs text-slate-400">({dados.sessoes_realizadas}/{dados.sessoes_previstas})</span>
        </div>
      </div>
    </div>
  );
}
