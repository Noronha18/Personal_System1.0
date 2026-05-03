import React, { useState } from 'react';
import { X, Dumbbell, Trash2, Plus, Save } from 'lucide-react';

export function ModalPlanoTreino({ isOpen, onClose, onSave }) {
  const [novoPlano, setNovoPlano] = useState({
    titulo: '',
    objetivo_estrategico: '',
    detalhes: '',
    treinos: [
      {
        nome: 'A',
        descricao: '',
        prescricoes: [{ nome_exercicio: '', series: 3, repeticoes: 10, carga_kg: 0, tempo_descanso_segundos: 60 }]
      }
    ]
  });

  if (!isOpen) return null;

  const handleAddTreino = () => {
    const proximasLetras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const proximaLetra = proximasLetras[novoPlano.treinos.length] || 'Extra';
    
    setNovoPlano({
      ...novoPlano,
      treinos: [
        ...novoPlano.treinos,
        {
          nome: proximaLetra,
          descricao: '',
          prescricoes: [{ nome_exercicio: '', series: '3', repeticoes: '10', carga_kg: 0, tempo_descanso_segundos: 60 }]
        }
      ]
    });
  };

  const handleRemoveTreino = (tIndex) => {
    const treinosAtualizados = novoPlano.treinos.filter((_, i) => i !== tIndex);
    setNovoPlano({ ...novoPlano, treinos: treinosAtualizados });
  };

  const handleAddExercicio = (tIndex) => {
    const treinosAtualizados = [...novoPlano.treinos];
    treinosAtualizados[tIndex].prescricoes.push({ 
      nome_exercicio: '', series: '3', repeticoes: '10', carga_kg: 0, tempo_descanso_segundos: 60 
    });
    setNovoPlano({ ...novoPlano, treinos: treinosAtualizados });
  };

  const handleRemoveExercicio = (tIndex, exIndex) => {
    const treinosAtualizados = [...novoPlano.treinos];
    treinosAtualizados[tIndex].prescricoes = treinosAtualizados[tIndex].prescricoes.filter((_, i) => i !== exIndex);
    setNovoPlano({ ...novoPlano, treinos: treinosAtualizados });
  };

  const handleTreinoChange = (tIndex, campo, valor) => {
    const treinosAtualizados = [...novoPlano.treinos];
    treinosAtualizados[tIndex][campo] = valor;
    setNovoPlano({ ...novoPlano, treinos: treinosAtualizados });
  };

  const handleExercicioChange = (tIndex, exIndex, campo, valor) => {
    const treinosAtualizados = [...novoPlano.treinos];
    treinosAtualizados[tIndex].prescricoes[exIndex][campo] = valor;
    setNovoPlano({ ...novoPlano, treinos: treinosAtualizados });
  };

  const handleFormSubmit = () => {
    onSave(novoPlano);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
      
      <div className="bg-[#F2F2F7] w-full max-w-5xl h-[92vh] md:h-auto md:max-h-[85vh] overflow-hidden rounded-t-[3rem] md:rounded-[3rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-700">
        
        {/* Header */}
        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Dumbbell size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Prescrever Plano</h2>
              <p className="text-slate-500 font-medium text-sm">Estruture a rotina de performance do aluno.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all active:scale-90">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar">
          
          {/* Plano Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Plano *</label>
              <input 
                type="text" placeholder="Ex: Hipertrofia Q1"
                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={novoPlano.titulo}
                onChange={e => setNovoPlano({...novoPlano, titulo: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objetivo Estratégico</label>
              <input 
                type="text" placeholder="Ex: Ganho de Massa"
                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={novoPlano.objetivo_estrategico}
                onChange={e => setNovoPlano({...novoPlano, objetivo_estrategico: e.target.value})}
              />
            </div>
          </div>

          {/* Treinos List */}
          <div className="space-y-12 pb-10">
            {novoPlano.treinos.map((treino, tIndex) => (
              <div key={tIndex} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-6 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xl">
                      {treino.nome}
                    </div>
                    <input 
                      type="text" placeholder="Foco do Treino (ex: Peito e Tríceps)" 
                      className="bg-transparent text-xl font-black text-slate-900 outline-none focus:border-b-2 border-emerald-500 transition-all placeholder:text-slate-300"
                      value={treino.descricao}
                      onChange={e => handleTreinoChange(tIndex, 'descricao', e.target.value)}
                    />
                  </div>
                  {novoPlano.treinos.length > 1 && (
                    <button onClick={() => handleRemoveTreino(tIndex)} className="text-red-400 hover:text-red-600 transition-colors p-2">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {treino.prescricoes.map((ex, exIndex) => (
                    <div key={exIndex} className="bg-white border border-black/5 rounded-3xl p-6 flex flex-wrap md:flex-nowrap items-center gap-6 shadow-sm hover:shadow-md transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">
                        {exIndex + 1}
                      </div>
                      
                      <div className="flex-1 min-w-[200px]">
                        <input 
                          type="text" placeholder="Nome do Exercício" 
                          className="w-full bg-transparent text-lg font-bold text-slate-900 outline-none placeholder:text-slate-200"
                          value={ex.nome_exercicio}
                          onChange={e => handleExercicioChange(tIndex, exIndex, 'nome_exercicio', e.target.value)}
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center block">Séries</label>
                          <input 
                            type="text" value={ex.series}
                            className="w-16 bg-slate-50 border border-black/5 rounded-xl py-2 text-center text-sm font-black text-slate-900"
                            onChange={e => handleExercicioChange(tIndex, exIndex, 'series', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center block">Reps</label>
                          <input 
                            type="text" value={ex.repeticoes}
                            className="w-16 bg-slate-50 border border-black/5 rounded-xl py-2 text-center text-sm font-black text-slate-900"
                            onChange={e => handleExercicioChange(tIndex, exIndex, 'repeticoes', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center block">Carga</label>
                          <input 
                            type="number" value={ex.carga_kg}
                            className="w-16 bg-slate-50 border border-black/5 rounded-xl py-2 text-center text-sm font-black text-emerald-600"
                            onChange={e => handleExercicioChange(tIndex, exIndex, 'carga_kg', e.target.value)}
                          />
                        </div>
                      </div>

                      <button onClick={() => handleRemoveExercicio(tIndex, exIndex)} className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => handleAddExercicio(tIndex)}
                    className="mt-2 py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:border-emerald-500/30 hover:text-emerald-500 hover:bg-emerald-50/30 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Adicionar Exercício
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-white border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <button 
            onClick={handleAddTreino}
            className="w-full md:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Adicionar Treino (A/B/C)
          </button>
          <button 
            onClick={handleFormSubmit}
            className="w-full md:w-auto px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Save size={18} /> Salvar Plano Completo
          </button>
        </div>

      </div>
    </div>
  );
}
