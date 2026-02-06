import { use, Suspense } from 'react';

const fetchAlunos = async () => {
    const res = await fetch('http://localhost:8000/alunos');
    if (!res.ok) throw new Error('Falha ao conectar com a API');
    return res.json();
}

// 1. Recebemos 'onSelectAluno' aqui
const TabelaAlunos = ({ promiseAlunos, onSelectAluno }) => {
    const alunos = use(promiseAlunos);

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl">
            <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">
                    <tr>
                        <th className="p-4">Aluno</th>
                        <th className="p-4">CPF</th>
                        <th className="p-4">Vencimento</th>
                        <th className="p-4 text-center">Status Financeiro</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {alunos.map((aluno) => (
                        <tr 
                            key={aluno.id} 
                            // 2. Adicionamos o evento de clique aqui
                            onClick={() => onSelectAluno(aluno.id)}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer"
                        >
                            <td className="p-4 text-slate-900 dark:text-white font-medium">{aluno.nome}</td>
                            <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-sm">{aluno.cpf}</td>
                            <td className="p-4 text-slate-600 dark:text-slate-300">Dia {aluno.dia_vencimento}</td>
                            <td className="p-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${aluno.status_financeiro === 'atrasado'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    }`}>
                                    {aluno.status_financeiro === 'atrasado' ? 'Atrasado' : 'Em Dia'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// 3. Recebemos 'onSelectAluno' aqui também para repassar
export const ListaAlunosFeature = ({ onSelectAluno }) => {
    const promise = fetchAlunos();

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Seus Alunos
            </h2>
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 dark:text-slate-400 animate-pulse">Sincronizando com o motor Python...</p>
                </div>
            }>
                {/* 4. Repassamos a prop para a tabela */}
                <TabelaAlunos promiseAlunos={promise} onSelectAluno={onSelectAluno} />
            </Suspense>
        </div>
    );
};
