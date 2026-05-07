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
import { useToast } from '../../components/ToastProvider';

const METODOS_AGRUPADORES = ["Bi-set", "Tri-set", "Giant-set", "Super-set"];

export const DetalheAluno = ({ alunoId, onBack }) => {
    const toast = useToast();
    const [aluno, setAluno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalPlanoOpen, setIsModalPlanoOpen] = useState(false);
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [planoSelecionado, setPlanoSelecionado] = useState(null);
    const [planoEdicao, setPlanoEdicao] = useState(null);

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
            toast({ tipo: 'sucesso', texto: `Status atualizado para ${novoStatus}.` });
            carregar();
        } catch (err) {
            toast({ tipo: 'erro', texto: 'Erro ao atualizar status: ' + err.message });
        }
    };

    const handleCheckIn = async () => {
        try {
            await alunoService.registrarPresenca(alunoId);
            toast({ tipo: 'sucesso', texto: 'Presença registrada com sucesso!' });
            carregar();
        } catch (err) {
            toast({ tipo: 'erro', texto: 'Erro ao registrar presença: ' + err.message });
        }
    };

    useEffect(() => {
        carregar();
    }, [alunoId]);

    const handleDeleteAluno = async () => {
        if (confirm(`Tem certeza que deseja EXCLUIR permanentemente o cadastro de ${aluno.nome}? Todos os treinos e históricos serão perdidos.`)) {
            try {
                await alunoService.deletar(alunoId);
                toast({ tipo: 'sucesso', texto: 'Aluno excluído com sucesso.' });
                onBack();
            } catch (err) {
                toast({ tipo: 'erro', texto: 'Erro ao excluir aluno: ' + err.message });
            }
        }
    };

    const handleSavePlano = async (novoPlano) => {
        try {
            if (planoEdicao) {
                await treinoService.atualizarPlano(planoEdicao.id, novoPlano);
                toast({ tipo: 'sucesso', texto: 'Plano de treino atualizado com sucesso!' });
            } else {
                await treinoService.criarPlano(alunoId, novoPlano);
                toast({ tipo: 'sucesso', texto: 'Plano de treino criado com sucesso!' });
            }
            carregar();
            setIsModalPlanoOpen(false);
            setPlanoEdicao(null);
        } catch (err) {
            toast({ tipo: 'erro', texto: 'Erro ao salvar plano: ' + err.message });
        }
    };

    const handleClonarPlano = async (planoId) => {
        try {
            await treinoService.clonarPlano(planoId, alunoId);
            toast({ tipo: 'sucesso', texto: 'Plano clonado e ativado para este aluno!' });
            carregar();
        } catch (err) {
            toast({ tipo: 'erro', texto: 'Erro ao clonar plano: ' + err.message });
        }
    };

    const handleEditPlano = (plano) => {
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
        if (confirm("Deseja excluir este plano de treino permanentemente?")) {
            try {
                await treinoService.deletarPlano(planoId);
                toast({ tipo: 'sucesso', texto: 'Plano excluído com sucesso!' });
                setPlanoSelecionado(null);
                carregar();
            } catch (err) {
                toast({ tipo: 'erro', texto: 'Erro ao excluir plano: ' + err.message });
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 text-slate-500">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-medium uppercase tracking-widest animate-pulse">Acessando Prontuário...</p>
        </div>
    );

    if (error || !aluno) return (
        <div className="p-10 text-center text-red-600 bg-red-50 rounded-3xl border border-red-200">
            {error || "Aluno não encontrado"}
            <button onClick={onBack} className="block mx-auto mt-4 text-red-700 underline font-bold text-xs">Voltar para lista</button>
        </div>
    );

    const sessoesExibidas = expandirSessoes ? aluno.sessoes : aluno.sessoes?.slice(0, 3);
    const pagamentosExibidos = expandirPagamentos ? aluno.pagamentos : aluno.pagamentos?.slice(0, 3);

    return (
        <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Cabeçalho de Ação */}
            <div className="flex items-center justify-between px-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-500 transition-colors font-semibold text-sm active:scale-95"
                >
                    <ArrowLeft size={18} /> <span className="hidden sm:inline">Lista</span>
                </button>
                <div className="flex items-center gap-3 sm:gap-4">
                    {aluno.status === 'ativo' && (
                        <button
                            onClick={handleCheckIn}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-colors active:scale-95 shadow-md shadow-emerald-500/20"
                        >
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-semibold hidden sm:inline">Check-in</span>
                        </button>
                    )}

                    <select
                        value={aluno.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer
                            ${aluno.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' :
                              aluno.status === 'suspenso' ? 'bg-amber-50 text-amber-700' :
                              'bg-red-50 text-red-700'}`}
                    >
                        <option value="ativo">Ativo</option>
                        <option value="suspenso">Suspenso</option>
                        <option value="cancelado">Cancelado</option>
                    </select>

                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border
                        ${aluno.status_financeiro === 'atrasado'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {aluno.status_financeiro === 'atrasado' ? 'Pendente' : 'Regular'}
                    </span>

                    <button
                        onClick={() => setIsModalEditOpen(true)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Editar Cadastro"
                    >
                        <Edit size={18} />
                    </button>

                    <button
                        onClick={handleDeleteAluno}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Excluir Aluno"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">

                {/* Coluna 1: Perfil e Anamnese */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white border border-slate-200/70 rounded-3xl p-6 sm:p-8 shadow-md">
                        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                                <User size={36} className="text-slate-300" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{aluno.nome}</h2>
                            <p className="text-slate-500 text-xs sm:text-sm font-mono mt-1">{aluno.cpf || "CPF não informado"}</p>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-2">
                                    <Target size={13} className="text-emerald-500" /> Objetivo
                                </p>
                                <p className="text-sm text-slate-700 leading-relaxed">{aluno.objetivo || "Não informado"}</p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-2">
                                    <AlertTriangle size={13} className="text-amber-500" /> Restrições
                                </p>
                                <p className="text-sm text-slate-700 leading-relaxed">{aluno.restricoes || "Nenhuma restrição"}</p>
                            </div>

                            {aluno.usuario && (
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                                        <ShieldCheck size={13} /> Acesso do Aluno
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-900 font-semibold font-mono">{aluno.usuario.username}</span>
                                        <span className="bg-emerald-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-lg">Liberado</span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Início</p>
                                    <p className="text-sm text-slate-900 font-semibold">{new Date(aluno.data_inicio).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div>
                                    {aluno.tipo_pagamento === 'pacote' ? (
                                        <>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Saldo</p>
                                            <p className={`text-sm font-bold ${aluno.saldo_aulas > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {aluno.saldo_aulas} {aluno.saldo_aulas === 1 ? 'Aula' : 'Aulas'}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Vencimento</p>
                                            <p className="text-sm text-slate-900 font-semibold">Dia {aluno.dia_vencimento}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna 2 e 3: Treinos e Histórico */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Seção de Planos de Treino */}
                    <div className="bg-white border border-slate-200/70 rounded-3xl p-6 sm:p-8 shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <Dumbbell className="text-emerald-500" size={20} /> Planos
                            </h3>
                            <button
                                onClick={() => setIsModalPlanoOpen(true)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl transition-colors shadow-md shadow-emerald-500/20"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {aluno.planos_treino?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {aluno.planos_treino.map(plano => (
                                    <div key={plano.id} className={`p-5 border rounded-2xl flex flex-col justify-between transition-colors ${plano.esta_ativo ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-80'}`}>
                                        <div className="mb-4">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="font-bold text-slate-900 text-base leading-tight">{plano.titulo}</p>
                                                {plano.esta_ativo && <span className="bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-lg shrink-0">Ativo</span>}
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium mt-1">
                                                {plano.duracao_semanas} semanas · {new Date(plano.data_inicio).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setPlanoSelecionado(plano)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                                            >
                                                <Eye size={14} /> Visualizar
                                            </button>
                                            {!plano.esta_ativo && (
                                                <button
                                                    onClick={() => handleClonarPlano(plano.id)}
                                                    className="p-2.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors"
                                                    title="Reativar/Clonar"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 italic text-sm font-medium">
                                Nenhum plano de treino ativo.
                            </div>
                        )}
                    </div>

                    {/* Histórico de Atividades Recentes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Últimas Sessões */}
                        <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-md">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-5 flex items-center gap-2">
                                <Clock size={14} className="text-emerald-500" /> Frequência
                            </h3>
                            <div className="space-y-1">
                                {sessoesExibidas?.map(sessao => (
                                    <div key={sessao.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                        <span className="text-sm text-slate-600 font-medium">{new Date(sessao.data_hora).toLocaleDateString('pt-BR')}</span>
                                        <span className={`text-xs font-semibold ${sessao.realizada ? "text-emerald-600" : "text-red-500"}`}>
                                            {sessao.realizada ? "Check-in" : "Falta"}
                                        </span>
                                    </div>
                                )) || (
                                    <p className="text-xs text-slate-400 italic">Sem registros.</p>
                                )}

                                {aluno.sessoes?.length > 3 && (
                                    <button
                                        onClick={() => setExpandirSessoes(!expandirSessoes)}
                                        className="w-full text-center pt-4 text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition-colors flex items-center justify-center gap-1"
                                    >
                                        {expandirSessoes ? <><ChevronUp size={14} /> Ver menos</> : <><ChevronDown size={14} /> Ver todas ({aluno.sessoes.length})</>}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Últimos Pagamentos */}
                        <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-md">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-5 flex items-center gap-2">
                                <DollarSign size={14} className="text-emerald-500" /> Pagamentos
                            </h3>
                            <div className="space-y-1">
                                {pagamentosExibidos?.map(pag => (
                                    <div key={pag.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                        <span className="text-sm text-slate-600 font-medium">Mês {pag.referencia_mes}</span>
                                        <span className="text-sm text-slate-900 font-semibold tabular-nums">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency:'BRL'}).format(pag.valor)}</span>
                                    </div>
                                )) || (
                                    <p className="text-xs text-slate-400 italic">Sem registros.</p>
                                )}

                                {aluno.pagamentos?.length > 3 && (
                                    <button
                                        onClick={() => setExpandirPagamentos(!expandirPagamentos)}
                                        className="w-full text-center pt-4 text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition-colors flex items-center justify-center gap-1"
                                    >
                                        {expandirPagamentos ? <><ChevronUp size={14} /> Ver menos</> : <><ChevronDown size={14} /> Ver todos ({aluno.pagamentos.length})</>}
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
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#F0F4F2] w-full max-w-5xl h-[92vh] md:h-auto md:max-h-[85vh] overflow-hidden rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-500">
                        <div className="p-6 sm:p-8 border-b border-slate-200/60 flex justify-between items-start bg-white">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{planoSelecionado.titulo}</h2>
                                <div className="flex flex-col gap-1 mt-2">
                                    <p className="text-slate-600 font-medium text-sm">Objetivo: {planoSelecionado.objetivo_estrategico || "Não definido"}</p>
                                    {planoSelecionado.detalhes && (
                                        <p className="text-slate-500 text-xs leading-relaxed max-w-2xl bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                                            "{planoSelecionado.detalhes}"
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setPlanoSelecionado(null)} className="p-2.5 bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors shrink-0 ml-4">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-12 bg-[#F0F4F2]">
                            {planoSelecionado.treinos?.map(treino => (
                                <div key={treino.id} className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
                                            {treino.nome}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight">{treino.descricao || "Prescrição"}</h4>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">{treino.prescricoes?.length || 0} exercícios</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        {treino.prescricoes?.map((presc, idx) => {
                                            const prescricoes = treino.prescricoes;
                                            const isGrouping = METODOS_AGRUPADORES.includes(presc.metodo);
                                            const prevIsSame = idx > 0 && prescricoes[idx - 1].metodo === presc.metodo && isGrouping;
                                            const nextIsSame = idx < prescricoes.length - 1 && prescricoes[idx + 1].metodo === presc.metodo && isGrouping;

                                            const groupClasses = `
                                                ${prevIsSame ? 'mt-0 border-t-0 rounded-t-none' : 'rounded-t-2xl mt-2'}
                                                ${nextIsSame ? 'mb-0 rounded-b-none' : 'rounded-b-2xl mb-2'}
                                            `;

                                            return (
                                                <div
                                                    key={presc.id || idx}
                                                    className={`relative p-5 bg-white border border-slate-100 flex justify-between items-center transition-colors shadow-sm ${groupClasses}`}
                                                >
                                                    {isGrouping && (
                                                       <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl z-10 ${
                                                            presc.metodo === 'Bi-set' ? 'bg-blue-500' :
                                                            presc.metodo === 'Tri-set' ? 'bg-purple-500' :
                                                            presc.metodo === 'Giant-set' ? 'bg-orange-500' :
                                                            'bg-emerald-500'
                                                        }`} />
                                                    )}

                                                    <div className="space-y-2 pl-2 flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-slate-900 text-base leading-tight">{presc.nome_exercicio}</p>
                                                            {presc.exercicio?.video_url && (
                                                                <a
                                                                    href={presc.exercicio.video_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors shrink-0"
                                                                    title="Ver Vídeo"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Eye size={13} />
                                                                </a>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{presc.series} séries</span>
                                                            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{presc.repeticoes} reps</span>
                                                            {presc.metodo && presc.metodo !== 'Convencional' && (
                                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                                                                    presc.metodo === 'Bi-set' ? 'bg-blue-50 text-blue-700' :
                                                                    presc.metodo === 'Tri-set' ? 'bg-purple-50 text-purple-700' :
                                                                    'bg-emerald-50 text-emerald-700'
                                                                }`}>{presc.metodo}</span>
                                                            )}
                                                            {presc.observacoes && (
                                                                <span className="w-full text-xs text-blue-600 font-medium mt-1 block">
                                                                    Nota: {presc.observacoes}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0 ml-4">
                                                        <p className="text-lg font-black text-emerald-600 tabular-nums">{presc.carga_kg}kg</p>
                                                        {(!nextIsSame || !isGrouping) && (
                                                            <p className="text-xs text-slate-500 font-medium mt-0.5">{presc.tempo_descanso_segundos}s off</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 sm:p-8 bg-white flex flex-col md:flex-row justify-end gap-3 border-t border-slate-200/60">
                            <button
                                onClick={() => handleEditPlano(planoSelecionado)}
                                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold uppercase tracking-wide transition-colors"
                            >
                                Editar Plano
                            </button>
                            <button
                                onClick={() => handleDeletePlano(planoSelecionado.id)}
                                className="px-8 py-3 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 hover:border-red-500 rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all"
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
