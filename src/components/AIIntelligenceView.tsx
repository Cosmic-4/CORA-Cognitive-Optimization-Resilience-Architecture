import { useState, useEffect } from 'react';
import { apiClient } from '../hooks';

interface Signal { time: string; field: string; change: string; old: string; new: string; collector: string; type: 'price' | 'availability'; }

export const AIIntelligenceView = () => {
  const [marketSignals, setMarketSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'price' | 'availability'>('all');

  useEffect(() => {
    apiClient.getSignals()
      .then((data) => setMarketSignals(data as Signal[]))
      .catch(() => setMarketSignals([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = marketSignals.filter((s) => filter === 'all' || s.type === filter);

  return (
    <div className="space-y-5 animate-fadeIn mt-14 md:mt-14">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--color-border-subtle)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">Intelligence</h2>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-mono">Meaningful changes discovered from collected data.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-1">
        {(['all', 'price', 'availability'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="px-2.5 py-1 rounded text-[9px] font-mono capitalize border transition-all" style={{
            backgroundColor: filter === f ? 'var(--color-cora-muted)' : 'transparent',
            color: filter === f ? 'var(--color-cora)' : 'var(--color-text-muted)',
            borderColor: filter === f ? 'var(--color-cora)' : 'var(--color-border-subtle)',
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Signals */}
      <div className="space-y-0">
        {filtered.map((signal, idx) => {
          const isUp = signal.change.startsWith('+');
          const isDown = signal.change.startsWith('-');
          const isNeutral = !isUp && !isDown;
          const signalColor = isDown ? 'var(--color-danger)' : isUp ? 'var(--color-success)' : 'var(--color-warning)';

          return (
            <div key={idx} className="p-3 border-b border-[var(--color-border-subtle)] flex items-center gap-4 group hover:bg-[var(--color-bg-hover)] transition-colors">
              <div className="font-mono text-[9px] text-[var(--color-text-muted)] w-10 shrink-0">{signal.time}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-[var(--color-text-primary)]">{signal.field}</span>
                  <span className="px-1.5 py-0.5 rounded text-[7px] font-mono font-medium border" style={{
                    color: signal.type === 'price' ? 'var(--color-cora)' : 'var(--color-warning)',
                    backgroundColor: signal.type === 'price' ? 'var(--color-cora-muted)' : 'var(--color-warning-muted)',
                    borderColor: signal.type === 'price' ? 'var(--color-cora)' : 'var(--color-warning)',
                  }}>
                    {signal.type}
                  </span>
                </div>
                <div className="text-[9px] text-[var(--color-text-muted)] font-mono mt-0.5">
                  {signal.old} → {signal.new} · {signal.collector}
                </div>
              </div>
              <div className="text-[11px] font-mono font-medium shrink-0" style={{ color: signalColor }}>
                {signal.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-4 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
        <h3 className="text-[9px] font-medium font-mono text-[var(--color-text-primary)] uppercase tracking-[0.12em] mb-2.5">Summary</h3>
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
          <div className="p-2.5 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]">
            <div className="text-lg font-semibold" style={{ color: 'var(--color-cora)' }}>{loading ? '…' : marketSignals.length}</div>
            <div className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-wider">Signals</div>
          </div>
          <div className="p-2.5 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]">
            <div className="text-lg font-semibold" style={{ color: 'var(--color-success)' }}>{loading ? '…' : marketSignals.filter((s) => s.type === 'price').length}</div>
            <div className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-wider">Price Drops</div>
          </div>
          <div className="p-2.5 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]">
            <div className="text-lg font-semibold" style={{ color: 'var(--color-warning)' }}>{loading ? '…' : marketSignals.filter((s) => s.type === 'availability').length}</div>
            <div className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-wider">Stock Changes</div>
          </div>
        </div>
      </div>
    </div>
  );
};
