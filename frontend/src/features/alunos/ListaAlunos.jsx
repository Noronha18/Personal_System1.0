import { useEffect, useState } from 'react';
import { ChevronRight, Plus, UserCircle2 } from 'lucide-react';
import { alunoService } from '../../services/api';
import { FormAlunoModal } from './FormAlunoModal';

export const ListaAlunosFeature = ({ onSelectAluno }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        carregarAlunos();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Sincronizando...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Alunos</h2>
                    <p className="text-slate-500 text-sm font-medium">Gestão de performance ativa.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-full font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-90"
                >
                    <Plus size={24} />
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded-2xl mx-2">
                    Erro: {error}
                </div>
            )}

            {alunos.length === 0 ? (
                <div className="py-32 border-2 border-dashed border-slate-300 rounded-[2.5rem] text-center mx-2">
                    <p className="text-slate-400 font-medium italic">Nenhum aluno cadastrado.</p>
                </div>
            ) : (
                <div className="space-y-1 mx-2 bg-white border border-black/5 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
                    {alunos.map((aluno, idx) => (
                        <div 
                            key={aluno.id} 
                            onClick={() => onSelectAluno(aluno.id)}
                            className={`group flex items-center gap-4 p-5 transition-all cursor-pointer active:bg-slate-50
                                ${idx !== alunos.length - 1 ? 'border-b border-slate-100' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                                <UserCircle2 size={24} />
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="text-slate-900 font-bold text-lg leading-tight">{aluno.nome}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-slate-400 text-xs font-mono tracking-tight">{aluno.cpf}</p>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                        {aluno.tipo_pagamento === 'pacote' 
                                            ? `Pacote: ${aluno.saldo_aulas} aulas` 
                                            : 'Mensalidade'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider
                                    ${aluno.status_financeiro === 'atrasado'
                                        ? 'bg-red-500/10 text-red-500'
                                        : 'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                    {aluno.status_financeiro === 'atrasado' ? 'Pendente' : 'Regular'}
                                </span>
                                <ChevronRight className="text-slate-300 group-hover:text-slate-500 transition-colors" size={20} />
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
