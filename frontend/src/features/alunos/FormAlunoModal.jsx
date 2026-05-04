import { useState, useEffect } from 'react';
import { alunoService } from '../../services/api';

export const FormAlunoModal = ({ isOpen, onClose, onSuccess, alunoEdicao = null }) => {
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        cpf: '',
        dia_vencimento: 5,
        tipo_pagamento: 'mensal', // 'mensal' ou 'pacote'
        frequencia_semanal_plano: 3,
        valor_mensalidade: 0,
        idade: 0,
        objetivo: '',
        restricoes: '',
        username: '',
        password: ''
    });

    useEffect(() => {
        if (isOpen && alunoEdicao) {
            setFormData({
                nome: alunoEdicao.nome || '',
                email: alunoEdicao.email || '',
                cpf: alunoEdicao.cpf || '',
                dia_vencimento: alunoEdicao.dia_vencimento || 5,
                tipo_pagamento: alunoEdicao.tipo_pagamento || 'mensal',
                frequencia_semanal_plano: alunoEdicao.frequencia_semanal_plano || 3,
                valor_mensalidade: alunoEdicao.valor_mensalidade || 0,
                idade: alunoEdicao.idade || 0,
                objetivo: alunoEdicao.objetivo || '',
                restricoes: alunoEdicao.restricoes || '',
                username: alunoEdicao.usuario?.username || '',
                password: '' // Não editamos senha aqui por enquanto
            });
        } else if (isOpen) {
            setFormData({
                nome: '',
                email: '',
                cpf: '',
                dia_vencimento: 5,
                tipo_pagamento: 'mensal',
                frequencia_semanal_plano: 3,
                valor_mensalidade: 0,
                idade: 0,
                objetivo: '',
                restricoes: '',
                username: '',
                password: ''
            });
        }
    }, [isOpen, alunoEdicao]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Limpeza de dados para evitar strings vazias em campos opcionais
        const cleanData = {
            ...formData,
            cpf: formData.cpf?.trim() || null,
            email: formData.email?.trim() || null,
            objetivo: formData.objetivo?.trim() || null,
            restricoes: formData.restricoes?.trim() || null,
            username: formData.username?.trim() || null,
            password: formData.password?.trim() || null
        };

        try {
            if (alunoEdicao) {
                await alunoService.atualizar(alunoEdicao.id, cleanData);
            } else {
                await alunoService.criar(cleanData);
            }
            
            setIsSuccess(true);
            
            // Aguarda um pouco para mostrar a mensagem de sucesso antes de fechar
            setTimeout(() => {
                onSuccess();
                onClose();
                // Reseta o estado para o próximo uso
                setIsSuccess(false);
            }, 2000);

        } catch (err) {
            setError(err.message || 'Erro ao processar solicitação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white border border-black/5 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {isSuccess ? 'Sucesso!' : alunoEdicao ? 'Editar Aluno' : 'Novo Aluno'}
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">
                            {isSuccess 
                                ? `O aluno foi ${alunoEdicao ? 'atualizado' : 'cadastrado'} com sucesso.` 
                                : alunoEdicao 
                                    ? 'Atualize os dados cadastrais e financeiros do aluno.' 
                                    : 'Preencha os dados básicos para iniciar o acompanhamento.'}
                        </p>
                    </div>
                    {!isSuccess && (
                        <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all active:scale-90">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-45"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                    )}
                </div>

                {isSuccess ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <p className="text-slate-900 font-bold text-lg text-center">{alunoEdicao ? 'Atualização finalizada!' : 'Cadastro finalizado!'}</p>
                        <p className="text-slate-400 text-sm font-medium">Sincronizando com a base de dados...</p>
                    </div>
                ) : (
                    <>
                        <form id="form-aluno" onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail (Opcional)</label>
                                    <input 
                                        type="email"
                                        className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-300"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder="joao@email.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF (Opcional)</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-300"
                                        value={formData.cpf}
                                        onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                                <div className="space-y-2"></div>
                            </div>

                            {!alunoEdicao && (
                                <div className="p-8 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 space-y-6 animate-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        </div>
                                        <h3 className="text-xs font-black text-emerald-900 uppercase tracking-widest">Credenciais de Acesso</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest ml-1">Usuário (Login)</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-white border border-emerald-100 rounded-2xl px-5 py-4 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                                placeholder="Ex: joaosilva"
                                                value={formData.username}
                                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest ml-1">Senha Temporária</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-white border border-emerald-100 rounded-2xl px-5 py-4 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                                placeholder="Ex: aluno123"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modalidade de Pagamento</label>
                        <div className="flex gap-4">
                            {[
                                { id: 'mensal', label: 'Mensalidade' },
                                { id: 'pacote', label: 'Pacote de Aulas' }
                            ].map(tipo => (
                                <button
                                    key={tipo.id}
                                    type="button"
                                    onClick={() => setFormData({...formData, tipo_pagamento: tipo.id})}
                                    className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border
                                        ${formData.tipo_pagamento === tipo.id 
                                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' 
                                            : 'bg-slate-50 text-slate-400 border-black/5 hover:bg-slate-100'}`}
                                >
                                    {tipo.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequência</label>
                            <select 
                                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-semibold outline-none"
                                value={formData.frequencia_semanal_plano}
                                onChange={(e) => setFormData({...formData, frequencia_semanal_plano: parseInt(e.target.value)})}
                            >
                                <option value={1}>1x na semana</option>
                                <option value={2}>2x na semana</option>
                                <option value={3}>3x na semana</option>
                                <option value={4}>4x na semana</option>
                                <option value={5}>5x na semana</option>
                                <option value={6}>6x na semana</option>
                                <option value={7}>Livre / Diário</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                {formData.tipo_pagamento === 'mensal' ? 'Mensalidade' : 'Valor do Pacote'}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-bold text-sm">R$</span>
                                </div>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-50 border border-black/5 rounded-2xl pl-12 pr-5 py-4 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    value={new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(formData.valor_mensalidade || 0)}
                                    onChange={(e) => {
                                        // Remove tudo que não for dígito
                                        const value = e.target.value.replace(/\D/g, "");
                                        // Converte para float (ex: 1250 vira 12.50)
                                        const floatValue = parseFloat(value) / 100;
                                        setFormData({...formData, valor_mensalidade: floatValue || 0});
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Idade</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-semibold"
                                value={formData.idade}
                                onChange={(e) => setFormData({...formData, idade: parseInt(e.target.value) || 0})}
                            />
                        </div>
                        {formData.tipo_pagamento === 'mensal' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vencimento</label>
                                <input 
                                    type="number"
                                    min="1"
                                max="31"
                                    className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    value={formData.dia_vencimento}
                                    onChange={(e) => setFormData({...formData, dia_vencimento: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        )}
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
                        form="form-aluno"
                        type="submit"
                        disabled={loading}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-12 py-4 rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-95 uppercase text-xs tracking-widest"
                    >
                        {loading ? 'Sincronizando...' : alunoEdicao ? 'Salvar Alterações' : 'Finalizar Cadastro'}
                    </button>
                </div>
                </>
                )}
            </div>
        </div>
    );
};
