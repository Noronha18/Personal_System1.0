import { useState, useEffect } from 'react';
import { Book, Search, Plus, X, Save } from 'lucide-react';
import { treinoService } from '../../services/api';
import { useToast } from '../../components/ToastProvider';

export const BibliotecaExercicios = ({ onSelectExercicio }) => {
    const toast = useToast();
    const [exercicios, setExercicios] = useState([]);
    const [grupoAtivo, setGrupoAtivo] = useState('Todos');
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    
    // Estado do Modal de Cadastro
    const [showModal, setShowModal] = useState(false);
    const [novoExercicio, setNovoExercicio] = useState({
        nome: '',
        grupo_muscular: '',
        video_url: ''
    });
    const [salvando, setSalvando] = useState(false);

    const carregar = async () => {
        try {
            setLoading(true);
            const data = await treinoService.listarExercicios();
            setExercicios(data || []);
            setErro(null);
        } catch (err) {
            console.error("Biblioteca: Erro ao carregar", err);
            setErro("Falha ao carregar biblioteca");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregar();
    }, []);

    const handleSalvar = async (e) => {
        e.preventDefault();
        if (!novoExercicio.nome || !novoExercicio.grupo_muscular) return;

        try {
            setSalvando(true);
            await treinoService.criarExercicio(novoExercicio);
            await carregar(); // Recarrega a lista
            setShowModal(false);
            setNovoExercicio({ nome: '', grupo_muscular: '', video_url: '' });
        } catch (err) {
            toast({ tipo: 'erro', texto: err.message || "Erro ao salvar exercício" });
        } finally {
            setSalvando(false);
        }
    };

    const grupos = ['Todos', ...new Set(exercicios.map(ex => ex.grupo_muscular))];

    const exerciciosFiltrados = exercicios.filter(ex => {
        const matchesGrupo = grupoAtivo === 'Todos' || ex.grupo_muscular === grupoAtivo;
        const matchesBusca = ex.nome.toLowerCase().includes(busca.toLowerCase());
        return matchesGrupo && matchesBusca;
    });

    return (
        <div className="bg-white border border-black/5 rounded-[2.5rem] p-8 shadow-xl shadow-black/5 h-full flex flex-col min-h-[400px] animate-in fade-in duration-700">
            <div className="mb-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                        <Book className="text-emerald-500" size={20} /> Biblioteca
                    </h3>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-emerald-500 hover:text-white text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        <Plus size={14} /> Novo
                    </button>
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                    <input 
                        type="text"
                        placeholder="Buscar exercício..."
                        className="w-full bg-slate-50 border border-black/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {grupos.map(grupo => (
                        <button
                            key={grupo}
                            onClick={() => setGrupoAtivo(grupo)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                ${grupoAtivo === grupo 
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-50 text-slate-400 border-black/5 hover:text-slate-600 hover:bg-slate-100'}`}
                        >
                            {grupo}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando...</p>
                    </div>
                ) : erro ? (
                    <div className="text-center py-10 text-red-500 text-xs font-bold uppercase">{erro}</div>
                ) : exerciciosFiltrados.length === 0 ? (
                    <div className="text-center py-20 text-slate-300 text-xs font-black uppercase tracking-widest opacity-50 italic">
                        Nenhum resultado.
                    </div>
                ) : (
                    exerciciosFiltrados.map(ex => (
                        <div 
                            key={ex.id}
                            onClick={() => onSelectExercicio(ex)}
                            className="p-5 bg-white border border-black/5 rounded-2xl hover:border-emerald-500/30 hover:bg-slate-50 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-bold text-slate-900 group-hover:text-emerald-500 transition-colors leading-tight">{ex.nome}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 group-hover:text-slate-500">{ex.grupo_muscular}</p>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-black/5 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 group-hover:border-emerald-500/20 group-hover:bg-white transition-all shadow-sm">
                                    <Plus size={16} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Cadastro */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white border border-black/5 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Novo Exercício</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSalvar} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Nome do Exercício</label>
                                <input 
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-300"
                                    value={novoExercicio.nome}
                                    onChange={(e) => setNovoExercicio({...novoExercicio, nome: e.target.value})}
                                    placeholder="Ex: Supino Reto"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Grupo Muscular</label>
                                <input 
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-300"
                                    value={novoExercicio.grupo_muscular}
                                    onChange={(e) => setNovoExercicio({...novoExercicio, grupo_muscular: e.target.value})}
                                    placeholder="Ex: Peitoral"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">URL do Vídeo (Opcional)</label>
                                <input 
                                    type="url"
                                    className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-300"
                                    value={novoExercicio.video_url}
                                    onChange={(e) => setNovoExercicio({...novoExercicio, video_url: e.target.value})}
                                    placeholder="https://youtube.com/..."
                                />
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Voltar
                                </button>
                                <button 
                                    type="submit"
                                    disabled={salvando}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    {salvando ? 'Salvando...' : <><Save size={16} /> Salvar</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
