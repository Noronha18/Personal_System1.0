import { useState, useEffect } from 'react';
import { 
    User, Target, AlertTriangle, Calendar, 
    Dumbbell, DollarSign, Clock, ArrowLeft,
    CheckCircle2, Trash2, Plus, Eye, ChevronDown, ChevronUp, Copy, Edit,
    ShieldCheck
} from 'lucide-react';
import { alunoService, treinoService } from '../../services/api';
import { ModalPlanoTreino } from './ModalPlanoTreino';
import { FormAlunoModal } from './FormAlunoModal';

export const DetalheAluno = ({ alunoId, onBack }) => {
    const [aluno, setAluno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalPlanoOpen, setIsModalPlanoOpen] = useState(false);
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
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

    const handleStatusUpdate = async (novoStatus) => {
        try {
            await alunoService.atualizarStatus(alunoId, novoStatus);
            alert(`Status atualizado para ${novoStatus}`);
            carregar();
        } catch (err) {
            alert('Erro ao atualizar status: ' + err.message);
        }
    };

    const handleCheckIn = async () => {
        try {
            await alunoService.registrarPresenca(alunoId);
            alert('Presença registrada com sucesso!');
            carregar();
        } catch (err) {
            alert('Erro ao registrar presença: ' + err.message);
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
        if (planoEdicao) {
            await treinoService.atualizarPlano(planoEdicao.id, novoPlano);
            alert("Plano de treino atualizado com sucesso!");
        } else {
            await treinoService.criarPlano(alunoId, novoPlano);
            alert("Plano de treino criado com sucesso!");
        }
        carregar(); 
        setIsModalPlanoOpen(false);
        setPlanoEdicao(null);
    } catch (err) {
        alert("Erro ao salvar plano: " + err.message);
    }
};

const handleClonarPlano = async (planoId) => {
    try {
        await treinoService.clonarPlano(planoId, alunoId);
        alert("Plano clonado e ativado para este aluno!");
        carregar();
    } catch (err) {
        alert("Erro ao clonar plano: " + err.message);
    }
};

const [planoEdicao, setPlanoEdicao] = useState(null);

const handleEditPlano = (plano) => {
    // Converte o plano do formato Public (com nomes e carga_kg) 
    // para o formato Update (com ids e carga)
    const formatadoParaEdicao = {
        id: plano.id,
        titulo: plano.titulo,
        objetivo_estrategico: plano.objetivo_estrategico,
        detalhes: plano.detalhes,
        duracao_semanas: plano.duracao_semanas,
        treinos: plano.treinos.map(t => ({
            id: t.id,
            nome: t.nome,
            prescricoes: t.prescricoes.map(p => ({
                id: p.id,
                exercicio_id: p.exercicio_id,
                series: p.series,
                repeticoes: p.repeticoes,
                carga: p.carga_kg,
                descanso: p.tempo_descanso_segundos,
                metodo: p.metodo,
                observacoes: p.observacoes
            }))
        }))
    };
    setPlanoEdicao(formatadoParaEdicao);
    setPlanoSelecionado(null);
    setIsModalPlanoOpen(true);
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
        <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
            {/* Cabeçalho de Ação */}
            <div className="flex items-center justify-between px-2">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-500 transition-colors font-bold text-sm active:scale-95"
                >
                    <ArrowLeft size={18} /> <span className="hidden sm:inline">Lista</span>
                </button>
                <div className="flex items-center gap-3 sm:gap-6">
                    {aluno.status === 'ativo' && (
                        <button 
                            onClick={handleCheckIn}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                        >
                            <CheckCircle2 size={18} />
                            <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Check-in Hoje</span>
                        </button>
                    )}
                    
                    <select 
                        value={aluno.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer
                            ${aluno.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-600' : 
                              aluno.status === 'suspenso' ? 'bg-amber-500/10 text-amber-600' : 
                              'bg-red-500/10 text-red-600'}`}
                    >
                        <option value="ativo">Ativo</option>
                        <option value="suspenso">Suspenso</option>
                        <option value="cancelado">Cancelado</option>
                    </select>

                    <span className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider
                        ${aluno.status_financeiro === 'atrasado' 
                            ? 'bg-red-500/10 text-red-500' 
                            : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {aluno.status_financeiro === 'atrasado' ? 'Pendente' : 'Regular'}
                    </span>
                    
                    <button 
                        onClick={() => setIsModalEditOpen(true)}
                        className="p-2 text-slate-300 hover:text-blue-500 transition-all active:scale-90"
                        title="Editar Cadastro"
                    >
                        <Edit size={20} />
                    </button>

                    <button 
                        onClick={handleDeleteAluno}
                        className="p-2 text-slate-300 hover:text-red-500 transition-all active:scale-90"
                        title="Excluir Aluno"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
                
                {/* Coluna 1: Perfil e Anamnese */}
                <div className="lg:col-span-4 space-y-6 sm:space-y-8">
                    <div className="bg-white border border-black/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-black/5">
                        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50 flex items-center justify-center mb-4 shadow-inner">
                                <User size={40} className="text-slate-300" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{aluno.nome}</h2>
                            <p className="text-slate-400 text-xs sm:text-sm font-mono mt-1 tracking-tight">{aluno.cpf || "CPF não informado"}</p>
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                            <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-black/5">
                                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2 flex items-center gap-2">
                                    <Target size={14} className="text-emerald-500" /> Objetivo
                                </p>
                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">{aluno.objetivo || "Não informado"}</p>
                            </div>
                            
                            <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-black/5">
                                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2 flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-amber-500" /> Restrições
                                </p>
                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">{aluno.restricoes || "Nenhuma restrição"}</p>
                            </div>

                            {aluno.usuario && (
                                <div className="bg-emerald-500/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-500/10 animate-in slide-in-from-top-2 duration-500">
                                    <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <ShieldCheck size={14} /> Acesso do Aluno
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-slate-900 font-bold font-mono">{aluno.usuario.username}</span>
                                        <span className="bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-lg tracking-widest">Liberado</span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 sm:pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 sm:gap-8 text-center">
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Início</p>
                                    <p className="text-xs sm:text-sm text-slate-900 font-bold">{new Date(aluno.data_inicio).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div>
                                    {aluno.tipo_pagamento === 'pacote' ? (
                                        <>
                                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo</p>
                                            <p className={`text-xs sm:text-sm font-black ${aluno.saldo_aulas > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {aluno.saldo_aulas} {aluno.saldo_aulas === 1 ? 'Aula' : 'Aulas'}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vencimento</p>
                                            <p className="text-xs sm:text-sm text-slate-900 font-bold">Dia {aluno.dia_vencimento}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna 2 e 3: Treinos e Histórico */}
                <div className="lg:col-span-8 space-y-6 sm:space-y-10">
                    
                    {/* Seção de Planos de Treino */}
                    <div className="bg-white border border-black/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-black/5">
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <Dumbbell className="text-emerald-500" size={20} sm:size={24} /> Planos
                            </h3>
                            <button 
                                onClick={() => setIsModalPlanoOpen(true)}
                                className="bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded-full transition-all active:scale-90 shadow-lg shadow-emerald-500/20"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        
                        {aluno.planos_treino?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {aluno.planos_treino.map(plano => (
                                    <div key={plano.id} className={`p-5 sm:p-6 border rounded-2xl sm:rounded-3xl flex flex-col justify-between group transition-all active:scale-[0.98] ${plano.esta_ativo ? 'bg-emerald-50/50 border-emerald-500/20' : 'bg-slate-50 border-black/5 opacity-80'}`}>
                                        <div className="mb-4 sm:mb-6">
                                            <div className="flex justify-between items-start">
                                                <p className="font-bold text-slate-900 text-base sm:text-lg leading-tight">{plano.titulo}</p>
                                                {plano.esta_ativo && <span className="bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg">Ativo</span>}
                                            </div>
                                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                {plano.duracao_semanas} semanas • Criado em {new Date(plano.data_inicio).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setPlanoSelecionado(plano)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-white border border-black/5 shadow-sm hover:bg-slate-50 text-slate-900 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold transition-all"
                                            >
                                                <Eye size={16} /> Visualizar
                                            </button>
                                            {!plano.esta_ativo && (
                                                <button 
                                                    onClick={() => handleClonarPlano(plano.id)}
                                                    className="p-3 bg-white border border-black/5 shadow-sm hover:border-emerald-500/30 text-emerald-600 rounded-xl sm:rounded-2xl transition-all"
                                                    title="Reativar/Clonar"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 sm:py-20 border-2 border-dashed border-slate-200 rounded-[1.5rem] sm:rounded-[2rem] text-slate-400 italic text-xs sm:text-sm font-medium">
                                Nenhum plano de treino ativo.
                            </div>
                        )}
                    </div>

                    {/* Histórico de Atividades Recentes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-start">
                        {/* Últimas Sessões */}
                        <div className="bg-white border border-black/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-black/5">
                            <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-2">
                                <Clock size={16} className="text-emerald-500" /> Frequência
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                {sessoesExibidas?.map(sessao => (
                                    <div key={sessao.id} className="flex items-center justify-between text-xs sm:text-sm py-2.5 sm:py-3 border-b border-slate-50 last:border-0">
                                        <span className="text-slate-500 font-medium">{new Date(sessao.data_hora).toLocaleDateString('pt-BR')}</span>
                                        <span className={sessao.realizada ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
                                            {sessao.realizada ? "Check-in" : "Falta"}
                                        </span>
                                    </div>
                                )) || (
                                    <p className="text-[10px] sm:text-xs text-slate-400 italic">Sem registros.</p>
                                )}
                                
                                {aluno.sessoes?.length > 3 && (
                                    <button 
                                        onClick={() => setExpandirSessoes(!expandirSessoes)}
                                        className="w-full text-center pt-4 sm:pt-6 text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase hover:text-emerald-500 transition-colors flex items-center justify-center gap-1 active:scale-95"
                                    >
                                        {expandirSessoes ? "Ver menos" : `Ver todas (${aluno.sessoes.length})`}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Últimos Pagamentos */}
                        <div className="bg-white border border-black/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-black/5">
                            <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-2">
                                <DollarSign size={16} className="text-emerald-500" /> Pagamentos
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                {pagamentosExibidos?.map(pag => (
                                    <div key={pag.id} className="flex items-center justify-between text-xs sm:text-sm py-2.5 sm:py-3 border-b border-slate-50 last:border-0">
                                        <span className="text-slate-500 font-medium">Mês {pag.referencia_mes}</span>
                                        <span className="text-slate-900 font-bold">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency:'BRL'}).format(pag.valor)}</span>
                                    </div>
                                )) || (
                                    <p className="text-[10px] sm:text-xs text-slate-400 italic">Sem registros.</p>
                                )}

                                {aluno.pagamentos?.length > 3 && (
                                    <button 
                                        onClick={() => setExpandirPagamentos(!expandirPagamentos)}
                                        className="w-full text-center pt-4 sm:pt-6 text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase hover:text-emerald-500 transition-colors flex items-center justify-center gap-1 active:scale-95"
                                    >
                                        {expandirPagamentos ? "Ver menos" : `Ver todos (${aluno.pagamentos.length})`}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modais */}
            <ModalPlanoTreino 
                isOpen={isModalPlanoOpen} 
                onClose={() => {
                    setIsModalPlanoOpen(false);
                    setPlanoEdicao(null);
                }} 
                onSave={handleSavePlano}
                planoEdicao={planoEdicao}
            />

            <FormAlunoModal 
                isOpen={isModalEditOpen}
                onClose={() => setIsModalEditOpen(false)}
                onSuccess={carregar}
                alunoEdicao={aluno}
            />

            {/* Modal de Visualização de Plano */}
            {planoSelecionado && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="bg-[#F2F2F7] w-full max-w-5xl h-[92vh] md:h-auto md:max-h-[85vh] overflow-hidden rounded-t-[3rem] md:rounded-[3rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-700">
                        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-white z-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{planoSelecionado.titulo}</h2>
                                <div className="flex flex-col gap-1 mt-2">
                                    <p className="text-slate-500 font-medium text-sm">Objetivo: {planoSelecionado.objetivo_estrategico || "Não definido"}</p>
                                    {planoSelecionado.detalhes && (
                                        <p className="text-slate-400 font-medium text-[11px] italic leading-relaxed max-w-2xl bg-slate-50 p-3 rounded-2xl border border-black/5 mt-1">
                                            "{planoSelecionado.detalhes}"
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setPlanoSelecionado(null)} className="p-3 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all active:scale-90">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-16 custom-scrollbar bg-[#F2F2F7]">
                            {planoSelecionado.treinos?.map(treino => (
                                <div key={treino.id} className="space-y-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-500/20">
                                            {treino.nome}
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{treino.descricao || "Prescrição"}</h4>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{treino.prescricoes?.length || 0} Exercícios</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {treino.prescricoes?.map((presc, idx) => (
                                            <div key={presc.id || idx} className="p-6 bg-white border border-black/5 rounded-3xl flex justify-between items-center hover:bg-slate-50 transition-all shadow-sm shadow-black/5">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-900 text-lg leading-tight">{presc.nome_exercicio}</p>
                                                        {presc.exercicio?.video_url && (
                                                            <a 
                                                                href={presc.exercicio.video_url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                                                                title="Ver Vídeo"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Eye size={14} />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">{presc.series} Séries</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">{presc.repeticoes} Reps</span>
                                                        {presc.metodo && presc.metodo !== 'Convencional' && (
                                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">{presc.metodo}</span>
                                                        )}
                                                        {presc.observacoes && (
                                                            <span className="w-full text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1 block">
                                                                Nota: {presc.observacoes}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-emerald-600">{presc.carga_kg}kg</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{presc.tempo_descanso_segundos}s off</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-white flex flex-col md:flex-row justify-end gap-4 border-t border-black/5">
                            <button 
                                onClick={() => handleEditPlano(planoSelecionado)}
                                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                            >
                                Editar Plano
                            </button>
                            <button 
                                onClick={() => handleDeletePlano(planoSelecionado.id)}
                                className="px-8 py-4 bg-red-50/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
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
