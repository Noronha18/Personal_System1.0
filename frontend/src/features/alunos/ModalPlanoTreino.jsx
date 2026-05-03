import React, { useState, useEffect } from 'react';
import { X, Dumbbell, Trash2, Plus, Save, Copy, Book } from 'lucide-react';
import { treinoService } from '../../services/api';

export function ModalPlanoTreino({ isOpen, onClose, onSave, planoEdicao = null }) {
  const [novoPlano, setNovoPlano] = useState({
    titulo: '',
    objetivo_estrategico: '',
    duracao_semanas: 4,
    treinos: [
      {
        nome: 'A',
        prescricoes: [{ exercicio_id: '', series: 3, repeticoes: '10', carga: '', descanso: 60 }]
      }
    ]
  });

  const [exerciciosDb, setExerciciosDb] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      carregarDados();
      if (planoEdicao) {
        setNovoPlano(planoEdicao);
      } else {
        setNovoPlano({
          titulo: '',
          objetivo_estrategico: '',
          duracao_semanas: 4,
          treinos: [{ nome: 'A', prescricoes: [{ exercicio_id: '', series: 3, repeticoes: '10', carga: '', descanso: 60 }] }]
        });
      }
    }
  }, [isOpen, planoEdicao]);

  const carregarDados = async () => {
    try {
      const [exs, tmpls] = await Promise.all([
        treinoService.listarExercicios(),
        treinoService.listarTemplates()
      ]);
      setExerciciosDb(exs);
      setTemplates(tmpls);
    } catch (err) {
      console.error("Erro ao carregar dados auxiliares:", err);
    }
  };

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
          prescricoes: [{ exercicio_id: '', series: 3, repeticoes: '10', carga: '', descanso: 60 }]
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
      exercicio_id: '', series: 3, repeticoes: '10', carga: '', descanso: 60 
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

  const handleImportTemplate = (template) => {
    setNovoPlano({
      ...novoPlano,
      titulo: template.titulo,
      objetivo_estrategico: template.objetivo_estrategico,
      duracao_semanas: template.duracao_semanas,
      treinos: template.treinos.map(t => ({
        nome: t.nome,
        prescricoes: t.prescricoes.map(p => ({
          exercicio_id: p.exercicio_id,
          series: p.series,
          repeticoes: p.repeticoes,
          carga: p.carga_kg, // Backend usa carga no Create/Update e carga_kg no Public
          descanso: p.tempo_descanso_segundos
        }))
      }))
    });
    setShowTemplates(false);
  };

  const handleFormSubmit = () => {
    // Sanitização para o backend
    const payload = {
      ...novoPlano,
      treinos: novoPlano.treinos.map(t => ({
        ...t,
        prescricoes: t.prescricoes.map(p => ({
          ...p,
          exercicio_id: parseInt(p.exercicio_id),
          series: parseInt(p.series),
          descanso: parseInt(p.descanso)
        }))
      }))
    };
    onSave(payload);
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
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {planoEdicao ? 'Editar Plano' : 'Prescrever Plano'}
              </h2>
              <p className="text-slate-500 font-medium text-sm">Estruture a rotina de performance do aluno.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {!planoEdicao && (
               <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
               >
                 <Book size={16} /> Templates
               </button>
             )}
            <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all active:scale-90">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Templates Dropdown Overlay */}
        {showTemplates && (
          <div className="absolute top-28 right-8 w-80 bg-white border border-black/5 shadow-2xl rounded-3xl z-50 p-4 animate-in zoom-in-95 duration-200">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Modelos Disponíveis</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {templates.map(t => (
                <button 
                  key={t.id}
                  onClick={() => handleImportTemplate(t)}
                  className="w-full text-left p-3 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-black/5 transition-all group"
                >
                  <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">{t.titulo}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{t.treinos?.length} treinos • {t.duracao_semanas} semanas</p>
                </button>
              ))}
              {templates.length === 0 && <p className="text-xs text-slate-400 p-4 text-center italic">Nenhum modelo global criado.</p>}
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar">
          
          {/* Plano Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm">
            <div className="space-y-2 md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Plano *</label>
              <input 
                type="text" placeholder="Ex: Hipertrofia Q1"
                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={novoPlano.titulo}
                onChange={e => setNovoPlano({...novoPlano, titulo: e.target.value})}
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objetivo Estratégico</label>
              <input 
                type="text" placeholder="Ex: Ganho de Massa"
                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={novoPlano.objetivo_estrategico}
                onChange={e => setNovoPlano({...novoPlano, objetivo_estrategico: e.target.value})}
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duração (Semanas)</label>
              <input 
                type="number"
                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={novoPlano.duracao_semanas}
                onChange={e => setNovoPlano({...novoPlano, duracao_semanas: parseInt(e.target.value)})}
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
                      value={treino.nome} // No backend 'nome' é o identificador como 'A', 'B'
                      onChange={e => handleTreinoChange(tIndex, 'nome', e.target.value)}
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
                        <select 
                          className="w-full bg-transparent text-lg font-bold text-slate-900 outline-none"
                          value={ex.exercicio_id}
                          onChange={e => handleExercicioChange(tIndex, exIndex, 'exercicio_id', e.target.value)}
                        >
                          <option value="">Selecione o exercício...</option>
                          {exerciciosDb.map(e => (
                            <option key={e.id} value={e.id}>{e.nome}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center block">Séries</label>
                          <input 
                            type="number" value={ex.series}
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
                            type="text" value={ex.carga || ex.carga_kg}
                            className="w-16 bg-slate-50 border border-black/5 rounded-xl py-2 text-center text-sm font-black text-emerald-600"
                            onChange={e => handleExercicioChange(tIndex, exIndex, 'carga', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center block">Desc.</label>
                          <input 
                            type="number" value={ex.descanso || ex.tempo_descanso_segundos}
                            className="w-16 bg-slate-50 border border-black/5 rounded-xl py-2 text-center text-sm font-black text-slate-400"
                            onChange={e => handleExercicioChange(tIndex, exIndex, 'descanso', e.target.value)}
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
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={handleAddTreino}
              className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Treino
            </button>
            {!planoEdicao && (
              <button 
                onClick={() => {
                  // Lógica para salvar como template global
                  const payload = {
                    ...novoPlano,
                    treinos: novoPlano.treinos.map(t => ({
                      ...t,
                      prescricoes: t.prescricoes.map(p => ({
                        ...p,
                        exercicio_id: parseInt(p.exercicio_id),
                        series: parseInt(p.series),
                        descanso: parseInt(p.descanso)
                      }))
                    }))
                  };
                  treinoService.criarTemplate(payload).then(() => {
                    alert("Modelo global salvo com sucesso!");
                    carregarDados();
                  });
                }}
                className="px-6 py-4 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={18} /> Como Modelo
              </button>
            )}
          </div>
          <button 
            onClick={handleFormSubmit}
            className="w-full md:w-auto px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Save size={18} /> {planoEdicao ? 'Salvar Alterações' : 'Salvar Plano Completo'}
          </button>
        </div>

      </div>
    </div>
  );
}
