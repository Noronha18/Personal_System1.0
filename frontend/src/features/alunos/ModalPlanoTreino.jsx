import { X, Dumbbell, Calendar, Target } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function ModalPlanoTreino({ plano, onClose }) {
  const dialogRef = useRef(null);

  // Abre o modal quando o plano muda
  useEffect(() => {
    if (plano && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (!plano && dialogRef.current) {
      dialogRef.current.close();
    }
  }, [plano]);

  // Fecha ao clicar fora ou ESC
  const handleClose = () => {
    if (dialogRef.current) dialogRef.current.close();
    onClose();
  };

  if (!plano) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
          if (e.target === dialogRef.current) handleClose();
      }}
      className="backdrop:bg-slate-900/80 bg-transparent p-0 w-full max-w-2xl rounded-2xl shadow-2xl open:animate-in open:fade-in open:zoom-in-95 backdrop:animate-in backdrop:fade-in"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-800/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-1 text-xs rounded-full border ${plano.esta_ativo ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                    {plano.esta_ativo ? 'Ativo' : 'Inativo'}
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(plano.data_criacao).toLocaleDateString('pt-BR')}
                </span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-emerald-500" />
              {plano.titulo}
            </h2>
            <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm">
                <Target className="w-4 h-4" />
                {plano.objetivo_estrategico || "Sem objetivo estratégico definido"}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Exercícios */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Prescrição de Exercícios
          </h3>
          
          <div className="space-y-3">
            {plano.prescricoes?.map((ex, index) => (
              <div key={ex.id || index} className="flex items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-emerald-500/30 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold mr-4 text-slate-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                    {index + 1}
                </div>
                
                <div className="flex-1">
                    <h4 className="font-medium text-white text-lg">{ex.nome_exercicio}</h4>
                    {ex.notas_tecnicas && (
                        <p className="text-xs text-slate-400 mt-1 italic">
                            💡 {ex.notas_tecnicas}
                        </p>
                    )}
                </div>

                <div className="flex gap-6 text-right">
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Séries/Rep</p>
                        <p className="font-mono text-emerald-400 font-bold">
                            {ex.series} x {ex.repeticoes}
                        </p>
                    </div>
                    {ex.carga_kg > 0 && (
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Carga</p>
                            <p className="font-mono text-slate-200">
                                {ex.carga_kg}kg
                            </p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Descanso</p>
                        <p className="font-mono text-slate-400">
                            {ex.tempo_descanso_segundos}s
                        </p>
                    </div>
                </div>
              </div>
            ))}

            {(!plano.prescricoes || plano.prescricoes.length === 0) && (
                <div className="text-center py-8 text-slate-500 italic">
                    Nenhum exercício cadastrado neste plano.
                </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-800/30 border-t border-slate-700 text-right">
            <button 
                onClick={handleClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
                Fechar
            </button>
        </div>
      </div>
    </dialog>
  );
}
