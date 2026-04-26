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
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        <header className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-black text-black">P</div>
            <h1 className="text-xl font-bold text-white tracking-tight">SYSTEM<span className="text-emerald-500">1.0</span></h1>
          </div>
          
          <nav className="flex p-1 bg-black/40 rounded-xl border border-slate-800/50">
            {[
              { id: 'alunos', label: 'Alunos', icon: '👥' },
              { id: 'treinos', label: 'Treinos', icon: '💪' },
              { id: 'financeiro', label: 'Financeiro', icon: '💰' }
            ].map((aba) => (
              <button
                key={aba.id}
                onClick={() => {
                  setAbaAtiva(aba.id);
                  setSelectedAlunoId(null);
                }}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${
                  abaAtiva === aba.id
                    ? 'bg-slate-800 text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                }`}
              >
                {aba.label}
              </button>
            ))}
          </nav>

          <button 
            onClick={handleLogout}
            className="px-4 py-2 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 hover:text-red-500 hover:border-red-500/20 transition-all"
          >
            LOGOUT
          </button>
        </header>

        <main className="min-h-[60vh] animate-in fade-in duration-700">
           {renderConteudo()}
        </main>

        <footer className="mt-20 pt-8 border-t border-slate-900 text-center">
          <p className="text-slate-600 text-[10px] font-medium uppercase tracking-[0.3em]">
            © 2026 Personal System v1.0
          </p>
        </footer>
      </div>

      {/* Visão de Prontuário (Sobreposta) */}
      {selectedAlunoId && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto custom-scrollbar">
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
