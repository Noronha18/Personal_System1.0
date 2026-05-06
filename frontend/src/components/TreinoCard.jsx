import { useState } from 'react';
import { ChevronDown, ChevronRight, Dumbbell, Zap, Clock } from 'lucide-react';

const METODOS_AGRUPADORES = ["Bi-set", "Tri-set", "Giant-set", "Super-set"];

export function TreinoCard({ treino }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-2">
      <div
        className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            {treino.nome}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Treino {treino.nome}</h4>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              {treino.prescricoes?.length || 0} exercícios
            </span>
          </div>
        </div>
        {isOpen 
          ? <ChevronDown size={18} className="text-slate-400" /> 
          : <ChevronRight size={18} className="text-slate-400" />
        }
      </div>

      {isOpen && (
        <div className="p-4 border-t border-slate-100 flex flex-col gap-1">
          {treino.prescricoes?.map((ex, idx) => {
            const prescricoes = treino.prescricoes;
            const isGrouping = METODOS_AGRUPADORES.includes(ex.metodo);
            const prevIsSame = idx > 0 && prescricoes[idx - 1].metodo === ex.metodo && isGrouping;
            const nextIsSame = idx < prescricoes.length - 1 && prescricoes[idx + 1].metodo === ex.metodo && isGrouping;

            const groupClasses = `
                ${prevIsSame ? 'mt-0 border-t-0 rounded-t-none shadow-none' : 'rounded-t-lg mt-2'} 
                ${nextIsSame ? 'mb-0 rounded-b-none border-b-slate-100' : 'rounded-b-lg mb-2'}
            `;

            return (
              <div 
                key={ex.id || idx} 
                className={`relative flex flex-col p-3 bg-slate-50 border border-slate-200 transition-all ${groupClasses}`}
              >
                {/* Indicador de Grupo */}
                {isGrouping && (
                   <div className={`absolute left-0 top-0 bottom-0 w-1.5 z-10 ${
                        ex.metodo === 'Bi-set' ? 'bg-blue-500' :
                        ex.metodo === 'Tri-set' ? 'bg-purple-500' :
                        ex.metodo === 'Giant-set' ? 'bg-orange-500' :
                        'bg-emerald-500'
                    }`} />
                )}

                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 pl-2">
                      <span className="text-xs font-bold text-slate-700">{ex.nome_exercicio}</span>
                      {ex.metodo && ex.metodo !== 'Convencional' && (
                      <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${
                          ex.metodo === 'Bi-set' ? 'bg-blue-100 text-blue-700' :
                          ex.metodo === 'Tri-set' ? 'bg-purple-100 text-purple-700' :
                          'bg-emerald-100 text-emerald-700'
                      }`}>
                          {ex.metodo}
                      </span>
                      )}
                  </div>
                  {ex.exercicio?.video_url && (
                      <a 
                          href={ex.exercicio.video_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 transition-colors"
                          title="Ver Vídeo"
                      >
                          <Zap size={14} />
                      </a>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium pl-2">
                  <span className="flex items-center gap-1"><Zap size={10} /> {ex.series}x{ex.repeticoes}</span>
                  {ex.carga_kg && <span className="flex items-center gap-1"><Dumbbell size={10} /> {ex.carga_kg}kg</span>}
                  {(!nextIsSame || !isGrouping) && (
                      <span className="flex items-center gap-1"><Clock size={10} /> {ex.tempo_descanso_segundos}s</span>
                  )}
                </div>
                {ex.observacoes && (
                  <div className="mt-2 pt-2 border-t border-slate-200/50 pl-2">
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                          Nota: {ex.observacoes}
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
