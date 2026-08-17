import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

const STYLES = {
  success: 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(34,197,94,0.25)]',
  warning: 'bg-amber-950/90 border-amber-500 text-amber-200',
  error: 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(255,0,127,0.25)]',
};
const ICONS = {
  success: 'fa-circle-check text-emerald-400',
  warning: 'fa-triangle-exclamation text-amber-400',
  error: 'fa-circle-xmark text-rose-400',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type, leaving: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
    }, 4500);
  }, []);

  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div id="toast-container" className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              `flex items-center gap-3 px-4 py-3 border rounded-xl shadow-2xl backdrop-blur-md text-sm font-medium ` +
              `transition-all duration-300 transform pointer-events-auto ${STYLES[t.type] || STYLES.success} ` +
              (t.leaving ? 'opacity-0 -translate-y-2' : 'translate-y-0')
            }
          >
            <i className={`fa-solid ${ICONS[t.type] || ICONS.success} text-lg`} />
            <div className="flex-1">{t.message}</div>
            <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-white p-1">
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
