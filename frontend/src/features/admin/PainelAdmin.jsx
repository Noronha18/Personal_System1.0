import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api';
import { UserPlus, Users, Shield, Eye, EyeOff, RefreshCw, CheckCircle, XCircle, KeyRound } from 'lucide-react';

const ROLE_LABEL = { admin: 'Admin', trainer: 'Trainer', aluno: 'Aluno' };
const ROLE_COLOR = {
    admin: 'bg-brand/10 text-brand border-brand/20',
    trainer: 'bg-success/10 text-success border-success/20',
    aluno: 'bg-text-muted/10 text-text-muted border-text-muted/20',
};

function BadgeRole({ role }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${ROLE_COLOR[role] ?? ROLE_COLOR.aluno}`}>
            {ROLE_LABEL[role] ?? role}
        </span>
    );
}

function FormCadastrarTrainer({ onSuccess }) {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setLoading(true);
        try {
            await adminService.criarTrainer(form);
            setForm({ username: '', email: '', password: '' });
            onSuccess();
        } catch (err) {
            setErro(err.message || 'Erro ao cadastrar trainer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                    <UserPlus size={18} className="text-brand" />
                </div>
                <div>
                    <h2 className="text-sm font-black text-text-primary">Cadastrar Trainer</h2>
                    <p className="text-xs text-text-muted">Cria uma nova conta com acesso de treinador</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {erro && (
                    <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-bold rounded-xl flex items-center gap-2">
                        <XCircle size={14} /> {erro}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Usuário</label>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                        placeholder="ex: joao.silva"
                        className="w-full bg-overlay border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-bold focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-muted"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">E-mail</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="trainer@academia.com"
                        className="w-full bg-overlay border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-bold focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-muted"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Senha</label>
                    <div className="relative">
                        <input
                            name="password"
                            type={mostrarSenha ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full bg-overlay border border-border rounded-xl px-4 py-3 pr-12 text-sm text-text-primary font-bold focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-muted"
                        />
                        <button
                            type="button"
                            onClick={() => setMostrarSenha((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                            {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 bg-brand hover:bg-brand-hover text-brand-fg shadow-lg shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Cadastrando...' : 'Cadastrar Trainer'}
                </button>
            </form>
        </div>
    );
}

function LinhaUsuario({ u }) {
    const [aberto, setAberto] = useState(false);
    const [novaSenha, setNovaSenha] = useState('');
    const [mostrar, setMostrar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [erro, setErro] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        setErro('');
        setLoading(true);
        try {
            await adminService.resetarSenha(u.id, novaSenha);
            setSucesso(true);
            setNovaSenha('');
            setAberto(false);
            setTimeout(() => setSucesso(false), 3000);
        } catch (err) {
            setErro(err.message || 'Erro ao redefinir senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="divide-y divide-border/50">
            <div className="flex items-center gap-4 px-6 py-4 hover:bg-overlay/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-overlay flex items-center justify-center flex-shrink-0">
                    <Shield size={15} className="text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{u.username}</p>
                    <p className="text-xs text-text-muted truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {sucesso && <CheckCircle size={14} className="text-success" />}
                    <BadgeRole role={u.role} />
                    <span
                        className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-success' : 'bg-danger'}`}
                        title={u.is_active ? 'Ativo' : 'Inativo'}
                    />
                    <button
                        onClick={() => { setAberto((v) => !v); setErro(''); }}
                        className={`p-1.5 rounded-lg transition-colors ${aberto ? 'bg-brand/10 text-brand' : 'text-text-muted hover:text-text-primary hover:bg-overlay'}`}
                        aria-label={`Redefinir senha de ${u.username}`}
                        title="Redefinir senha"
                    >
                        <KeyRound size={14} />
                    </button>
                </div>
            </div>

            {aberto && (
                <form onSubmit={handleReset} className="flex items-center gap-2 px-6 py-3 bg-overlay/60 animate-in fade-in slide-in-from-top-1 duration-150">
                    {erro && <p className="text-danger text-[10px] font-bold mr-1">{erro}</p>}
                    <div className="relative flex-1">
                        <input
                            type={mostrar ? 'text' : 'password'}
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Nova senha (mín. 6 caracteres)"
                            className="w-full bg-surface border border-border rounded-lg px-3 py-2 pr-9 text-xs text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-text-muted"
                        />
                        <button
                            type="button"
                            onClick={() => setMostrar((v) => !v)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                            aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                            {mostrar ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-3 py-2 bg-brand hover:bg-brand-hover text-brand-fg text-[10px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                    >
                        {loading ? '...' : 'Salvar'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setAberto(false)}
                        className="px-3 py-2 bg-overlay hover:bg-border text-text-muted text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                    >
                        Cancelar
                    </button>
                </form>
            )}
        </div>
    );
}

function TabelaUsuarios({ usuarios, onRefresh, loading }) {
    return (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-overlay flex items-center justify-center">
                        <Users size={18} className="text-text-secondary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-text-primary">Usuários do Sistema</h2>
                        <p className="text-xs text-text-muted">{usuarios.length} conta{usuarios.length !== 1 ? 's' : ''} cadastrada{usuarios.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay transition-all disabled:opacity-50"
                    aria-label="Atualizar lista"
                >
                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {usuarios.length === 0 ? (
                <div className="px-6 py-12 text-center text-text-muted text-xs font-bold">
                    Nenhum usuário encontrado.
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {usuarios.map((u) => <LinhaUsuario key={u.id} u={u} />)}
                </div>
            )}
        </div>
    );
}

export function PainelAdmin() {
    const [usuarios, setUsuarios] = useState([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    const [sucesso, setSucesso] = useState('');

    const carregarUsuarios = useCallback(async () => {
        setLoadingUsuarios(true);
        try {
            const data = await adminService.listarUsuarios();
            setUsuarios(data);
        } catch {
            // erros de rede tratados globalmente pelo apiFetch
        } finally {
            setLoadingUsuarios(false);
        }
    }, []);

    useEffect(() => {
        carregarUsuarios();
    }, [carregarUsuarios]);

    const handleTrainerCriado = () => {
        setSucesso('Trainer cadastrado com sucesso!');
        carregarUsuarios();
        setTimeout(() => setSucesso(''), 4000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Shield size={20} className="text-brand" />
                <h1 className="text-xl font-black text-text-primary tracking-tight">Painel do Administrador</h1>
            </div>

            {sucesso && (
                <div className="flex items-center gap-2 p-4 bg-success/10 border border-success/20 text-success text-xs font-black rounded-xl animate-in fade-in duration-300">
                    <CheckCircle size={15} /> {sucesso}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <FormCadastrarTrainer onSuccess={handleTrainerCriado} />
                <TabelaUsuarios
                    usuarios={usuarios}
                    onRefresh={carregarUsuarios}
                    loading={loadingUsuarios}
                />
            </div>
        </div>
    );
}
