import { useState } from 'react';
import { LoginView } from './features/auth/LoginView';
import { authService } from './services/api';

// Imports de Features
import { ListaAlunosFeature } from './features/alunos/ListaAlunos';
import { DetalheAluno } from './features/alunos/DetalheAluno';
import { ModuloTreinos } from './features/treinos/ModuloTreinos';
import DashboardFinanceiro from './features/financeiro/DashboardFinanceiro';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [abaAtiva, setAbaAtiva] = useState('alunos');
  const [selectedAlunoId, setSelectedAlunoId] = useState(null);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderConteudo = () => {
    switch (abaAtiva) {
      case 'alunos': 
        return <ListaAlunosFeature onSelectAluno={(id) => setSelectedAlunoId(id)} />;
      case 'treinos': 
        return <ModuloTreinos />;
      case 'financeiro': 
        return <DashboardFinanceiro />;
      default: 
        return <ListaAlunosFeature onSelectAluno={(id) => setSelectedAlunoId(id)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        <header className="sticky top-4 z-40 flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white/70 p-4 md:p-5 rounded-[2rem] border border-white/20 backdrop-blur-2xl shadow-xl shadow-black/5">
          <div className="flex items-center gap-4 pl-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-500/20">P</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">System<span className="text-emerald-500">1.0</span></h1>
          </div>
          
          <nav className="flex p-1 bg-slate-200/50 rounded-2xl border border-white/20 shadow-inner">
            {[
              { id: 'alunos', label: 'Alunos' },
              { id: 'treinos', label: 'Treinos' },
              { id: 'financeiro', label: 'Financeiro' }
            ].map((aba) => (
              <button
                key={aba.id}
                onClick={() => {
                  setAbaAtiva(aba.id);
                  setSelectedAlunoId(null);
                }}
                className={`px-6 py-2 rounded-[0.85rem] text-sm font-semibold transition-all duration-300 active:scale-95 ${
                  abaAtiva === aba.id
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {aba.label}
              </button>
            ))}
          </nav>

          <button 
            onClick={handleLogout}
            className="px-6 py-2.5 bg-slate-200/50 hover:bg-slate-200 text-xs font-bold text-slate-600 rounded-2xl transition-all active:scale-95"
          >
            Logout
          </button>
        </header>

        <main className="min-h-[60vh] animate-in fade-in slide-in-from-bottom-2 duration-1000">
           {renderConteudo()}
        </main>

        <footer className="mt-20 pt-8 border-t border-black/5 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            © 2026 Personal System v1.0
          </p>
        </footer>
      </div>

      {/* Visão de Prontuário (Sobreposta) */}
      {selectedAlunoId && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full p-4 md:p-12">
                <DetalheAluno 
                    alunoId={selectedAlunoId} 
                    onBack={() => setSelectedAlunoId(null)} 
                />
            </div>
        </div>
      )}
    </div>
  );
}

export default App;
