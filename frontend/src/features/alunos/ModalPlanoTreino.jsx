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

const METHOD_BG = {
  'Bi-set':    'bg-method-bi/8',
  'Tri-set':   'bg-method-tri/8',
  'Giant-set': 'bg-method-giant/8',
  'Super-set': 'bg-method-super/8',
};

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
        setStep(2);
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
      nome_exercicio: ex.nome,
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

      <div className="bg-canvas w-full max-w-7xl h-full md:h-[90vh] overflow-hidden rounded-t-[3rem] md:rounded-[3rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-700">

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-surface z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand text-brand-fg rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
              <Dumbbell size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
                {planoEdicao ? 'Editar Plano' : 'Prescrever Plano'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                 <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${step === 1 ? 'bg-brand text-brand-fg' : 'bg-overlay text-text-muted'}`}>1. Info</span>
                 <div className="w-4 h-px bg-border" />
                 <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${step === 2 ? 'bg-brand text-brand-fg' : 'bg-overlay text-text-muted'}`}>2. Treinos</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {step === 1 && !planoEdicao && (
               <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
               >
                 <Book size={16} /> Templates
               </button>
             )}
            <button onClick={onClose} className="p-3 bg-overlay text-text-muted hover:text-text-secondary rounded-full transition-all active:scale-90">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Templates Dropdown Overlay */}
        {showTemplates && step === 1 && (
          <div className="absolute top-28 right-8 w-80 bg-surface border border-border shadow-2xl rounded-3xl z-50 p-4 animate-in zoom-in-95 duration-200">
            <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4 px-2">Modelos Disponíveis</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleImportTemplate(t)}
                  className="w-full text-left p-3 hover:bg-overlay rounded-2xl border border-transparent hover:border-border transition-all group"
                >
                  <p className="font-bold text-text-primary text-sm group-hover:text-brand">{t.titulo}</p>
                  <p className="text-xs text-text-muted font-medium">{t.treinos?.length} treinos • {t.duracao_semanas} semanas</p>
                </button>
              ))}
              {templates.length === 0 && <p className="text-xs text-text-muted p-4 text-center italic">Nenhum modelo global criado.</p>}
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {step === 1 ? (
            /* PASSO 1: INFORMAÇÕES GERAIS */
            <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-center bg-surface">
                <div className="w-full max-w-2xl space-y-12 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center space-y-2">
                        <h3 className="text-4xl font-black text-text-primary tracking-tight">Sobre o que é este plano?</h3>
                        <p className="text-text-secondary font-medium">Defina o título, objetivo estratégico e o tempo de ciclo.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wide ml-1">Título do Plano *</label>
                            <input
                                type="text" placeholder="Ex: Protocolo de Verão - Cutting"
                                className="w-full bg-overlay border border-border rounded-3xl px-8 py-6 text-xl text-text-primary font-black focus:ring-4 focus:ring-brand/10 outline-none transition-all placeholder:text-text-muted"
                                value={novoPlano.titulo}
                                onChange={e => setNovoPlano({...novoPlano, titulo: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wide ml-1">Objetivo Estratégico</label>
                                <input
                                    type="text" placeholder="Ex: Perda de Gordura"
                                    className="w-full bg-overlay border border-border rounded-3xl px-6 py-5 text-text-primary font-bold focus:ring-4 focus:ring-brand/10 outline-none transition-all"
                                    value={novoPlano.objetivo_estrategico}
                                    onChange={e => setNovoPlano({...novoPlano, objetivo_estrategico: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wide ml-1">Duração (Semanas)</label>
                                <input
                                    type="number"
                                    className="w-full bg-overlay border border-border rounded-3xl px-6 py-5 text-text-primary font-bold focus:ring-4 focus:ring-brand/10 outline-none transition-all"
                                    value={novoPlano.duracao_semanas}
                                    onChange={e => setNovoPlano({...novoPlano, duracao_semanas: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wide ml-1">Observações Gerais (Opcional)</label>
                            <textarea
                                placeholder="Descreva detalhes importantes sobre o plano, restrições ou dicas de execução geral."
                                className="w-full bg-overlay border border-border rounded-3xl px-6 py-5 text-text-primary font-medium focus:ring-4 focus:ring-brand/10 outline-none transition-all min-h-[120px] resize-none"
                                value={novoPlano.detalhes}
                                onChange={e => setNovoPlano({...novoPlano, detalhes: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            disabled={!novoPlano.titulo}
                            onClick={() => setStep(2)}
                            className="w-full py-6 bg-brand hover:bg-brand-hover disabled:bg-overlay disabled:text-text-muted text-brand-fg rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95"
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
                <div className="w-[380px] border-r border-border bg-surface overflow-hidden flex flex-col">
                    <BibliotecaExercicios onSelectExercicio={handleAddFromLibrary} />
                </div>

                {/* Lado Direito: Montagem */}
                <div className="flex-1 bg-canvas overflow-hidden flex flex-col">

                    {/* Tabs de Treinos */}
                    <div className="bg-surface p-4 border-b border-border flex items-center gap-2 overflow-x-auto custom-scrollbar">
                        {novoPlano.treinos.map((treino, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTreinoIndex(idx)}
                                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3
                                    ${activeTreinoIndex === idx
                                        ? 'bg-brand text-brand-fg shadow-lg shadow-brand/20'
                                        : 'bg-overlay text-text-muted hover:bg-overlay'}`}
                            >
                                <span>{treino.nome || `Treino ${idx + 1}`}</span>
                                {activeTreinoIndex === idx && novoPlano.treinos.length > 1 && (
                                    <X
                                        size={14}
                                        className="hover:text-danger transition-colors"
                                        onClick={(e) => { e.stopPropagation(); handleRemoveTreino(idx); }}
                                    />
                                )}
                            </button>
                        ))}
                        <button
                            onClick={handleAddTreino}
                            className="w-10 h-10 flex-shrink-0 bg-overlay text-text-muted hover:bg-brand/5 hover:text-brand rounded-xl flex items-center justify-center transition-all border border-dashed border-border"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Editor do Treino Ativo */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

                        <div className="flex items-center gap-4 bg-surface p-6 rounded-[2rem] border border-border shadow-sm animate-in slide-in-from-top-4 duration-500">
                             <div className="w-12 h-12 bg-text-primary text-brand-fg rounded-2xl flex items-center justify-center font-black text-xl">
                                {activeTreinoIndex < 26 ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[activeTreinoIndex] : "#"}
                             </div>
                             <div className="flex-1">
                                <label className="text-2xs font-black text-text-muted uppercase tracking-widest ml-1">Identificação do Treino</label>
                                <input
                                    type="text"
                                    className="w-full bg-transparent text-2xl font-black text-text-primary outline-none placeholder:text-text-muted"
                                    value={novoPlano.treinos[activeTreinoIndex].nome}
                                    onChange={e => handleTreinoChange(activeTreinoIndex, 'nome', e.target.value)}
                                    placeholder="Ex: A - Peito e Tríceps"
                                />
                             </div>
                        </div>

                        <div className="space-y-4">
                            {novoPlano.treinos[activeTreinoIndex].prescricoes.length === 0 ? (
                                <div className="py-20 text-center space-y-4 text-text-muted border-2 border-dashed border-border rounded-[3rem]">
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

                                    const groupClasses = `
                                        ${prevIsSame ? 'mt-0 border-t-0 rounded-t-none' : 'mt-4 rounded-t-3xl'}
                                        ${nextIsSame ? 'mb-0 rounded-b-none' : 'mb-4 rounded-b-3xl'}
                                    `;

                                    return (
                                        <div
                                            key={exIdx}
                                            className={`bg-surface border border-border p-6 flex flex-wrap md:flex-nowrap items-center gap-6 shadow-sm hover:shadow-md transition-all group animate-in slide-in-from-right-4 duration-300 ${groupClasses} ${isGrouping ? (METHOD_BG[presc.metodo] || '') : ''}`}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-overlay flex items-center justify-center text-xs font-black text-text-muted">
                                                {exIdx + 1}
                                            </div>

                                            <div className="flex-1 min-w-[150px]">
                                                <p className="text-lg font-black text-text-primary leading-tight">{presc.nome_exercicio}</p>
                                                <input
                                                    type="text"
                                                    placeholder="Adicionar nota (ex: Até a falha)"
                                                    className="w-full bg-transparent text-xs text-text-muted font-black uppercase tracking-widest mt-1 outline-none border-b border-transparent focus:border-brand/20"
                                                    value={presc.observacoes || ''}
                                                    onChange={e => handleExercicioChange(activeTreinoIndex, exIdx, 'observacoes', e.target.value)}
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-2xs font-black text-text-muted uppercase tracking-widest text-center block">Séries</label>
                                                    <input
                                                        type="number" value={presc.series}
                                                        className="w-14 bg-overlay border border-border rounded-xl py-2 text-center text-sm font-black text-text-primary"
                                                        onChange={e => handleExercicioChange(activeTreinoIndex, exIdx, 'series', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-2xs font-black text-text-muted uppercase tracking-widest text-center block">Reps</label>
                                                    <input
                                                        type="text" value={presc.repeticoes}
                                                        className="w-16 bg-overlay border border-border rounded-xl py-2 text-center text-sm font-black text-text-primary"
                                                        onChange={e => handleExercicioChange(activeTreinoIndex, exIdx, 'repeticoes', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-2xs font-black text-text-muted uppercase tracking-widest text-center block">Carga</label>
                                                    <input
                                                        type="text" value={presc.carga}
                                                        className="w-16 bg-overlay border border-border rounded-xl py-2 text-center text-sm font-black text-accent"
                                                        onChange={e => handleExercicioChange(activeTreinoIndex, exIdx, 'carga', e.target.value)}
                                                        placeholder="0kg"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-2xs font-black text-text-muted uppercase tracking-widest text-center block">Desc.</label>
                                                    <input
                                                        type="number"
                                                        value={nextIsSame ? 0 : presc.descanso}
                                                        disabled={nextIsSame}
                                                        className={`w-14 border border-border rounded-xl py-2 text-center text-sm font-black transition-all ${
                                                            nextIsSame ? 'bg-overlay/50 text-text-muted cursor-not-allowed' : 'bg-overlay text-text-muted'
                                                        }`}
                                                        onChange={e => handleExercicioChange(activeTreinoIndex, exIdx, 'descanso', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-2xs font-black text-text-muted uppercase tracking-widest text-center block">Método</label>
                                                    <select
                                                        value={presc.metodo}
                                                        className="w-24 bg-overlay border border-border rounded-xl py-2 px-2 text-center text-xs font-black text-text-primary outline-none appearance-none cursor-pointer"
                                                        onChange={e => handleExercicioChange(activeTreinoIndex, exIdx, 'metodo', e.target.value)}
                                                    >
                                                        {METODOS_TREINO.map(m => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <button onClick={() => handleRemoveExercicio(activeTreinoIndex, exIdx)} className="p-2 text-text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100">
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
        <div className="p-6 md:p-8 bg-surface border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 w-full md:w-auto">
             {step === 2 && (
                 <button
                    onClick={() => setStep(1)}
                    className="px-6 py-4 bg-overlay hover:bg-overlay text-text-muted rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
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
                        className="flex-1 md:flex-none px-8 py-4 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Salvar como Modelo
                    </button>
                )}
                <button
                    onClick={handleFormSubmit}
                    disabled={novoPlano.treinos.every(t => t.prescricoes.length === 0)}
                    className="flex-1 md:flex-none px-12 py-4 bg-brand hover:bg-brand-hover disabled:opacity-50 text-brand-fg rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand/20 active:scale-95 flex items-center justify-center gap-2"
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
