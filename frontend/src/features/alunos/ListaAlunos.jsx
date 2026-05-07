import { useEffect, useState } from 'react';
import { ChevronRight, Plus, UserCircle2, CheckCircle2 } from 'lucide-react';
import { alunoService } from '../../services/api';
import { FormAlunoModal } from './FormAlunoModal';
import { useToast } from '../../components/ToastProvider';

export const ListaAlunosFeature = ({ onSelectAluno }) => {
    const toast = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [abaStatus, setAbaStatus] = useState('ativos'); // 'ativos' ou 'inativos'

    const carregarAlunos = async () => {
        try {
            setLoading(true);
            const data = await alunoService.listar();
            setAlunos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (e, alunoId) => {
        e.stopPropagation(); // Evita abrir os detalhes do aluno
        try {
            await alunoService.registrarPresenca(alunoId);
            carregarAlunos();
            toast({ tipo: 'sucesso', texto: 'Presença registrada com sucesso!' });
        } catch (err) {
            toast({ tipo: 'erro', texto: 'Erro ao registrar presença: ' + err.message });
        }
    };

    useEffect(() => {
        carregarAlunos();
    }, []);

    const alunosFiltrados = alunos.filter(aluno => {
        if (abaStatus === 'ativos') return aluno.status === 'ativo';
        return aluno.status === 'suspenso' || aluno.status === 'cancelado';
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Sincronizando...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Alunos</h2>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium">Gestão de performance ativa.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white p-3 sm:p-4 rounded-full font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-90"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Abas de Status */}
            <div className="flex p-1 bg-slate-200/50 rounded-2xl border border-white/20 shadow-inner mx-2 w-fit">
                {[
                    { id: 'ativos', label: 'Ativos' },
                    { id: 'inativos', label: 'Inativos' }
                ].map((aba) => (
                    <button
                        key={aba.id}
                        onClick={() => setAbaStatus(aba.id)}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 whitespace-nowrap ${
                            abaStatus === aba.id
                                ? 'bg-white text-slate-900 shadow-md'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {aba.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded-2xl mx-2">
                    Erro: {error}
                </div>
            )}

            {alunosFiltrados.length === 0 ? (
                <div className="py-20 sm:py-32 border-2 border-dashed border-slate-300 rounded-[2rem] sm:rounded-[2.5rem] text-center mx-2">
                    <p className="text-slate-400 font-medium italic">Nenhum aluno nesta categoria.</p>
                </div>
            ) : (
                <div className="space-y-1 mx-2 bg-white border border-black/5 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
                    {alunosFiltrados.map((aluno, idx) => (
                        <div
                            key={aluno.id}
                            onClick={() => onSelectAluno(aluno.id)}
                            className={`group flex items-center gap-3 sm:gap-4 p-4 sm:p-5 transition-colors duration-150 cursor-pointer hover:bg-slate-50/80 active:bg-slate-100
                                ${idx !== alunosFiltrados.length - 1 ? 'border-b border-slate-100' : ''}
                                ${aluno.status !== 'ativo' ? 'opacity-70' : ''}`}
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                                <UserCircle2 size={24} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-slate-900 font-bold text-base sm:text-lg leading-tight truncate">{aluno.nome}</h3>
                                    {aluno.usuario && (
                                        <div className="p-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100" title={`Acesso liberado: ${aluno.usuario.username}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        </div>
                                    )}
                                    {aluno.status !== 'ativo' && (
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold uppercase rounded-md tracking-wide border border-slate-200">
                                            {aluno.status}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                                    <p className="text-slate-500 text-xs font-mono tracking-tight">{aluno.cpf || "Sem CPF"}</p>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline" />
                                    <p className="text-xs text-slate-500 font-medium hidden sm:block">
                                        {aluno.tipo_pagamento === 'pacote'
                                            ? `Pacote · ${aluno.saldo_aulas} aulas`
                                            : 'Mensalidade'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-4">
                                {aluno.status === 'ativo' && (
                                    <button 
                                        onClick={(e) => handleCheckIn(e, aluno.id)}
                                        className="p-2 sm:p-3 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all active:scale-90 flex items-center gap-2"
                                        title="Registrar Presença Hoje"
                                    >
                                        <CheckCircle2 size={18} />
                                        <span className="hidden lg:inline text-xs font-bold uppercase tracking-wide">Check-in</span>
                                    </button>
                                )}
                                <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold border
                                    ${aluno.status_financeiro === 'atrasado'
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}>
                                    {aluno.status_financeiro === 'atrasado' ? 'Atrasado' : 'Em dia'}
                                </span>
                                <ChevronRight className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" size={18} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <FormAlunoModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSuccess={carregarAlunos}
            />
        </div>
    );
};
