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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white border border-black/5 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Novo Aluno</h2>
                        <p className="text-slate-500 text-sm font-medium">Preencha os dados básicos para iniciar o acompanhamento.</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all active:scale-90">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-45"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold rounded-2xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                            <input 
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-300"
                                value={formData.nome}
                                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                placeholder="Ex: João Silva"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF (Apenas números)</label>
                            <input 
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-300"
                                value={formData.cpf}
                                onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                                placeholder="000.000.000-00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vencimento</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-semibold"
                                value={formData.dia_vencimento}
                                onChange={(e) => setFormData({...formData, dia_vencimento: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequência</label>
                            <select 
                                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-semibold outline-none"
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
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensalidade</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-semibold"
                                value={formData.valor_mensalidade}
                                onChange={(e) => setFormData({...formData, valor_mensalidade: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Idade</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-semibold"
                                value={formData.idade}
                                onChange={(e) => setFormData({...formData, idade: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objetivo Estratégico</label>
                        <textarea 
                            rows="2"
                            className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
                            placeholder="Ex: Hipertrofia focada em membros inferiores..."
                            value={formData.objetivo}
                            onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Restrições / Patologias</label>
                        <textarea 
                            rows="2"
                            className="w-full bg-slate-50 border border-red-500/10 rounded-2xl px-5 py-4 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-red-500/10 transition-all placeholder:text-slate-300"
                            placeholder="Ex: Condromalácia patelar grau 2..."
                            value={formData.restricoes}
                            onChange={(e) => setFormData({...formData, restricoes: e.target.value})}
                        ></textarea>
                    </div>
                </form>

                <div className="p-10 border-t border-slate-50 bg-white flex flex-col md:flex-row justify-end gap-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-12 py-4 rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-95 uppercase text-xs tracking-widest"
                    >
                        {loading ? 'Sincronizando...' : 'Finalizar Cadastro'}
                    </button>
                </div>
            </div>
        </div>
    );
};
