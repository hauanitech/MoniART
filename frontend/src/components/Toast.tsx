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
      }, 2500);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`rounded-lg px-4 py-2 text-sm font-medium shadow-lg transition-all ${
            m.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}
