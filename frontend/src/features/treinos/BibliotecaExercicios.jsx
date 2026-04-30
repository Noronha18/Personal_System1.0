import { useState, useEffect } from 'react';
import { Book, Search, Filter, Plus, X, Save } from 'lucide-react';
import { treinoService } from '../../services/api';

export const BibliotecaExercicios = ({ onSelectExercicio }) => {
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
            alert(err.message || "Erro ao salvar exercício");
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
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md h-full flex flex-col min-h-[400px] animate-in fade-in duration-500">
            <div className="mb-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                        <Book className="text-emerald-500" size={20} /> Biblioteca
                    </h3>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={14} /> Novo
                    </button>
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={16} />
                    <input 
                        type="text"
                        placeholder="Buscar exercício..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {grupos.map(grupo => (
                        <button
                            key={grupo}
                            onClick={() => setGrupoAtivo(grupo)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                ${grupoAtivo === grupo 
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-200 hover:border-slate-600'}`}
                        >
                            {grupo}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-3">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sincronizando...</p>
                    </div>
                ) : erro ? (
                    <div className="text-center py-10 text-red-500 text-xs font-bold uppercase">{erro}</div>
                ) : exerciciosFiltrados.length === 0 ? (
                    <div className="text-center py-10 text-slate-600 text-xs font-black uppercase tracking-widest opacity-50">
                        Nenhum exercício encontrado.
                    </div>
                ) : (
                    exerciciosFiltrados.map(ex => (
                        <div 
                            key={ex.id}
                            onClick={() => onSelectExercicio(ex)}
                            className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-800/20 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-black text-slate-200 group-hover:text-emerald-400 transition-colors">{ex.nome}</p>
                                    <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest group-hover:text-slate-500">{ex.grupo_muscular}</p>
                                </div>
                                <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all">
                                    <Plus size={14} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Cadastro */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Novo Exercício</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSalvar} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome do Exercício</label>
                                <input 
                                    type="text"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                                    value={novoExercicio.nome}
                                    onChange={(e) => setNovoExercicio({...novoExercicio, nome: e.target.value})}
                                    placeholder="Ex: Supino Reto"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grupo Muscular</label>
                                <input 
                                    type="text"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                                    value={novoExercicio.grupo_muscular}
                                    onChange={(e) => setNovoExercicio({...novoExercicio, grupo_muscular: e.target.value})}
                                    placeholder="Ex: Peitoral"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">URL do Vídeo (Opcional)</label>
                                <input 
                                    type="url"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                                    value={novoExercicio.video_url}
                                    onChange={(e) => setNovoExercicio({...novoExercicio, video_url: e.target.value})}
                                    placeholder="https://youtube.com/..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    disabled={salvando}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
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
