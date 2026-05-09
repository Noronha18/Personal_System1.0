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
        <div className="min-h-screen flex items-center justify-center bg-canvas p-6 font-sans">
            <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-brand rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand/30">
                        <ShieldCheck size={40} className="text-brand-fg" />
                    </div>
                    <h1 className="text-5xl font-black text-text-primary tracking-tighter">
                        System<span className="text-brand">1.0</span>
                    </h1>
                    <p className="text-text-muted font-bold uppercase text-xs tracking-[0.3em] mt-3">Plataforma de Performance</p>
                </div>

                <div className="bg-surface border border-border p-12 rounded-[3rem] shadow-2xl shadow-text-ink/5">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 bg-danger/10 border border-danger/20 text-danger text-xs font-black rounded-2xl text-center animate-in fade-in duration-300">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label
                                htmlFor="login-username"
                                className="text-xs font-black uppercase tracking-widest text-text-muted ml-1 flex items-center gap-2"
                            >
                                <User size={12} className="text-brand" aria-hidden="true" /> Identificação
                            </label>
                            <input
                                id="login-username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-overlay border border-border rounded-2xl px-6 py-4 text-text-primary font-bold focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-muted"
                                placeholder="Seu usuário"
                            />
                        </div>

                        <div className="space-y-3">
                            <label
                                htmlFor="login-password"
                                className="text-xs font-black uppercase tracking-widest text-text-muted ml-1 flex items-center gap-2"
                            >
                                <Lock size={12} className="text-brand" aria-hidden="true" /> Segurança
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-overlay border border-border rounded-2xl px-6 py-4 text-text-primary font-bold focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-muted"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-[2rem] font-black transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest
                ${loading
                  ? 'bg-overlay text-text-muted cursor-not-allowed'
                  : 'bg-brand hover:bg-brand-hover text-brand-fg shadow-brand/20'
                }`}
                        >
                            {loading ? 'Validando Acesso...' : 'Entrar no Sistema'}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-12 text-text-muted text-xs font-black uppercase tracking-widest">
                    Acesso restrito a <span className="text-brand">treinadores autorizados</span>
                </p>
            </div>
        </div>
    );
};
