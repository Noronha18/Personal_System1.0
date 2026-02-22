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
              <span className="text-xs font-bold text-slate-700 mb-1">{ex.nome_exercicio}</span>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1"><Zap size={10} /> {ex.series}x{ex.repeticoes}</span>
                {ex.carga_kg && <span className="flex items-center gap-1"><Dumbbell size={10} /> {ex.carga_kg}kg</span>}
                <span className="flex items-center gap-1"><Clock size={10} /> {ex.tempo_descanso_segundos}s</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
