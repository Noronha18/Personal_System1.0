import { useState, Suspense } from 'react';
import { ListaAlunosFeature } from './features/alunos/ListaAlunos';
import { DetalheAluno } from './features/alunos/DetalheAluno';
import DashboardFinanceiro from './features/financeiro/DashboardFinanceiro';

function App() {
  const [selectedAlunoId, setSelectedAlunoId] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState('alunos'); // 'alunos' | 'financeiro'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto">
        {/* === Cabeçalho Global com Navegação === */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              Personal System 1.0
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Performance & Prescrição Inteligente
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Navegação por Abas */}
            <nav className="flex gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button
                onClick={() => {
                  setTelaAtiva('alunos');
                  setSelectedAlunoId(null);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  telaAtiva === 'alunos'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Alunos
              </button>
              <button
                onClick={() => {
                  setTelaAtiva('financeiro');
                  setSelectedAlunoId(null);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  telaAtiva === 'financeiro'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Dashboard Financeiro
              </button>
            </nav>

            <div className="px-4 py-2 bg-slate-900 rounded-full border border-slate-800 text-xs font-mono text-slate-400 shadow-sm">
              17 FEV 2026
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-700"></div>
          </div>
        </header>
        
        {/* === Área de Conteúdo Dinâmico === */}
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-emerald-500/20 shadow-lg"></div>
              <p className="text-slate-500 text-sm animate-pulse tracking-wide">Sincronizando dados...</p>
            </div>
          }>
            {/* Renderização Condicional */}
            {telaAtiva === 'financeiro' ? (
              <DashboardFinanceiro />
            ) : !selectedAlunoId ? (
              <ListaAlunosFeature 
                onSelectAluno={(id) => setSelectedAlunoId(id)} 
              />
            ) : (
              <DetalheAluno 
                alunoId={selectedAlunoId} 
                onBack={() => setSelectedAlunoId(null)} 
              />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;
