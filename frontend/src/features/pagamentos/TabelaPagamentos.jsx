import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { pagamentoService } from '../../services/api';

export default function TabelaPagamentos({ pagamentos, onDelete }) {
    const [deletando, setDeletando] = useState(null);

    const handleDelete = async (pagamentoId) => {
        if (!confirm('Tem certeza que deseja cancelar este pagamento?')) {
            return;
        }

        setDeletando(pagamentoId);

        try {
            await pagamentoService.deletar(pagamentoId);
            if (onDelete) {
                onDelete(pagamentoId);
            }
        } catch (error) {
            alert('Erro ao cancelar pagamento: ' + error.message);
        } finally {
            setDeletando(null);
        }
    };

    const formatarData = (dataStr) => {
        if (!dataStr) return '-';
        const data = new Date(dataStr + 'T00:00:00');
        return data.toLocaleDateString('pt-BR');
    };

    const formatarValor = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    if (!pagamentos || pagamentos.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <p className="text-lg">💳 Nenhum pagamento registrado</p>
                <p className="text-sm mt-2 text-slate-500">
                    Clique em "Registrar Pagamento" para adicionar
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-700/50">
                        <th className="text-left py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Data
                        </th>
                        <th className="text-left py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Aluno
                        </th>
                        <th className="text-left py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Mês Ref.
                        </th>
                        <th className="text-left py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Valor
                        </th>
                        <th className="text-left py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Forma
                        </th>
                        <th className="text-right py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {pagamentos.map((pagamento) => (
                        <tr 
                            key={pagamento.id}
                            className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group"
                        >
                            <td className="py-4 px-4 text-sm text-slate-400">
                                {formatarData(pagamento.data_pagamento)}
                            </td>
                            <td className="py-4 px-4">
                                <div className="text-sm font-bold text-slate-200">{pagamento.aluno_nome}</div>
                                <div className="text-[10px] text-slate-500 font-medium">ID #{pagamento.aluno_id}</div>
                            </td>
                            <td className="py-4 px-4 text-sm text-slate-300 font-medium">
                                {pagamento.referencia_mes}
                            </td>
                            <td className="py-4 px-4 text-sm font-black text-emerald-400">
                                {formatarValor(pagamento.valor)}
                            </td>
                            <td className="py-4 px-4">
                                <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-tighter">
                                    {pagamento.forma_pagamento}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                                <button
                                    onClick={() => handleDelete(pagamento.id)}
                                    disabled={deletando === pagamento.id}
                                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100"
                                    title="Cancelar pagamento"
                                >
                                    {deletando === pagamento.id ? (
                                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
