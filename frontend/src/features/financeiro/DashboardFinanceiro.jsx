import { Suspense, useState, useEffect } from 'react';
import CardsKPI from './CardsKPI';
import GraficoReceita from './GraficoReceita';
import GraficoInadimplencia from './GraficoInadimplencia';
import TabelaPagamentos from '../pagamentos/TabelaPagamentos';
import { ModalPagamento } from '../pagamentos/ModalPagamento';

// Dados fictícios para segurança
const DADOS_DEFAULT = {
    receita_total: 0,
    ticket_medio: 0,
    inadimplencia: 0,
    total_alunos: 0,
    alunos_em_dia: 0,
    alunos_inadimplentes: 0,
    receita_mensal_12m: [
        { referencia_mes: '01/2026', receita: 0 },
        { referencia_mes: '02/2026', receita: 0 }
    ]
};

const DashboardFinanceiro = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [financeiroData, setFinanceiroData] = useState(DADOS_DEFAULT);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Gestão Financeira</h2>
                    <p className="text-slate-500 text-sm font-medium">Controle de receitas e saúde do seu negócio.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                    <span>➕</span> Registrar Pagamento
                </button>
            </div>

            <CardsKPI dados={financeiroData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
                    <h3 className="text-lg font-bold text-slate-200 mb-6">📈 Evolução da Receita</h3>
                    <div className="h-64">
                         <GraficoReceita dados={financeiroData.receita_mensal_12m} />
                    </div>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
                    <h3 className="text-lg font-bold text-slate-200 mb-6">📉 Índice de Inadimplência</h3>
                    <div className="h-64">
                        <GraficoInadimplencia dados={financeiroData} />
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
                <h3 className="text-xl font-bold text-white mb-6">Últimos Lançamentos</h3>
                <TabelaPagamentos pagamentos={[]} />
            </div>

            <ModalPagamento 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default DashboardFinanceiro;
