import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { alunoService, pagamentoService } from '../../services/api';

export const ModalPagamento = ({ isOpen, onClose, onSuccess }) => {
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        aluno_id: '',
        valor: '',
        referencia_mes: new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }),
        forma_pagamento: 'PIX',
        observacao: ''
    });

    useEffect(() => {
        if (isOpen) {
            alunoService.listar().then(setAlunos).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await pagamentoService.registrar({
                ...formData,
                aluno_id: parseInt(formData.aluno_id),
                valor: parseFloat(formData.valor)
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert(err.message || "Erro ao registrar pagamento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Registrar Pagamento</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Aluno</label>
                        <select 
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500"
                            value={formData.aluno_id}
                            onChange={(e) => setFormData({...formData, aluno_id: e.target.value})}
                        >
                            <option value="">Selecione o aluno...</option>
                            {alunos.map(aluno => (
                                <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Valor (R$)</label>
                            <input 
                                required
                                type="number"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200"
                                value={formData.valor}
                                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mês de Ref.</label>
                            <input 
                                required
                                type="text"
                                placeholder="MM/AAAA"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200"
                                value={formData.referencia_mes}
                                onChange={(e) => setFormData({...formData, referencia_mes: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Forma de Pagamento</label>
                        <div className="flex gap-2">
                            {['PIX', 'Dinheiro', 'Cartão'].map(forma => (
                                <button
                                    key={forma}
                                    type="button"
                                    onClick={() => setFormData({...formData, forma_pagamento: forma})}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                                        ${formData.forma_pagamento === forma 
                                            ? 'bg-emerald-500 text-white shadow-lg' 
                                            : 'bg-slate-800 text-slate-400'}`}
                                >
                                    {forma}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Observação</label>
                        <textarea 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200"
                            rows="2"
                            value={formData.observacao}
                            onChange={(e) => setFormData({...formData, observacao: e.target.value})}
                        ></textarea>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl font-bold mt-4 transition-all"
                    >
                        {loading ? 'Processando...' : 'Confirmar Recebimento'}
                    </button>
                </form>
            </div>
        </div>
    );
};
