import { useState } from 'react';
import { alunoService } from '../../services/api';

export const FormAlunoModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        dia_vencimento: 5,
        frequencia_semanal_plano: 3,
        valor_mensalidade: 0,
        idade: 0,
        objetivo: '',
        restricoes: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await alunoService.criar(formData);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Erro ao cadastrar aluno');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-white">Novo Aluno</h2>
                        <p className="text-slate-500 text-sm">Preencha os dados básicos para iniciar o acompanhamento.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                            <input 
                                required
                                type="text"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                value={formData.nome}
                                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CPF (Apenas números)</label>
                            <input 
                                required
                                type="text"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                value={formData.cpf}
                                onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vencimento</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200"
                                value={formData.dia_vencimento}
                                onChange={(e) => setFormData({...formData, dia_vencimento: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Frequência</label>
                            <select 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200"
                                value={formData.frequencia_semanal_plano}
                                onChange={(e) => setFormData({...formData, frequencia_semanal_plano: e.target.value})}
                            >
                                <option value={1}>1x na semana</option>
                                <option value={2}>2x na semana</option>
                                <option value={3}>3x na semana</option>
                                <option value={5}>Livre</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mensalidade</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200"
                                value={formData.valor_mensalidade}
                                onChange={(e) => setFormData({...formData, valor_mensalidade: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Idade</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200"
                                value={formData.idade}
                                onChange={(e) => setFormData({...formData, idade: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Objetivo Estratégico</label>
                        <textarea 
                            rows="2"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200"
                            placeholder="Ex: Hipertrofia focada em membros inferiores..."
                            value={formData.objetivo}
                            onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Restrições / Patologias</label>
                        <textarea 
                            rows="2"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 border-red-500/10"
                            placeholder="Ex: Condromalácia patelar grau 2..."
                            value={formData.restricoes}
                            onChange={(e) => setFormData({...formData, restricoes: e.target.value})}
                        ></textarea>
                    </div>
                </form>

                <div className="p-8 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                        {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                    </button>
                </div>
            </div>
        </div>
    );
};
