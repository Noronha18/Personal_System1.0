import React, { useState, useEffect } from 'react';
import { X, Dumbbell, Trash2, Plus, Save, Book, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { treinoService } from '../../services/api';
import { BibliotecaExercicios } from '../treinos/BibliotecaExercicios';
import { useToast } from '../../components/ToastProvider';

const METODOS_TREINO = [
  "Convencional",
  "Drop-set",
  "Rest-pause",
  "Bi-set",
  "Tri-set",
  "Giant-set",
  "Super-set",
  "Piramidal Crescente",
  "Piramidal Decrescente",
  "Cluster-set",
  "GVT",
  "FST-7",
  "SST",
  "MTUT",
  "Isometria",
  "Excêntrico",
  "Pré-Exaustão",
  "Pós-Exaustão",
  "AMRAP",
  "Myo-reps",
  "21s"
];

const METODOS_AGRUPADORES = ["Bi-set", "Tri-set", "Giant-set", "Super-set"];

export function ModalPlanoTreino({ isOpen, onClose, onSave, planoEdicao = null }) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [activeTreinoIndex, setActiveTreinoIndex] = useState(0);

  const [novoPlano, setNovoPlano] = useState({
    titulo: '',
    objetivo_estrategico: '',
    detalhes: '',
    duracao_semanas: 4,
    treinos: [
      {
        nome: 'Treino A',
        prescricoes: []
      }
    ]
  });

  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      carregarTemplates();
      if (planoEdicao) {
        setNovoPlano({
            ...planoEdicao,
            detalhes: planoEdicao.detalhes || ''
        });
        setStep(2); // Se estiver editando, vai direto para a montagem
      } else {
        setNovoPlano({
          titulo: '',
          objetivo_estrategico: '',
          detalhes: '',
          duracao_semanas: 4,
          treinos: [{ nome: 'Treino A', prescricoes: [] }]
        });
        setStep(1);
        setActiveTreinoIndex(0);
      }
    }
  }, [isOpen, planoEdicao]);

  const carregarTemplates = async () => {
    try {
      const tmpls = await treinoService.listarTemplates();
      setTemplates(tmpls);
    } catch (err) {
      console.error("Erro ao carregar templates:", err);
    }
  };

  if (!isOpen) return null;

  const handleAddTreino = () => {
    const proximasLetras = 'BCDEFGHIJKLMNOPQRSTUVWXYZ';
    const proximaLetra = proximasLetras[novoPlano.treinos.length - 1] || 'Extra';
    
    const novosTreinos = [
      ...novoPlano.treinos,
      {
        nome: `Treino ${proximaLetra}`,
        prescricoes: []
      }
    ];
    setNovoPlano({ ...novoPlano, treinos: novosTreinos });
    setActiveTreinoIndex(novosTreinos.length - 1);
  };

  const handleRemoveTreino = (tIndex) => {
    if (novoPlano.treinos.length > 1) {
      const treinosAtualizados = novoPlano.treinos.filter((_, i) => i !== tIndex);
      setNovoPlano({ ...novoPlano, treinos: treinosAtualizados });
      setActiveTreinoIndex(Math.max(0, tIndex - 1));
    }
  };

  const handleAddFromLibrary = (ex) => {
    const treinosAtualizados = [...novoPlano.treinos];
    treinosAtualizados[activeTreinoIndex].prescricoes.push({ 
      exercicio_id: ex.id,
      nome_exercicio: ex.nome, // Auxiliar para exibição
      series: 3, 
      repeticoes: '12', 
      carga: '', 
      descanso: 60,
      metodo: 'Convencional',
      observacoes: ''
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
      detalhes: template.detalhes || '',
      duracao_semanas: template.duracao_semanas,
      treinos: template.treinos.map(t => ({
        nome: t.nome,
        prescricoes: t.prescricoes.map(p => ({
          exercicio_id: p.exercicio_id,
          nome_exercicio: p.nome_exercicio || (p.exercicio ? p.exercicio.nome : 'Exercício'),
          series: p.series,
          repeticoes: p.repeticoes,
          carga: p.carga_kg,
          descanso: p.tempo_descanso_segundos,
          metodo: p.metodo || 'Convencional',
          observacoes: p.observacoes || ''
        }))
      }))
    });
    setShowTemplates(false);
    setStep(2);
  };

  const handleFormSubmit = () => {
    // Sanitização para o backend
    const payload = {
      ...novoPlano,
      treinos: novoPlano.treinos.map(t => ({
        ...t,
        prescricoes: t.prescricoes.map(p => ({
          exercicio_id: p.exercicio_id,
          series: parseInt(p.series),
          repeticoes: p.repeticoes,
          carga: p.carga,
          descanso: parseInt(p.descanso),
          metodo: p.metodo,
          observacoes: p.observacoes
        }))
      }))
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
      
      <div className="bg-[#F2F2F7] w-full max-w-7xl h-full md:h-[90vh] overflow-hidden rounded-t-[3rem] md:rounded-[3rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-700">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-black/5 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Dumbbell size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {planoEdicao ? 'Editar Plano' : 'Prescrever Plano'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                 <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${step === 1 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>1. Info</span>
                 <div className="w-4 h-px bg-slate-200" />
                 <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${step === 2 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>2. Treinos</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {step === 1 && !planoEdicao && (
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
        {showTemplates && step === 1 && (
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

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {step === 1 ? (
            /* PASSO 1: INFORMAÇÕES GERAIS */
            <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-center bg-white">
                <div className="w-full max-w-2xl space-y-12 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center space-y-2">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">Sobre o que é este plano?</h3>
                        <p className="text-slate-500 font-medium">Defina o título, objetivo estratégico e o tempo de ciclo.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Título do Plano *</label>
                            <input 
                                type="text" placeholder="Ex: Protocolo de Verão - Cutting"
                                className="w-full bg-slate-50 border border-black/5 rounded-3xl px-8 py-6 text-xl text-slate-900 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300"
                                value={novoPlano.titulo}
                                onChange={e => setNovoPlano({...novoPlano, titulo: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Objetivo Estratégico</label>
                                <input 
                                    type="text" placeholder="Ex: Perda de Gordura"
                                    className="w-full bg-slate-50 border border-black/5 rounded-3xl px-6 py-5 text-slate-900 font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                    value={novoPlano.objetivo_estrategico}
                                    onChange={e => setNovoPlano({...novoPlano, objetivo_estrategico: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Duração (Semanas)</label>
                                <input 
                                    type="number"
                                    className="w-full bg-slate-50 border border-black/5 rounded-3xl px-6 py-5 text-slate-900 font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                    value={novoPlano.duracao_semanas}
                                    onChange={e => setNovoPlano({...novoPlano, duracao_semanas: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Observações Gerais (Opcional)</label>
                            <textarea 
                                placeholder="Descreva detalhes importantes sobre o plano, restrições ou dicas de execução geral."
                                className="w-full bg-slate-50 border border-black/5 rounded-3xl px-6 py-5 text-slate-900 font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all min-h-[120px] resize-none"
                                value={novoPlano.detalhes}
                                onChange={e => setNovoPlano({...novoPlano, detalhes: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-8">
                        <button 
                            disabled={!novoPlano.titulo}
                            onClick={() => setStep(2)}
                            className="w-full py-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95"
                        >
                            Continuar para Montagem <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
          ) : (
            /* PASSO 2: CONSTRUTOR LADO A LADO */
            <div className="flex-1 overflow-hidden flex">
                
                {/* Lado Esquerdo: Biblioteca */}
                <div className="w-[380px] border-r border-black/5 bg-white overflow-hidden flex flex-col">
                    <BibliotecaExercicios onSelectExercicio={handleAddFromLibrary} />
                </div>

                {/* Lado Direito: Montagem */}
                <div className="flex-1 bg-[#F2F2F7] overflow-hidden flex flex-col">
                    
                    {/* Tabs de Treinos */}
                    <div className="bg-white p-4 border-b border-black/5 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                        {novoPlano.treinos.map((treino, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTreinoIndex(idx)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3
                                    ${activeTreinoIndex === idx 
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                            >
                                <span>{treino.nome || `Treino ${idx + 1}`}</span>
                                {activeTreinoIndex === idx && novoPlano.treinos.length > 1 && (
                                    <X 
                                        size={14} 
                                        className="hover:text-red-200 transition-colors" 
                                        onClick={(e) => { e.stopPropagation(); handleRemoveTreino(idx); }}
                                    />
                                )}
                            </button>
                        ))}
                        <button 
                            onClick={handleAddTreino}
                            className="w-10 h-10 flex-shrink-0 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 rounded-xl flex items-center justify-center transition-all border border-dashed border-slate-200"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Editor do Treino Ativo */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        
                        <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm animate-in slide-in-from-top-4 duration-500">
                             <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                                {activeTreinoIndex < 26 ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[activeTreinoIndex] : "#"}
                             </div>
                             <div className="flex-1">
                                <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Identificação do Treino</label>
                                <input 
                                    type="text"
                                    className="w-full bg-transparent text-2xl font-black text-slate-900 outline-none placeholder:text-slate-200"
                                    value={novoPlano.treinos[activeTreinoIndex].nome}
                                    onChange={e => handleTreinoChange(activeTreinoIndex, 'nome', e.target.value)}
                                    placeholder="Ex: A - Peito e Tríceps"
                                />
                             </div>
                        </div>

                        <div className="space-y-4">
                            {novoPlano.treinos[activeTreinoIndex].prescricoes.length === 0 ? (
                                <div className="py-20 text-center space-y-4 text-slate-300 border-2 border-dashed border-slate-200 rounded-[3rem]">
                                    <Dumbbell size={48} className="mx-auto opacity-20" />
                                    <p className="text-xs font-black uppercase tracking-widest leading-relaxed">
                                        Selecione um exercício na<br/>biblioteca à esquerda
                                    </p>
                                </div>
                            ) : (
                                novoPlano.treinos[activeTreinoIndex].prescricoes.map((presc, exIdx) => {
                                    const prescricoes = novoPlano.treinos[activeTreinoIndex].prescricoes;
                                    const isGrouping = METODOS_AGRUPADORES.includes(presc.metodo);
                                    const prevIsSame = exIdx > 0 && prescricoes[exIdx - 1].metodo === presc.metodo && isGrouping;
                                    const nextIsSame = exIdx < prescricoes.length - 1 && prescricoes[exIdx + 1].metodo === presc.metodo && isGrouping;
                                    
                                    // Determina estilos de borda e margem baseados no agrupamento
                                    const groupClasses = `
                                        ${prevIsSame ? 'mt-0 border-t-0 rounded-t-none' : 'mt-4 rounded-t-3xl'} 
                                        ${nextIsSame ? 'mb-0 rounded-b-none' : 'mb-4 rounded-b-3xl'}
                                    `;

                                    return (
                                        <div 
                                            key={exIdx} 
                                            className={`relative bg-white border border-black/5 p-6 flex flex-wrap md:flex-nowrap items-center gap-6 shadow-sm hover:shadow-md transition-all group animate-in slide-in-from-right-4 duration-300 ${groupClasses}`}
                                        >
                                            {/* Indicador Visual de Grupo (Barra Lateral) */}
                                            {isGrouping && (
                                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 z-10 ${
                                                    presc.metodo === 'Bi-set' ? 'bg-blue-500' :
                                                    presc.metodo === 'Tri-set' ? 'bg-purple-500' :
                                                    presc.metodo === 'Giant-set' ? 'bg-orange-500' :
                                                    'bg-emerald-500'
                                                }`} title={presc.metodo} />
                                            )}

                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                {exIdx + 1}
                                            </div>
                                            
                                            <div className="flex-1 min-w-[150px]">
                                                <p className="text-lg font-black text-slate-900 leading-tight">{presc.nome_exercicio}</p>
                                                <input 
                                                    type="text"
                                                    placeholder="Adicionar nota (ex: Até a falha)"
                                                    className="w-full bg-transparent text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 outline-none border-b border-transparent focus:border-emerald-500/20"
                                                    value={presc.observacoes || ''}
                                                    onChange={e => handleExercicioChange(activeTreinoIndex, exIdx, 'observacoes', e.target.value)}
                                                />
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center block">Séries</label>
                                                    <input 
                                                        type="number" value={presc.series}
                                                        className="w-14 bg-slate-50 border border-black/5 rounded-xl py-2 text-center text-sm font-black text-slate-900"
                                                        onChange={e => handleExercicioChange(activeTreinoIndex, exIdx, 'series', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center block">Reps</label>
                                                    <input 
                                                        type="text" value={presc.repeticoes}
                                                        className="w-16 bg-slate-50 border border-black/5 rounded-xl py-2 text-center text-sm font-black text-slate-900"
                                                        onChange={e => handleExercicioChange(activeTreinoIndex, exIdx, 'repeticoes', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center block">Carga</label>
                                                    <input 
                                                        type="text" value={presc.carga}
                                                        className="w-16 bg-slate-50 border border-black/5 rounded-xl py-2 text-center text-sm font-black text-emerald-600"
                                                        onChange={e => handleExercicioChange(activeTreinoIndex, exIdx, 'carga', e.target.value)}
                                                        placeholder="0kg"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center block">Desc.</label>
                                                    <input 
                                                        type="number" 
                                                        value={nextIsSame ? 0 : presc.descanso}
                                                        disabled={nextIsSame}
                                                        className={`w-14 border border-black/5 rounded-xl py-2 text-center text-sm font-black transition-all ${
                                                            nextIsSame ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-50 text-slate-400'
                                                        }`}
                                                        onChange={e => handleExercicioChange(activeTreinoIndex, exIdx, 'descanso', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center block">Método</label>
                                                    <select 
                                                        value={presc.metodo}
                                                        className="w-24 bg-slate-50 border border-black/5 rounded-xl py-2 px-2 text-center text-[10px] font-black text-slate-900 outline-none appearance-none cursor-pointer"
                                                        onChange={e => handleExercicioChange(activeTreinoIndex, exIdx, 'metodo', e.target.value)}
                                                    >
                                                        {METODOS_TREINO.map(m => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <button onClick={() => handleRemoveExercicio(activeTreinoIndex, exIdx)} className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                            )}
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 bg-white border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 w-full md:w-auto">
             {step === 2 && (
                 <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <ChevronLeft size={16} /> Voltar
                </button>
             )}
          </div>
          
          {step === 2 && (
              <div className="flex gap-3 w-full md:w-auto">
                {!planoEdicao && (
                    <button 
                        onClick={() => {
                        const payload = {
                            ...novoPlano,
                            treinos: novoPlano.treinos.map(t => ({
                            ...t,
                            prescricoes: t.prescricoes.map(p => ({
                                ...p,
                                exercicio_id: parseInt(p.exercicio_id),
                                series: parseInt(p.series),
                                descanso: parseInt(p.descanso),
                                metodo: p.metodo,
                                observacoes: p.observacoes
                            }))
                            }))
                        };
                        treinoService.criarTemplate(payload).then(() => {
                            toast({ tipo: 'sucesso', texto: 'Modelo global salvo com sucesso!' });
                            carregarTemplates();
                        });
                        }}
                        className="flex-1 md:flex-none px-8 py-4 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Salvar como Modelo
                    </button>
                )}
                <button 
                    onClick={handleFormSubmit}
                    disabled={novoPlano.treinos.every(t => t.prescricoes.length === 0)}
                    className="flex-1 md:flex-none px-12 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    <CheckCircle2 size={18} /> {planoEdicao ? 'Salvar Alterações' : 'Finalizar Plano'}
                </button>
              </div>
          )}
        </div>

      </div>
    </div>
  );
}
