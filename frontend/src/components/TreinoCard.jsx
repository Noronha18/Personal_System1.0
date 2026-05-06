import { useState } from 'react';
import { ChevronDown, ChevronRight, Dumbbell, Zap, Clock } from 'lucide-react';

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
        <div className="p-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {treino.prescricoes?.map((ex) => (
            <div key={ex.id} className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">{ex.nome_exercicio}</span>
                    {ex.metodo && ex.metodo !== 'Convencional' && (
                    <span className="text-[8px] font-black uppercase tracking-tighter bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
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
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1"><Zap size={10} /> {ex.series}x{ex.repeticoes}</span>
                {ex.carga_kg && <span className="flex items-center gap-1"><Dumbbell size={10} /> {ex.carga_kg}kg</span>}
                <span className="flex items-center gap-1"><Clock size={10} /> {ex.tempo_descanso_segundos}s</span>
              </div>
              {ex.observacoes && (
                <div className="mt-2 pt-2 border-t border-slate-200/50">
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                        Nota: {ex.observacoes}
                    </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
