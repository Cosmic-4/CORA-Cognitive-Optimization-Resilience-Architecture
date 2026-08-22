import { useEffect, useState } from 'react';
import { useNotifications, type Notification } from '../contexts/NotificationContext';

const typeStyles: Record<string, { bg: string; border: string; icon: string }> = {
  info: { bg: 'var(--color-cora-muted)', border: 'var(--color-cora)', icon: 'info' },
  success: { bg: 'var(--color-success-muted)', border: 'var(--color-success)', icon: 'check_circle' },
  warning: { bg: 'var(--color-warning-muted)', border: 'var(--color-warning)', icon: 'warning' },
  error: { bg: 'var(--color-danger-muted)', border: 'var(--color-danger)', icon: 'error' },
};

function Toast({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) {
  const style = typeStyles[notification.type] || typeStyles.info;
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 4000);
    const t2 = setTimeout(onDismiss, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDismiss]);

  return (
    <div
      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border shadow-lg transition-all duration-300 ${exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
      style={{ backgroundColor: style.bg, borderColor: style.border }}
    >
      <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0" style={{ color: style.border }}>{style.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-[var(--color-text-primary)] leading-tight">{notification.title}</p>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{notification.message}</p>
      </div>
      <button onClick={() => { setExiting(true); setTimeout(onDismiss, 300); }} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] shrink-0">
        <span className="material-symbols-outlined text-[12px]">close</span>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { notifications } = useNotifications();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const recent = notifications.filter((n) => !dismissed.has(n.id)).slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none">
      {recent.map((n) => (
        <div key={n.id} className="pointer-events-auto animate-slideIn">
          <Toast notification={n} onDismiss={() => setDismissed((prev) => new Set(prev).add(n.id))} />
        </div>
      ))}
    </div>
  );
}
