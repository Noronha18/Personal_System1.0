import { useState, useEffect } from 'react';
import { treinoService } from '../../services/api';

export const BibliotecaExercicios = ({ onSelectExercicio }) => {
    const [exercicios, setExercicios] = useState([]);
    const [grupoAtivo, setGrupoAtivo] = useState('Todos');
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        const carregar = async () => {
            console.log("Biblioteca: Iniciando busca de exercícios...");
            try {
                setLoading(true);
                const data = await treinoService.listarExercicios();
                console.log("Biblioteca: Dados recebidos:", data);
                setExercicios(data || []);
                setErro(null);
            } catch (err) {
                console.error("Biblioteca: Erro ao carregar", err);
                setErro("Falha ao carregar biblioteca");
            } finally {
                setLoading(false);
            }
        };
        carregar();
    }, []);

    const grupos = ['Todos', ...new Set(exercicios.map(ex => ex.grupo_muscular))];

    const exerciciosFiltrados = exercicios.filter(ex => {
        const matchesGrupo = grupoAtivo === 'Todos' || ex.grupo_muscular === grupoAtivo;
        const matchesBusca = ex.nome.toLowerCase().includes(busca.toLowerCase());
        return matchesGrupo && matchesBusca;
    });

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md h-full flex flex-col min-h-[400px]">
            <div className="mb-6 space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-500">📚</span> Biblioteca
                </h3>
                
                <input 
                    type="text"
                    placeholder="Buscar exercício..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {grupos.map(grupo => (
                        <button
                            key={grupo}
                            onClick={() => setGrupoAtivo(grupo)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all
                ${grupoAtivo === grupo 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                        >
                            {grupo}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {loading ? (
                    <div className="text-center py-10 text-slate-500 animate-pulse">Carregando...</div>
                ) : erro ? (
                    <div className="text-center py-10 text-red-500 text-xs">{erro}</div>
                ) : exerciciosFiltrados.length === 0 ? (
                    <div className="text-center py-10 text-slate-600 text-xs font-medium">
                        Nenhum exercício encontrado.
                    </div>
                ) : (
                    exerciciosFiltrados.map(ex => (
                        <div 
                            key={ex.id}
                            onClick={() => onSelectExercicio(ex)}
                            className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{ex.nome}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{ex.grupo_muscular}</p>
                                </div>
                                <span className="text-slate-700 group-hover:text-emerald-500">+</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
