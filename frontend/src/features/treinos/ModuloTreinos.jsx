import { useState, useEffect } from 'react';
import { Dumbbell, Trash2, Save, AlertCircle, CheckCircle2, UserCircle2 } from 'lucide-react';
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[70vh] animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Esquerda: Biblioteca */}
            <div className="lg:col-span-4 h-full">
                <BibliotecaExercicios onSelectExercicio={adicionarExercicio} />
            </div>

            {/* Direita: Montagem do Plano */}
            <div className="lg:col-span-8 flex flex-col bg-white border border-black/5 rounded-[2.5rem] p-10 shadow-xl shadow-black/5 overflow-hidden relative">
                
                {mensagem.texto && (
                    <div className={`absolute top-10 right-10 px-6 py-3 rounded-2xl font-black text-xs animate-in slide-in-from-right-full z-20 shadow-2xl flex items-center gap-2
                        ${mensagem.tipo === 'sucesso' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                        {mensagem.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {mensagem.texto}
                    </div>
                )}

                {/* Header do Construtor */}
                <div className="mb-10 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Dumbbell size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Construtor de Planos</h2>
                            <p className="text-slate-500 text-sm font-medium">Arraste a performance para o papel.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <UserCircle2 size={14} className="text-emerald-500" /> Vincular ao Aluno
                            </label>
                            <select 
                                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                                value={alunoSelecionado}
                                onChange={(e) => setAlunoSelecionado(e.target.value)}
                            >
                                <option value="">Selecione o atleta...</option>
                                {alunos.map(aluno => (
                                    <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificação do Plano</label>
                            <input 
                                type="text"
                                placeholder="Ex: Hipertrofia - Ciclo A"
                                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
                                value={nomePlano}
                                onChange={(e) => setNomePlano(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Área de Listagem */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar min-h-[300px]">
                    {prescricoes.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-6 border-2 border-dashed border-slate-100 rounded-[2rem] py-20">
                             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                <Dumbbell size={40} className="text-slate-200" />
                             </div>
                             <p className="text-xs font-black uppercase tracking-widest text-center leading-relaxed">
                                Selecione exercícios na biblioteca<br/>para começar a montar o plano
                             </p>
                        </div>
                    ) : (
                        prescricoes.map((p, index) => (
                            <div key={p.id} className="bg-white border border-black/5 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center animate-in slide-in-from-right-4 duration-500 group hover:shadow-lg hover:shadow-black/5 transition-all">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4">
                                        <span className="w-10 h-10 rounded-xl bg-slate-50 text-[10px] font-black flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-black text-xl text-slate-900 leading-tight">{p.nome}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{p.grupo}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 items-end">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1 text-center block">Séries</label>
                                        <input 
                                            type="number" 
                                            className="w-16 bg-slate-50 border border-black/5 rounded-xl px-2 py-3 text-sm text-center font-black text-slate-900 outline-none"
                                            value={p.series}
                                            onChange={(e) => atualizarPrescricao(p.id, 'series', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1 text-center block">Reps</label>
                                        <input 
                                            type="text" 
                                            className="w-20 bg-slate-50 border border-black/5 rounded-xl px-2 py-3 text-sm text-center font-black text-slate-900 outline-none"
                                            value={p.repeticoes}
                                            onChange={(e) => atualizarPrescricao(p.id, 'repeticoes', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1 text-center block">Carga (kg)</label>
                                        <input 
                                            type="text" 
                                            className="w-20 bg-slate-50 border border-black/5 rounded-xl px-2 py-3 text-sm text-center font-black text-emerald-600 outline-none placeholder:text-slate-200"
                                            placeholder="0kg"
                                            value={p.carga}
                                            onChange={(e) => atualizarPrescricao(p.id, 'carga', e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removerExercicio(p.id)}
                                        className="p-3 text-slate-200 hover:text-red-500 transition-all hover:bg-red-50 rounded-2xl active:scale-90"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer de Ação */}
                <div className="mt-10 pt-8 border-t border-slate-50 flex justify-end">
                    <button 
                        onClick={handleSalvar}
                        disabled={prescricoes.length === 0 || !nomePlano || !alunoSelecionado || loading}
                        className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-100 disabled:text-slate-300 text-white px-10 py-5 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-3 uppercase text-xs tracking-widest"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
                        {loading ? 'Sincronizando...' : 'Finalizar Plano de Treino'}
                    </button>
                </div>
            </div>
        </div>
    );
};
