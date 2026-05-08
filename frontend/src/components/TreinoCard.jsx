import { useState } from 'react';
import { ChevronDown, ChevronRight, Dumbbell, Zap, Clock } from 'lucide-react';

const METODOS_AGRUPADORES = ["Bi-set", "Tri-set", "Giant-set", "Super-set"];

const METHOD_BG = {
  'Bi-set':    'bg-method-bi/8',
  'Tri-set':   'bg-method-tri/8',
  'Giant-set': 'bg-method-giant/8',
  'Super-set': 'bg-method-super/8',
};

const METHOD_BADGE = {
  'Bi-set':    'bg-method-bi/10 text-method-bi border-method-bi/20',
  'Tri-set':   'bg-method-tri/10 text-method-tri border-method-tri/20',
  'Giant-set': 'bg-method-giant/10 text-method-giant border-method-giant/20',
  'Super-set': 'bg-method-super/10 text-method-super border-method-super/20',
};

export function TreinoCard({ treino }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-surface border border-border rounded-lg shadow-1 overflow-hidden mb-3">
      <button
        type="button"
        className="w-full p-4 flex items-center justify-between hover:bg-overlay transition-colors text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-brand text-brand-fg flex items-center justify-center font-bold text-sm shadow-1">
            {treino.nome}
          </div>
          <div>
            <h4 className="font-semibold text-text-primary text-sm tracking-tight">
              Divisão {treino.nome}
            </h4>
            <span className="text-xs text-text-secondary">
              {treino.prescricoes?.length || 0} exercícios
            </span>
          </div>
        </div>
        {isOpen
          ? <ChevronDown size={16} className="text-text-muted" aria-hidden="true" />
          : <ChevronRight size={16} className="text-text-muted" aria-hidden="true" />
        }
      </button>

      {isOpen && (
        <div className="p-3 border-t border-border flex flex-col gap-1 bg-surface-raised">
          {treino.prescricoes?.map((ex, idx) => {
            const prescricoes = treino.prescricoes;
            const isGrouping = METODOS_AGRUPADORES.includes(ex.metodo);
            const prevIsSame = idx > 0 && prescricoes[idx - 1].metodo === ex.metodo && isGrouping;
            const nextIsSame = idx < prescricoes.length - 1 && prescricoes[idx + 1].metodo === ex.metodo && isGrouping;

            const groupShape = [
              prevIsSame ? 'mt-0 border-t-0 rounded-t-none' : 'rounded-t-md mt-2 shadow-1',
              nextIsSame ? 'mb-0 rounded-b-none' : 'rounded-b-md mb-2',
            ].join(' ');

            const methodBg = isGrouping ? (METHOD_BG[ex.metodo] ?? '') : '';

            return (
              <div
                key={ex.id || idx}
                className={`relative flex flex-col p-3 bg-surface border border-border transition-all ${groupShape} ${methodBg}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {ex.nome_exercicio}
                    </span>
                    {ex.metodo && ex.metodo !== 'Convencional' && (
                      <span className={`text-2xs font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${METHOD_BADGE[ex.metodo] ?? 'bg-overlay text-text-secondary border-border'}`}>
                        {ex.metodo}
                      </span>
                    )}
                  </div>
                  {ex.exercicio?.video_url && (
                    <a
                      href={ex.exercicio.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-accent hover:text-accent-hover transition-colors"
                      aria-label={`Ver demonstração de ${ex.nome_exercicio}`}
                    >
                      <Zap size={14} aria-hidden="true" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <Zap size={11} className="text-text-muted" aria-hidden="true" />
                    {ex.series}x{ex.repeticoes}
                  </span>
                  {ex.carga_kg && (
                    <span className="flex items-center gap-1.5">
                      <Dumbbell size={11} className="text-text-muted" aria-hidden="true" />
                      {ex.carga_kg}kg
                    </span>
                  )}
                  {(!nextIsSame || !isGrouping) && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} className="text-text-muted" aria-hidden="true" />
                      {ex.tempo_descanso_segundos}s
                    </span>
                  )}
                </div>

                {ex.observacoes && (
                  <div className="mt-2 pt-2 border-t border-border-faint">
                    <p className="text-xs font-medium text-accent-text leading-relaxed">
                      {ex.observacoes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
