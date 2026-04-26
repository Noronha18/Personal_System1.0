import { useState, useEffect } from 'react';
import { 
    User, Target, AlertTriangle, Calendar, 
    Dumbbell, DollarSign, Clock, ArrowLeft,
    CheckCircle2, XCircle
} from 'lucide-react';
import { alunoService } from '../../services/api';

export const DetalheAluno = ({ alunoId, onBack }) => {
    const [aluno, setAluno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const carregar = async () => {
            try {
                setLoading(true);
                const data = await alunoService.obterPorId(alunoId);
                setAluno(data);
            } catch (err) {
                setError("Falha ao carregar prontuário");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        carregar();
    }, [alunoId]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 text-slate-500">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest">Acessando Prontuário...</p>
        </div>
    );

    if (error || !aluno) return (
        <div className="p-10 text-center text-red-400 bg-red-500/10 rounded-3xl border border-red-500/20">
            {error || "Aluno não encontrado"}
            <button onClick={onBack} className="block mx-auto mt-4 text-white underline">Voltar</button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cabeçalho de Ação */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={16} /> Voltar para lista
                </button>
                <div className="flex gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border
                        ${aluno.status_financeiro === 'atrasado' 
                            ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                        {aluno.status_financeiro === 'atrasado' ? 'Inadimplente' : 'Em Dia'}
                    </span>
                </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Coluna 1: Perfil e Anamnese */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl">
                                👤
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">{aluno.nome}</h2>
                                <p className="text-slate-500 text-sm font-mono">{aluno.cpf}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <Target className="text-emerald-500 shrink-0" size={18} />
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Objetivo</p>
                                    <p className="text-sm text-slate-300 leading-relaxed">{aluno.objetivo || "Não informado"}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Restrições</p>
                                    <p className="text-sm text-slate-300 leading-relaxed">{aluno.restricoes || "Nenhuma restrição"}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase">Início</p>
                                    <p className="text-sm text-white font-bold">{new Date(aluno.data_inicio).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase">Vencimento</p>
                                    <p className="text-sm text-white font-bold">Dia {aluno.dia_vencimento}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna 2 e 3: Treinos e Histórico */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Seção de Planos de Treino */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Dumbbell className="text-emerald-500" size={20} /> Planos de Treino
                            </h3>
                            <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400">Novo Plano</button>
                        </div>
                        
                        {aluno.planos_treino?.length > 0 ? (
                            <div className="space-y-4">
                                {aluno.planos_treino.map(plano => (
                                    <div key={plano.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-slate-200">{plano.titulo}</p>
                                            <p className="text-[10px] text-slate-500 uppercase">Criado em {new Date(plano.data_inicio).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-bold transition-all">VISUALIZAR</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600 italic text-sm">
                                Nenhum plano de treino ativo.
                            </div>
                        )}
                    </div>

                    {/* Histórico de Atividades Recentes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Últimas Sessões */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Clock size={16} /> Frequência Recente
                            </h3>
                            <div className="space-y-4">
                                {/* Exemplo de item de histórico */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">24/04 - 18:30</span>
                                    <span className="text-emerald-500 font-bold">Realizada</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">22/04 - 19:00</span>
                                    <span className="text-emerald-500 font-bold">Realizada</span>
                                </div>
                                <p className="text-center pt-4 text-[10px] font-bold text-slate-600 uppercase">Ver histórico completo</p>
                            </div>
                        </div>

                        {/* Últimos Pagamentos */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <DollarSign size={16} /> Últimos Pagamentos
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Ref. 04/2026</span>
                                    <span className="text-white font-bold">R$ 250,00</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Ref. 03/2026</span>
                                    <span className="text-white font-bold">R$ 250,00</span>
                                </div>
                                <p className="text-center pt-4 text-[10px] font-bold text-slate-600 uppercase">Ver todos os recibos</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
