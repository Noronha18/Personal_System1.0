import { useState } from 'react';
import { authService } from '../../services/api';

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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                        Personal System
                    </h1>
                    <p className="text-slate-500 mt-2">Área do Treinador</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                                Usuário
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                placeholder="Seu usuário"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                                Senha
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg
                ${loading 
                  ? 'bg-slate-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]'
                }`}
                        >
                            {loading ? 'Validando...' : 'Entrar no Sistema'}
                        </button>
                    </form>
                </div>
                
                <p className="text-center mt-8 text-slate-600 text-sm">
                    Ainda não tem acesso? <span className="text-emerald-500 cursor-help">Contate o administrador</span>
                </p>
            </div>
        </div>
    );
};
