import { useState } from 'react';
import { Trash2, UserCircle2 } from 'lucide-react';
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
            <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem]">
                <p className="text-slate-400 font-bold italic text-sm">Nenhum recebimento registrado.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-50">
                        <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Data
                        </th>
                        <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Aluno
                        </th>
                        <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Mês Ref.
                        </th>
                        <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Valor
                        </th>
                        <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Forma
                        </th>
                        <th className="text-right py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Ação
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {pagamentos.map((pagamento) => (
                        <tr 
                            key={pagamento.id}
                            className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                        >
                            <td className="py-6 px-4 text-xs font-bold text-slate-500">
                                {formatarData(pagamento.data_pagamento)}
                            </td>
                            <td className="py-6 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                                        <UserCircle2 size={16} />
                                    </div>
                                    <div className="text-sm font-bold text-slate-900">{pagamento.aluno_nome}</div>
                                </div>
                            </td>
                            <td className="py-6 px-4 text-xs text-slate-500 font-black uppercase tracking-widest">
                                {pagamento.referencia_mes}
                            </td>
                            <td className="py-6 px-4 text-sm font-black text-emerald-600">
                                {formatarValor(pagamento.valor)}
                            </td>
                            <td className="py-6 px-4">
                                <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-slate-50 text-slate-400 border border-black/5 uppercase tracking-tighter">
                                    {pagamento.forma_pagamento}
                                </span>
                            </td>
                            <td className="py-6 px-4 text-right">
                                <button
                                    onClick={() => handleDelete(pagamento.id)}
                                    disabled={deletando === pagamento.id}
                                    className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 active:scale-90"
                                    title="Cancelar lançamento"
                                >
                                    {deletando === pagamento.id ? (
                                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 size={18} />
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
