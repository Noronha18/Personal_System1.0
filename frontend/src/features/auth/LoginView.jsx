import { useState } from 'react';
import { authService } from '../../services/api';
import { ShieldCheck, Lock, User } from 'lucide-react';

export const LoginView = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login(username, password);
            onLoginSuccess();
        } catch (err) {
            setError(err.message || 'Falha ao entrar. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-ios-bg p-6 font-sans">
            <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-1000">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30 animate-bounce duration-[2000ms]">
                        <ShieldCheck size={40} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                        System<span className="text-emerald-500">1.0</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Plataforma de Performance</p>
                </div>

                <div className="bg-white border border-black/5 p-12 rounded-[3rem] shadow-2xl shadow-black/5 relative overflow-hidden">
                    {/* Decorativo de fundo */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                    
                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-500 text-xs font-black rounded-2xl text-center animate-in shake duration-500">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                <User size={12} className="text-emerald-500" /> Identificação
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
                                placeholder="Seu usuário"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                <Lock size={12} className="text-emerald-500" /> Segurança
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-black/5 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-[2rem] font-black text-white transition-all shadow-xl shadow-emerald-500/20 active:scale-95 text-xs uppercase tracking-widest
                ${loading 
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-400'
                }`}
                        >
                            {loading ? 'Validando Acesso...' : 'Entrar no Sistema'}
                        </button>
                    </form>
                </div>
                
                <p className="text-center mt-12 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    Acesso restrito a <span className="text-emerald-500">treinadores autorizados</span>
                </p>
            </div>
        </div>
    );
};
