import { useState, useEffect } from 'react';
import { 
    User, Target, AlertTriangle, Calendar, 
    Dumbbell, DollarSign, Clock, ArrowLeft,
    CheckCircle2, Trash2, Plus, Eye, History, Receipt, ChevronDown, ChevronUp
} from 'lucide-react';
import { alunoService, treinoService } from '../../services/api';
import { ModalPlanoTreino } from './ModalPlanoTreino';

export const DetalheAluno = ({ alunoId, onBack }) => {
    const [aluno, setAluno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalPlnoOpen, setIsModalPlanoOpen] = useState(false);
    const [planoSelecionado, setPlanoSelecionado] = useState(null);
    
    // Estados para expansão de listas
    const [expandirSessoes, setExpandirSessoes] = useState(false);
    const [expandirPagamentos, setExpandirPagamentos] = useState(false);

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

    useEffect(() => {
        carregar();
    }, [alunoId]);

    const handleDeleteAluno = async () => {
        if (confirm(`⚠️ ATENÇÃO: Tem certeza que deseja EXCLUIR permanentemente o cadastro de ${aluno.nome}? Todos os treinos e históricos serão perdidos.`)) {
            try {
                await alunoService.deletar(alunoId);
                alert("Aluno excluído com sucesso.");
                onBack();
            } catch (err) {
                alert("Erro ao excluir aluno: " + err.message);
            }
        }
    };

    const handleSavePlano = async (novoPlano) => {
        try {
            await treinoService.criarPlano(alunoId, novoPlano);
            alert("Plano de treino criado com sucesso!");
            carregar(); 
            setIsModalPlanoOpen(false);
        } catch (err) {
            alert("Erro ao salvar plano: " + err.message);
        }
    };

    const handleDeletePlano = async (planoId) => {
        if (confirm("⚠️ Deseja excluir este plano de treino permanentemente?")) {
            try {
                await treinoService.deletarPlano(planoId);
                alert("Plano excluído com sucesso!");
                setPlanoSelecionado(null);
                carregar();
            } catch (err) {
                alert("Erro ao excluir plano: " + err.message);
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 text-slate-500">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Acessando Prontuário...</p>
        </div>
    );

    if (error || !aluno) return (
        <div className="p-10 text-center text-red-400 bg-red-500/10 rounded-3xl border border-red-500/20">
            {error || "Aluno não encontrado"}
            <button onClick={onBack} className="block mx-auto mt-4 text-white underline font-bold uppercase text-xs">Voltar para lista</button>
        </div>
    );

    const sessoesExibidas = expandirSessoes ? aluno.sessoes : aluno.sessoes?.slice(0, 3);
    const pagamentosExibidos = expandirPagamentos ? aluno.pagamentos : aluno.pagamentos?.slice(0, 3);

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
                <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border
                        ${aluno.status_financeiro === 'atrasado' 
                            ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                        {aluno.status_financeiro === 'atrasado' ? 'Inadimplente' : 'Em Dia'}
                    </span>
                    <button 
                        onClick={handleDeleteAluno}
                        className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Excluir Aluno"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Coluna 1: Perfil e Anamnese */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                                <User size={32} className="text-slate-400" />
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
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Início</p>
                                    <p className="text-sm text-white font-bold">{new Date(aluno.data_inicio).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vencimento</p>
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
                            <button 
                                onClick={() => setIsModalPlanoOpen(true)}
                                className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors"
                            >
                                <Plus size={14} /> Novo Plano
                            </button>
                        </div>
                        
                        {aluno.planos_treino?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {aluno.planos_treino.map(plano => (
                                    <div key={plano.id} className="p-5 bg-slate-950/50 border border-slate-800 rounded-2xl flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
                                        <div className="mb-4">
                                            <p className="font-bold text-slate-200 text-base">{plano.titulo}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Criado em {new Date(plano.data_inicio).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <button 
                                            onClick={() => setPlanoSelecionado(plano)}
                                            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black transition-all uppercase tracking-widest"
                                        >
                                            <Eye size={14} /> Visualizar Treinos
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600 italic text-sm">
                                Nenhum plano de treino ativo para este aluno.
                            </div>
                        )}
                    </div>

                    {/* Histórico de Atividades Recentes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Últimas Sessões */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Clock size={16} /> Frequência
                            </h3>
                            <div className="space-y-4">
                                {sessoesExibidas?.map(sessao => (
                                    <div key={sessao.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-800/50 last:border-0">
                                        <span className="text-slate-400">{new Date(sessao.data_hora).toLocaleDateString('pt-BR')} - {new Date(sessao.data_hora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                                        <span className={sessao.realizada ? "text-emerald-500 font-bold" : "text-red-400 font-bold"}>
                                            {sessao.realizada ? "Presença" : "Falta"}
                                        </span>
                                    </div>
                                )) || (
                                    <p className="text-xs text-slate-600 italic">Sem registros.</p>
                                )}
                                
                                {aluno.sessoes?.length > 3 && (
                                    <button 
                                        onClick={() => setExpandirSessoes(!expandirSessoes)}
                                        className="w-full text-center pt-4 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors flex items-center justify-center gap-1"
                                    >
                                        {expandirSessoes ? <ChevronUp size={14} /> : <History size={14} />}
                                        {expandirSessoes ? "Ver menos" : `Ver todas as ${aluno.sessoes.length} sessões`}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Últimos Pagamentos */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <DollarSign size={16} /> Pagamentos
                            </h3>
                            <div className="space-y-4">
                                {pagamentosExibidos?.map(pag => (
                                    <div key={pag.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-800/50 last:border-0">
                                        <span className="text-slate-400">Mês {pag.referencia_mes}</span>
                                        <span className="text-white font-bold">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency:'BRL'}).format(pag.valor)}</span>
                                    </div>
                                )) || (
                                    <p className="text-xs text-slate-600 italic">Sem registros.</p>
                                )}

                                {aluno.pagamentos?.length > 3 && (
                                    <button 
                                        onClick={() => setExpandirPagamentos(!expandirPagamentos)}
                                        className="w-full text-center pt-4 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors flex items-center justify-center gap-1"
                                    >
                                        {expandirPagamentos ? <ChevronUp size={14} /> : <Receipt size={14} />}
                                        {expandirPagamentos ? "Ver menos" : `Ver todos os ${aluno.pagamentos.length} recibos`}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modais */}
            <ModalPlanoTreino 
                isOpen={isModalPlnoOpen} 
                onClose={() => setIsModalPlanoOpen(false)} 
                onSave={handleSavePlano}
            />

            {/* Modal de Visualização de Plano */}
            {planoSelecionado && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                            <div>
                                <h2 className="text-2xl font-black text-white">{planoSelecionado.titulo}</h2>
                                <p className="text-slate-500 font-medium text-sm">Objetivo: {planoSelecionado.objetivo_estrategico || "Não definido"}</p>
                            </div>
                            <button onClick={() => setPlanoSelecionado(null)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <div className="p-8 space-y-12">
                            {planoSelecionado.treinos?.map(treino => (
                                <div key={treino.id} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/20">
                                            {treino.nome}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white">{treino.descricao || "Ficha de Treino"}</h4>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{treino.prescricoes?.length || 0} Exercícios prescritos</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {treino.prescricoes?.map((presc, idx) => (
                                            <div key={presc.id || idx} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center hover:border-slate-600 transition-colors">
                                                <div>
                                                    <p className="font-bold text-slate-100 text-base mb-1">{presc.nome_exercicio}</p>
                                                    <div className="flex gap-3">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{presc.series} Séries</span>
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{presc.repeticoes} Reps</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-emerald-500">{presc.carga_kg}kg</p>
                                                    <p className="text-[10px] text-slate-600 font-bold uppercase">{presc.tempo_descanso_segundos}s Descanso</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 bg-slate-950/50 flex justify-end gap-4 border-t border-slate-800">
                            <button 
                                onClick={() => alert("A edição de treinos requer atualização do backend para suportar PATCH de prescrições.")}
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Alterar Treino
                            </button>
                            <button 
                                onClick={() => handleDeletePlano(planoSelecionado.id)}
                                className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Apagar Plano
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
