import { useState, useEffect } from 'react';
import { Plus, AlertCircle, DollarSign } from 'lucide-react';
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
        carregarDados();
    };

    if (loading && !financeiroData.receita_total) {
        return (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium uppercase text-xs tracking-widest animate-pulse">Sincronizando Fluxo de Caixa...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-2">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Financeiro</h2>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium">Saúde financeira e previsibilidade do negócio.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 sm:px-8 py-4 rounded-2xl font-semibold transition-colors shadow-md shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 uppercase text-xs tracking-wide"
                >
                    <Plus size={20} /> <span className="sm:inline">Registrar</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-5 rounded-[2rem] text-sm font-bold flex items-center gap-3 mx-2">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            <CardsKPI dados={financeiroData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch mx-2">
                <GraficoReceita dados={financeiroData.receita_mensal_12m} />
                <GraficoInadimplencia dados={financeiroData} />
            </div>

            <div className="bg-white border border-slate-200/70 rounded-3xl p-6 sm:p-8 shadow-md mx-2">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-50 text-emerald-500 rounded-xl flex items-center justify-center border border-slate-100">
                            <DollarSign size={18} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Lançamentos Recentes</h3>
                    </div>
                    <span className="text-slate-500 text-xs font-medium bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">Histórico</span>
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
