import { useEffect, useState } from 'react';
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
                <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest animate-pulse">Sincronizando Alunos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Seus Alunos</h2>
                    <p className="text-slate-500 text-sm font-medium">Gestão de performance e prontuário ativo.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white hover:bg-slate-200 text-black px-6 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2"
                >
                    <span className="text-lg">+</span> Novo Aluno
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
                    Erro: {error}
                </div>
            )}

            {alunos.length === 0 ? (
                <div className="p-20 border-2 border-dashed border-slate-800 rounded-3xl text-center">
                    <p className="text-slate-500 font-medium">Nenhum aluno cadastrado ainda.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-6">Aluno</th>
                                <th className="p-6">CPF</th>
                                <th className="p-6 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {alunos.map((aluno) => (
                                <tr 
                                    key={aluno.id} 
                                    onClick={() => onSelectAluno(aluno.id)}
                                    className="hover:bg-slate-800/40 transition-all cursor-pointer group"
                                >
                                    <td className="p-6 text-slate-200 font-bold group-hover:text-emerald-400">{aluno.nome}</td>
                                    <td className="p-6 text-slate-500 font-mono text-xs">{aluno.cpf}</td>
                                    <td className="p-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase
                      ${aluno.status_financeiro === 'atrasado'
                                                ? 'bg-red-500/10 text-red-500'
                                                : 'bg-emerald-500/10 text-emerald-500'
                                            }`}>
                                            {aluno.status_financeiro === 'atrasado' ? 'Inadimplente' : 'Em Dia'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
