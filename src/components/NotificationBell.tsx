import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const typeColors: Record<string, string> = {
  info: 'var(--color-cora)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-danger)',
};

const typeIcons: Record<string, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) markAllRead(); }}
        className="relative p-1.5 rounded neu-control text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[7px] font-mono font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'var(--color-danger)' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] shadow-2xl z-50 animate-fadeIn">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border-subtle)]">
            <span className="text-[10px] font-mono font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Notifications</span>
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-[9px] font-mono text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors">
                Clear all
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-[24px] text-[var(--color-text-muted)] opacity-30">notifications_off</span>
                <p className="text-[10px] font-mono text-[var(--color-text-muted)] mt-1">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-2.5 px-3 py-2.5 border-b border-[var(--color-border-subtle)] transition-colors ${n.read ? 'opacity-60' : 'bg-[var(--color-bg-primary)]'}`}>
                  <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0" style={{ color: typeColors[n.type] }}>{typeIcons[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-[var(--color-text-primary)] leading-tight">{n.title}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">{n.message}</p>
                  </div>
                  <span className="text-[8px] font-mono text-[var(--color-text-muted)] shrink-0 mt-0.5">{n.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
