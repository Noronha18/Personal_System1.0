import { useState, useEffect } from 'react';
import { BibliotecaExercicios } from './BibliotecaExercicios';
import { alunoService, treinoService } from '../../services/api';

export const ModuloTreinos = () => {
    const [alunos, setAlunos] = useState([]);
    const [alunoSelecionado, setAlunoSelecionado] = useState('');
    const [prescricoes, setPrescricoes] = useState([]);
    const [nomePlano, setNomePlano] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        alunoService.listar().then(setAlunos).catch(console.error);
    }, []);

    const adicionarExercicio = (ex) => {
        const novaPrescricao = {
            id: Date.now(),
            exercicio_id: ex.id,
            nome: ex.nome,
            grupo: ex.grupo_muscular,
            series: 3,
            repeticoes: '12',
            descanso: 60,
            carga: ''
        };
        setPrescricoes([...prescricoes, novaPrescricao]);
    };

    const removerExercicio = (id) => {
        setPrescricoes(prescricoes.filter(p => p.id !== id));
    };

    const atualizarPrescricao = (id, campo, valor) => {
        setPrescricoes(prescricoes.map(p => 
            p.id === id ? { ...p, [campo]: valor } : p
        ));
    };

    const handleSalvar = async () => {
        if (!alunoSelecionado || !nomePlano || prescricoes.length === 0) return;
        
        setLoading(true);
        setMensagem({ tipo: '', texto: '' });

        const payload = {
            titulo: nomePlano,
            treinos: [
                {
                    nome: "Treino Principal",
                    prescricoes: prescricoes.map(p => ({
                        exercicio_id: p.exercicio_id,
                        series: parseInt(p.series),
                        repeticoes: p.repeticoes,
                        carga: p.carga,
                        descanso: parseInt(p.descanso)
                    }))
                }
            ]
        };

        try {
            await treinoService.criarPlano(alunoSelecionado, payload);
            setMensagem({ tipo: 'sucesso', texto: 'Plano salvo com sucesso!' });
            // Limpa o formulário após 2 segundos
            setTimeout(() => {
                setPrescricoes([]);
                setNomePlano('');
                setAlunoSelecionado('');
                setMensagem({ tipo: '', texto: '' });
            }, 2000);
        } catch (err) {
            setMensagem({ tipo: 'erro', texto: 'Erro ao salvar o plano.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
            {/* Esquerda: Biblioteca */}
            <div className="lg:col-span-4 h-full">
                <BibliotecaExercicios onSelectExercicio={adicionarExercicio} />
            </div>

            {/* Direita: Montagem do Plano */}
            <div className="lg:col-span-8 flex flex-col bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md overflow-hidden relative">
                
                {mensagem.texto && (
                    <div className={`absolute top-4 right-8 px-6 py-2 rounded-xl font-bold text-xs animate-bounce z-10 shadow-lg
                        ${mensagem.tipo === 'sucesso' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                        {mensagem.texto}
                    </div>
                )}

                <div className="mb-8 flex flex-col md:flex-row gap-6 items-end">
                    <div className="space-y-2 flex-1 w-full">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Para qual aluno?</label>
                        <select 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500"
                            value={alunoSelecionado}
                            onChange={(e) => setAlunoSelecionado(e.target.value)}
                        >
                            <option value="">Selecione um aluno...</option>
                            {alunos.map(aluno => (
                                <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2 flex-[2] w-full">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título do Plano</label>
                        <input 
                            type="text"
                            placeholder="Ex: Hipertrofia - Ciclo A"
                            className="w-full bg-transparent border-b border-slate-800 py-2 text-xl font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                            value={nomePlano}
                            onChange={(e) => setNomePlano(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={handleSalvar}
                        disabled={prescricoes.length === 0 || !nomePlano || !alunoSelecionado || loading}
                        className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                    >
                        {loading ? 'Salvando...' : 'Salvar Plano'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
                    {prescricoes.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 border-2 border-dashed border-slate-800 rounded-3xl">
                             <span className="text-4xl opacity-20">🏋️‍♂️</span>
                             <p className="text-sm font-medium">Selecione exercícios na biblioteca para começar</p>
                        </div>
                    ) : (
                        prescricoes.map((p, index) => (
                            <div key={p.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center animate-in slide-in-from-right-4 duration-300">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-400">
                                            {index + 1}
                                        </span>
                                        <p className="font-bold text-slate-200">{p.nome}</p>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase ml-9 tracking-widest">{p.grupo}</p>
                                </div>

                                <div className="flex flex-wrap gap-4 items-end">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-600 uppercase">Séries</label>
                                        <input 
                                            type="number" 
                                            className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-sm text-center"
                                            value={p.series}
                                            onChange={(e) => atualizarPrescricao(p.id, 'series', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-600 uppercase">Reps</label>
                                        <input 
                                            type="text" 
                                            className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-sm text-center"
                                            value={p.repeticoes}
                                            onChange={(e) => atualizarPrescricao(p.id, 'repeticoes', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-600 uppercase">Carga (kg)</label>
                                        <input 
                                            type="text" 
                                            className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-sm text-center"
                                            value={p.carga}
                                            onChange={(e) => atualizarPrescricao(p.id, 'carga', e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removerExercicio(p.id)}
                                        className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
