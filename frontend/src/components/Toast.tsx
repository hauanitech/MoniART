import { useEffect, useState } from 'react';

interface ToastMsg {
  id: number;
  text: string;
  type: 'success' | 'error';
}

let nextId = 0;
const listeners = new Set<(msg: ToastMsg) => void>();

export function showToast(text: string, type: 'success' | 'error' = 'success') {
  const msg: ToastMsg = { id: nextId++, text, type };
  listeners.forEach((fn) => fn(msg));
}

export default function Toast() {
  const [messages, setMessages] = useState<ToastMsg[]>([]);

  useEffect(() => {
    const handler = (msg: ToastMsg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      }, 3000);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`rounded-lg px-4 py-3 text-sm font-medium shadow-soft-lg transition-all animate-in slide-in-from-right-2 flex items-center gap-3 ${
            m.type === 'success'
              ? 'bg-white text-surface-800 border border-surface-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {m.type === 'success' ? (
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{m.text}</span>
        </div>
      ))}
    </div>
  );
}
