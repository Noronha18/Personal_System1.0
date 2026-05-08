import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const toast = useCallback(({ tipo = 'sucesso', texto }) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, tipo, texto }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none" role="status" aria-live="polite">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`flex items-center gap-3 px-5 py-4 rounded-lg shadow-2 pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-sm w-full
                            ${t.tipo === 'sucesso'
                                ? 'bg-surface border border-success/20 text-success-text'
                                : 'bg-surface border border-danger/20 text-danger-text'}`}
                    >
                        {t.tipo === 'sucesso'
                            ? <CheckCircle2 size={18} className="shrink-0 text-success" aria-hidden="true" />
                            : <AlertCircle size={18} className="shrink-0 text-danger" aria-hidden="true" />}
                        <span className="text-sm font-medium flex-1">{t.texto}</span>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="p-1 opacity-40 hover:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
