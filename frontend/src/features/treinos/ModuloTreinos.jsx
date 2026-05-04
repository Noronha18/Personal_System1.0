import { useState, useEffect } from 'react';
import { Dumbbell, Plus, Book, Search, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { alunoService, treinoService } from '../../services/api';
import { ModalPlanoTreino } from '../alunos/ModalPlanoTreino';

export const ModuloTreinos = () => {
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [templates, setTemplates] = useState([]);

    const carregarDados = async () => {
        try {
            const [listaAlunos, listaTemplates] = await Promise.all([
                alunoService.listar(),
                treinoService.listarTemplates()
            ]);
            setAlunos(listaAlunos);
            setTemplates(listaTemplates);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    const handleSavePlano = async (payload) => {
        setLoading(true);
        try {
            if (payload.aluno_id) {
                await treinoService.criarPlano(payload.aluno_id, payload);
                setMensagem({ tipo: 'sucesso', texto: 'Plano vinculado ao aluno com sucesso!' });
            } else {
                await treinoService.criarTemplate(payload);
                setMensagem({ tipo: 'sucesso', texto: 'Modelo global salvo com sucesso!' });
            }
            setIsModalOpen(false);
            carregarDados();
            setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
        } catch (err) {
            setMensagem({ tipo: 'erro', texto: 'Erro ao salvar o plano: ' + err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header com Ações Principais */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                        <Dumbbell size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Módulo de Treinos</h2>
                        <p className="text-slate-500 font-medium">Gerencie modelos e prescrições inteligentes.</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                    >
                        <Plus size={18} /> Novo Plano
                    </button>
                </div>
            </div>

            {mensagem.texto && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300
                    ${mensagem.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {mensagem.tipo === 'sucesso' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="text-xs font-black uppercase tracking-widest">{mensagem.texto}</span>
                </div>
            )}

            {/* Grid de Conteúdo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Templates Globais */}
                <div className="bg-white border border-black/5 rounded-[2.5rem] p-10 shadow-xl shadow-black/5">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Book className="text-blue-500" size={20} /> Modelos Globais
                        </h3>
                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase">{templates.length} salvos</span>
                    </div>

                    <div className="space-y-4">
                        {templates.map(template => (
                            <div key={template.id} className="p-6 bg-slate-50/50 border border-black/5 rounded-3xl hover:bg-white hover:shadow-lg transition-all group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-black text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{template.titulo}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                            {template.treinos?.length || 0} Divisões • {template.duracao_semanas} Semanas
                                        </p>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            if (confirm("Deseja apagar este modelo global?")) {
                                                await treinoService.deletarPlano(template.id);
                                                carregarDados();
                                            }
                                        }}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {templates.length === 0 && (
                            <div className="text-center py-10 text-slate-300 italic text-sm">Nenhum modelo global criado.</div>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
                    <div className="relative z-10 space-y-6">
                        <h3 className="text-2xl font-black tracking-tight leading-tight">Prescreva com<br/>eficiência.</h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
                            Crie modelos de treinos A/B/C e aplique-os instantaneamente a qualquer aluno do seu plantel.
                        </p>
                        <ul className="space-y-3">
                            {['Até 26 divisões (A-Z)', 'Biblioteca de 50+ exercícios', 'Clonagem inteligente'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                    <CheckCircle2 size={14} /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Dumbbell className="absolute -right-10 -bottom-10 text-white/5 w-60 h-60 -rotate-12" />
                </div>
            </div>

            {/* Modal Unificado */}
            <ModalPlanoTreino 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePlano}
            />
        </div>
    );
};
