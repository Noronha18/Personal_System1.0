import { X, Dumbbell, Calendar, Target, Trash2, Power, AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function ModalPlanoTreino({ plano, onClose, onUpdate }) {
  const dialogRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [planoAtual, setPlanoAtual] = useState(plano);

  useEffect(() => {
    setPlanoAtual(plano);
    if (plano && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (!plano && dialogRef.current) {
      dialogRef.current.close();
    }
  }, [plano]);

  const handleClose = () => {
    if (dialogRef.current) dialogRef.current.close();
    onClose();
  };

  // AÇÃO: Desativar Plano
  const handleDesativar = async () => {
    if (!confirm('Tem certeza que deseja desativar este plano?')) return;
    
    setIsUpdating(true);
    try {
      console.log(`Tentando desativar plano: ${plano.id}`);
      const res = await fetch(`http://localhost:8000/planos/${plano.id}/desativar`, {
        method: 'PATCH'
      });
      
      if (res.ok) {
        setPlanoAtual(prev => ({ ...prev, esta_ativo: false }));
        onUpdate?.(); 
        alert('Plano desativado com sucesso!');
      } else {
        const erro = await res.json();
        console.error("Erro API:", erro);
        alert(`Erro ao desativar: ${erro.detail || 'Erro desconhecido'}`);
      }
    } catch (err) {
      console.error("Erro Fetch:", err);
      alert('Erro de conexão com o servidor');
    } finally {
      setIsUpdating(false);
    }
  };

  // AÇÃO: Excluir Exercício
  const handleExcluirExercicio = async (idExercicio) => {
    if (!confirm('Remover este exercício do treino?')) return;

    // Backup para rollback
    const backup = [...planoAtual.prescricoes];
    
    // Otimisticamente remove da UI
    setPlanoAtual(prev => ({
        ...prev,
        prescricoes: prev.prescricoes.filter(p => p.id !== idExercicio)
    }));

    try {
      console.log(`Tentando excluir exercício: ${idExercicio}`);
      // ATENÇÃO: Verifique se a rota no backend é exatamente esta
      const res = await fetch(`http://localhost:8000/planos/exercicios/${idExercicio}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.detail || 'Erro ao excluir');
      }
      
      // Sucesso: chama atualização
      onUpdate?.();

    } catch (err) {
      console.error("Erro Exclusão:", err);
      alert(`Falha ao excluir: ${err.message}`);
      setPlanoAtual(prev => ({ ...prev, prescricoes: backup })); // Rollback
    }
  };

  if (!planoAtual) return null;

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
                <span className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1 ${planoAtual.esta_ativo ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                    {planoAtual.esta_ativo ? 'Ativo' : 'Inativo'}
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(planoAtual.data_criacao).toLocaleDateString('pt-BR')}
                </span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-emerald-500" />
              {planoAtual.titulo}
            </h2>
            <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm">
                <Target className="w-4 h-4" />
                {planoAtual.objetivo_estrategico || "Sem objetivo estratégico definido"}
            </p>
          </div>
          
          <div className="flex gap-2">
            {planoAtual.esta_ativo && (
                <button 
                    onClick={handleDesativar}
                    disabled={isUpdating}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                    title="Desativar Plano"
                >
                    <Power className="w-4 h-4" />
                    <span className="hidden sm:inline">Desativar</span>
                </button>
            )}
            <button 
                onClick={handleClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
                <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lista de Exercícios */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex justify-between items-center">
            <span>Prescrição de Exercícios</span>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
                {planoAtual.prescricoes?.length || 0} exercícios
            </span>
          </h3>
          
          <div className="space-y-3">
            {planoAtual.prescricoes?.map((ex, index) => (
              <div key={ex.id || index} className="flex items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-emerald-500/30 transition-all group relative">
                
                {/* Badge Número */}
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold mr-4 text-slate-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                    {index + 1}
                </div>
                
                <div className="flex-1 mr-4">
                    <h4 className="font-medium text-white text-lg">{ex.nome_exercicio}</h4>
                    {ex.notas_tecnicas && (
                        <p className="text-xs text-slate-400 mt-1 italic flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 mt-0.5" />
                            {ex.notas_tecnicas}
                        </p>
                    )}
                </div>

                <div className="flex gap-6 text-right mr-8">
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
                </div>

                {/* Botão de Excluir */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Impede clique no pai se houver
                        handleExcluirExercicio(ex.id);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                    title="Remover exercício"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {(!planoAtual.prescricoes || planoAtual.prescricoes.length === 0) && (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                    <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">Nenhum exercício neste plano.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
