import React, { useState } from 'react';
import { X, Dumbbell, Trash2, Plus, Save } from 'lucide-react';

export function ModalPlanoTreino({ isOpen, onClose, onSave }) {
  // 1. Estado Inicial do Formulário (O Novo Modelo do Banco)
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

  // Se o modal estiver fechado, não renderiza nada [web:217]
  if (!isOpen) return null;

  // ============================================================================
  // FUNÇÕES DE MANIPULAÇÃO DE ESTADO
  // ============================================================================
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
    // Aqui você chama a função passada pelo componente PAI (DetalheAluno)
    onSave(novoPlano);
    onClose(); // Fecha o modal após salvar
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      
      {/* Container do Modal */}
      <div className="bg-[#1e2330] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-700/50">
        
        {/* Header Fixo do Modal */}
        <div className="sticky top-0 bg-[#1e2330] z-10 border-b border-slate-700/50 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="text-blue-500" /> Prescrever Novo Plano (com Treinos A/B/C)
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Corpo do Modal (O Formulário) */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Título do Plano *</label>
              <input 
                type="text" placeholder="Ex: Ficha Hipertrofia Q1"
                className="w-full bg-[#151923] border border-slate-700 text-white rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={novoPlano.titulo}
                onChange={e => setNovoPlano({...novoPlano, titulo: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Objetivo Estratégico</label>
              <input 
                type="text" placeholder="Ex: Ganho de massa muscular"
                className="w-full bg-[#151923] border border-slate-700 text-white rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={novoPlano.objetivo_estrategico}
                onChange={e => setNovoPlano({...novoPlano, objetivo_estrategico: e.target.value})}
              />
            </div>
          </div>

          <div className="h-px w-full bg-slate-700/50 my-6" />

          {/* Iteração dos Treinos */}
          <div className="space-y-6">
            {novoPlano.treinos.map((treino, tIndex) => (
              <div key={tIndex} className="bg-[#151923] border border-slate-700 rounded-xl p-5 relative">
                
                <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-end">
                  <div className="w-full md:w-1/4">
                     <label className="block text-[10px] text-blue-400 font-bold uppercase mb-1">Letra do Treino</label>
                     <input 
                        type="text" value={treino.nome}
                        onChange={e => handleTreinoChange(tIndex, 'nome', e.target.value)}
                        className="w-full bg-[#1e2330] border border-slate-700 text-white font-bold text-lg rounded-lg p-2 text-center"
                     />
                  </div>
                  <div className="w-full md:w-3/4">
                     <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Foco / Descrição</label>
                     <input 
                        type="text" placeholder="Ex: Peito e Tríceps" value={treino.descricao}
                        onChange={e => handleTreinoChange(tIndex, 'descricao', e.target.value)}
                        className="w-full bg-[#1e2330] border border-slate-700 text-white rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                     />
                  </div>
                  {novoPlano.treinos.length > 1 && (
                    <button onClick={() => handleRemoveTreino(tIndex)} className="p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {treino.prescricoes.map((ex, exIndex) => (
                    <div key={exIndex} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-[#1e2330] p-2 rounded-lg border border-slate-700/50">
                      <span className="text-slate-500 font-bold text-xs w-6 text-center">{exIndex + 1}</span>
                      
                      <input 
                        type="text" placeholder="Nome do Exercício" value={ex.nome_exercicio}
                        onChange={e => handleExercicioChange(tIndex, exIndex, 'nome_exercicio', e.target.value)}
                        className="flex-grow bg-transparent border-b border-slate-600 focus:border-blue-500 text-white text-sm p-1 outline-none"
                      />
                      
                      <div className="flex gap-2">
                        <input 
                          type="text" title="Séries" value={ex.series}
                          onChange={e => handleExercicioChange(tIndex, exIndex, 'series', e.target.value)}
                          className="w-16 bg-[#151923] border border-slate-600 text-white text-center text-sm p-1 rounded"
                        />
                      <input 
                        type="text" title="Repetições" value={ex.repeticoes}
                        onChange={e => handleExercicioChange(tIndex, exIndex, 'repeticoes', e.target.value)}
                        className="w-16 bg-[#151923] border border-slate-600 text-white text-center text-sm p-1 rounded"
                        />

                      </div>

                      <button onClick={() => handleRemoveExercicio(tIndex, exIndex)} className="text-slate-500 hover:text-red-500 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={() => handleAddExercicio(tIndex)} className="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  <Plus size={14} /> ADICIONAR EXERCÍCIO
                </button>

              </div>
            ))}
          </div>
        </div>

        {/* Footer Fixo do Modal com as Ações Globais */}
        <div className="sticky bottom-0 bg-[#1e2330] z-10 border-t border-slate-700/50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button onClick={handleAddTreino} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-lg flex items-center gap-2">
            <Plus size={16} /> Adicionar Novo Treino (B, C...)
          </button>
          <button onClick={handleFormSubmit} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black uppercase tracking-widest rounded-lg flex items-center gap-2">
            <Save size={18} /> Salvar Plano
          </button>
        </div>

      </div>
    </div>
  );
}
