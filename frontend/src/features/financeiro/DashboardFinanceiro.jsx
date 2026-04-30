import { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import CardsKPI from './CardsKPI';
import GraficoReceita from './GraficoReceita';
import GraficoInadimplencia from './GraficoInadimplencia';
import TabelaPagamentos from '../pagamentos/TabelaPagamentos';
import { ModalPagamento } from '../pagamentos/ModalPagamento';
import { financeiroService, pagamentoService } from '../../services/api';

const DADOS_DEFAULT = {
    receita_total: 0,
    ticket_medio: 0,
    inadimplencia: 0,
    total_alunos: 0,
    alunos_em_dia: 0,
    alunos_inadimplentes: 0,
    receita_mensal_12m: []
};

const DashboardFinanceiro = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [financeiroData, setFinanceiroData] = useState(DADOS_DEFAULT);
    const [ultimosPagamentos, setUltimosPagamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [stats, pagamentos] = await Promise.all([
                financeiroService.obterEstatisticas(),
                pagamentoService.listar()
            ]);
            setFinanceiroData(stats);
            setUltimosPagamentos(pagamentos || []);
            setError(null);
        } catch (err) {
            console.error('Erro ao carregar dados financeiros:', err);
            setError('Não foi possível carregar os dados financeiros.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    const handlePagamentoRegistrado = () => {
        setIsModalOpen(false);
        carregarDados(); // Recarrega tudo após novo pagamento
    };

    if (loading && !financeiroData.receita_total) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-medium animate-pulse">Carregando inteligência financeira...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Gestão Financeira</h2>
                    <p className="text-slate-500 text-sm font-medium">Controle de receitas e saúde do seu negócio.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 w-full md:w-auto justify-center"
                >
                    <Plus size={20} /> Registrar Pagamento
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-medium flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <CardsKPI dados={financeiroData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <GraficoReceita dados={financeiroData.receita_mensal_12m} />
                <GraficoInadimplencia dados={financeiroData} />
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Últimos Lançamentos</h3>
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-widest">Tempo Real</span>
                </div>
                <TabelaPagamentos pagamentos={ultimosPagamentos} onDelete={carregarDados} />
            </div>

            <ModalPagamento 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSuccess={handlePagamentoRegistrado}
            />
        </div>
    );
};

export default DashboardFinanceiro;
