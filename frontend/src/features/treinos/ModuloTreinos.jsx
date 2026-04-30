import { useState, useEffect } from 'react';
import { Dumbbell, Trash2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)] animate-in fade-in duration-700">
            {/* Esquerda: Biblioteca */}
            <div className="lg:col-span-4 h-full">
                <BibliotecaExercicios onSelectExercicio={adicionarExercicio} />
            </div>

            {/* Direita: Montagem do Plano */}
            <div className="lg:col-span-8 flex flex-col bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md overflow-hidden relative">
                
                {mensagem.texto && (
                    <div className={`absolute top-4 right-8 px-6 py-3 rounded-2xl font-black text-xs animate-bounce z-10 shadow-2xl flex items-center gap-2
                        ${mensagem.tipo === 'sucesso' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                        {mensagem.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {mensagem.texto}
                    </div>
                )}

                <div className="mb-8 flex flex-col md:flex-row gap-6 items-end">
                    <div className="space-y-2 flex-1 w-full">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Para qual aluno?</label>
                        <select 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500"
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
                            className="w-full bg-transparent border-b border-slate-800 py-3 text-2xl font-black text-white outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
                            value={nomePlano}
                            onChange={(e) => setNomePlano(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={handleSalvar}
                        disabled={prescricoes.length === 0 || !nomePlano || !alunoSelecionado || loading}
                        className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap flex items-center gap-2 uppercase text-xs tracking-widest"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                        {loading ? 'Salvando...' : 'Salvar Plano'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
                    {prescricoes.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4 border-2 border-dashed border-slate-800 rounded-3xl opacity-50">
                             <Dumbbell size={64} className="text-slate-800" />
                             <p className="text-sm font-black uppercase tracking-widest">Selecione exercícios na biblioteca</p>
                        </div>
                    ) : (
                        prescricoes.map((p, index) => (
                            <div key={p.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-center animate-in slide-in-from-right-4 duration-300 group hover:border-emerald-500/30 transition-all">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black flex items-center justify-center text-emerald-500 shadow-inner">
                                            {index + 1}
                                        </span>
                                        <p className="font-black text-lg text-slate-100">{p.nome}</p>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase ml-11 font-black tracking-[0.2em]">{p.grupo}</p>
                                </div>

                                <div className="flex flex-wrap gap-4 items-end">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Séries</label>
                                        <input 
                                            type="number" 
                                            className="w-16 bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-sm text-center font-bold text-white focus:border-emerald-500 outline-none"
                                            value={p.series}
                                            onChange={(e) => atualizarPrescricao(p.id, 'series', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Reps</label>
                                        <input 
                                            type="text" 
                                            className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-sm text-center font-bold text-white focus:border-emerald-500 outline-none"
                                            value={p.repeticoes}
                                            onChange={(e) => atualizarPrescricao(p.id, 'repeticoes', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Carga (kg)</label>
                                        <input 
                                            type="text" 
                                            className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-sm text-center font-bold text-emerald-500 focus:border-emerald-500 outline-none placeholder:text-slate-800"
                                            placeholder="0kg"
                                            value={p.carga}
                                            onChange={(e) => atualizarPrescricao(p.id, 'carga', e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removerExercicio(p.id)}
                                        className="p-3 text-slate-600 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-xl"
                                    >
                                        <Trash2 size={20} />
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
