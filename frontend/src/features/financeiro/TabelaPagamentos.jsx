import { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';

export default function TabelaPagamentos({ pagamentos, onDelete, onEdit }) {
    const [deletando, setDeletando] = useState(null);

    const handleDelete = async (pagamentoId) => {
        if (!confirm('Tem certeza que deseja cancelar este pagamento?')) {
            return;
        }

        setDeletando(pagamentoId);

        try {
            const response = await fetch(`http://localhost:8000/pagamentos/${pagamentoId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao cancelar pagamento');
            }

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
                    <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                            Data
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                            Mês Ref.
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                            Valor
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                            Forma
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                            Observação
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {pagamentos.map((pagamento) => (
                        <tr 
                            key={pagamento.id}
                            className="border-b border-slate-800 
                                     hover:bg-slate-800/30 transition-colors"
                        >
                            <td className="py-3 px-4 text-sm text-slate-200">
                                {formatarData(pagamento.data_pagamento)}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-300">
                                {pagamento.referencia_mes}
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-emerald-400">
                                {formatarValor(pagamento.valor)}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-300">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                               bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    {pagamento.forma_pagamento}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-400 max-w-xs truncate">
                                {pagamento.observacao || '-'}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleDelete(pagamento.id)}
                                        disabled={deletando === pagamento.id}
                                        className="p-1.5 text-red-400 
                                                 hover:bg-red-500/20 hover:text-red-300
                                                 rounded transition-colors
                                                 disabled:opacity-50"
                                        title="Cancelar pagamento"
                                    >
                                        {deletando === pagamento.id ? (
                                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}