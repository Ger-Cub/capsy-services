import React, { useEffect, useState } from 'react';

type ToastItem = { id: number; message: string; type?: 'success' | 'error' | 'info' };

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const msg = detail.message || 'Notification';
      const type = detail.type || 'info';
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((t) => [...t, { id, message: msg, type }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, detail.duration || 4000);
    };
    window.addEventListener('capsy:toast', handler as EventListener);
    return () => window.removeEventListener('capsy:toast', handler as EventListener);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 bottom-6 z-60 flex flex-col gap-3">
      {toasts.map((t) => (
        <div key={t.id} className={`max-w-sm w-full px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${t.type === 'error' ? 'bg-rose-600' : t.type === 'success' ? 'bg-green-600' : 'bg-slate-700'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
