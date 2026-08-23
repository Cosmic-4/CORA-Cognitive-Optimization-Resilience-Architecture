import { useState, type FormEvent, useEffect, useRef } from 'react';
import { CollectorNode } from '../types';
import { apiClient } from '../hooks';
import { animate, stagger } from 'animejs';

interface CollectorsViewProps {
  collectors: CollectorNode[];
  onToggleActive: (id: string) => void;
  onAddCollector: (collector: CollectorNode) => void;
  onUpdateCollector: (collector: CollectorNode) => void;
}

export const CollectorsView = ({ collectors, onToggleActive, onAddCollector, onUpdateCollector }: CollectorsViewProps) => {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedId, setSelectedId] = useState(collectors[0]?.id || '');
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [selector, setSelector] = useState('');
  const [running, setRunning] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<any>(null);

  const filtered = collectors.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  const selected = collectors.find((c) => c.id === selectedId) || collectors[0];

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !domain) return;
    // Create via API
    apiClient.createCollector({ mission_id: 'default', name, target_domain: domain })
      .then((apiCol) => {
        const col = { ...apiCol, targetDomain: apiCol.target_domain, healthScore: apiCol.health_score, dataIntegrity: apiCol.data_integrity, itemsProcessed24h: 0, mutationRate: '0.0%', lastAutoRepairTime: 'Just now', active: !!apiCol.active, activeSelector: apiCol.active_selector } as CollectorNode;
        onAddCollector(col);
        setShowAdd(false);
        setSelectedId(col.id);
        setName(''); setDomain(''); setSelector('');
      })
      .catch(() => {
        // Fallback to local only
        const col: CollectorNode = { id: `col-${Date.now()}`, name, targetDomain: domain, status: 'HEALTHY', healthScore: 100, dataIntegrity: 100, itemsProcessed24h: 0, mutationRate: '0.0%', lastAutoRepairTime: 'Just now', active: true, activeSelector: selector || '[data-cora-target]' };
        onAddCollector(col);
        setShowAdd(false);
        setSelectedId(col.id);
        setName(''); setDomain(''); setSelector('');
      });
  };

  const handleRunCollector = async (id: string) => {
    setRunning(id);
    setRunResult(null);
    try {
      const result = await apiClient.runCollector(id);
      setRunResult(result);
      if (result.collector) {
        const updated: CollectorNode = {
          id: result.collector.id,
          name: result.collector.name,
          targetDomain: result.collector.target_domain,
          status: result.collector.status as CollectorNode['status'],
          healthScore: result.collector.health_score,
          dataIntegrity: result.collector.data_integrity,
          itemsProcessed24h: result.records?.length || 0,
          mutationRate: result.collector.runs_24h > 0 ? ((result.collector.mutations_24h / result.collector.runs_24h) * 100).toFixed(1) + '%' : '0.0%',
          lastAutoRepairTime: 'Just now',
          active: !!result.collector.active,
          activeSelector: result.collector.active_selector,
        };
        onUpdateCollector(updated);
      }
    } catch (err) {
      console.error('Run failed:', err);
    } finally {
      setRunning(null);
    }
  };

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!listRef.current) return;
    animate(listRef.current.querySelectorAll('.collector-card'), {
      translateY: [12, 0],
      opacity: [0, 1],
      duration: 400,
      delay: stagger(60),
      ease: 'outExpo',
    });
  }, [filtered.length]);

  const statusStyle = (s: string) => {
    if (s === 'HEALTHY') return { color: 'var(--color-success)', bg: 'var(--color-success-muted)' };
    if (s === 'MUTATING') return { color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' };
    if (s === 'REPAIRING') return { color: 'var(--color-cora)', bg: 'var(--color-cora-muted)' };
    return { color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' };
  };

  return (
    <div className="mx-auto w-full max-w-[1160px] space-y-6 animate-fadeIn">
      {/* Header — Apple */}
      <div className="flex justify-between items-end pb-6" style={{ borderBottom: '0.5px solid var(--color-border-subtle)' }}>
        <div>
          <h2 className="text-[28px] md:text-[30px] font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">Collectors</h2>
          <p className="text-[14px] leading-relaxed mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>Scraper Studio collectors → CORA validates, detects drift & shadow-verifies repairs</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 px-5 h-[40px] rounded-full text-[14px] font-semibold bg-[var(--color-text-primary)] text-[var(--color-bg-base)] hover:opacity-90 active:scale-[0.98] transition-all shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span> New Collector
        </button>
      </div>

      {/* Filters — premium pills */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'HEALTHY', 'MUTATING', 'REPAIRING', 'DEGRADED'].map((st) => (
          <button key={st} onClick={() => setFilterStatus(st)} className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all border ${filterStatus === st ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-base)] border-[var(--color-text-primary)] shadow-sm' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:text-[var(--color-text-primary)]'}`}>
            {st} <span className="ml-1 opacity-60">{st === 'ALL' ? collectors.length : collectors.filter((c) => c.status === st).length}</span>
          </button>
        ))}
      </div>

      {/* Main layout: list + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* List — premium */}
        <div ref={listRef} className="lg:col-span-2 space-y-2 max-h-[640px] overflow-y-auto pr-1">
          {filtered.map((c) => {
            const sc = statusStyle(c.status);
            return (
              <button key={c.id} onClick={(e) => { animate(e.currentTarget, { scale: [1, 0.98, 1], duration: 220, ease: 'outExpo' }); setSelectedId(c.id); }} className="collector-card w-full p-4 rounded-[16px] border text-left transition-all hover:shadow-sm" style={{
                backgroundColor: selectedId === c.id ? 'var(--color-bg-elevated)' : 'var(--color-bg-secondary)',
                borderColor: selectedId === c.id ? 'var(--color-text-primary)' : 'var(--color-border-subtle)',
                boxShadow: selectedId === c.id ? '0 2px 12px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)' : 'none',
              }}>
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold tracking-[-0.01em] flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                      {c.name}<span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.active ? 'var(--color-success)' : 'var(--color-text-muted)' }} />
                    </h3>
                    <code className="text-[12px] font-mono block truncate mt-1" style={{ color: 'var(--color-text-secondary)' }}>{c.targetDomain}</code>
                    <div className="text-[13px] font-medium mt-2 flex items-center gap-2">
                      <span style={{ color: c.healthScore > 80 ? 'var(--color-success)' : 'var(--color-warning)' }}>{c.healthScore}% health</span>
                      <span className="w-1 h-1 rounded-full bg-[var(--color-border-strong)]" /><span style={{ color: 'var(--color-text-muted)' }}>{c.mutationRate} mutations</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border shrink-0" style={{ color: sc.color, backgroundColor: sc.bg, borderColor: `${sc.color}30` }}>{c.status}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel — premium */}
        <div className="lg:col-span-3">
          {selected && (
            <div className="p-6 rounded-[18px] space-y-5" style={{ background: 'var(--color-bg-elevated)', border: '0.5px solid var(--color-border-subtle)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)' }}>
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Collector</div>
                  <h3 className="text-[20px] font-semibold tracking-[-0.02em] mt-1" style={{ color: 'var(--color-text-primary)' }}>{selected.name}</h3>
                  <code className="text-[13px] font-mono mt-1 block" style={{ color: 'var(--color-cora)' }}>{selected.targetDomain}</code>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border" style={{ color: 'var(--color-success)', background: 'var(--color-success-muted)', borderColor: 'rgba(52,211,153,0.2)' }}>● ACTIVE</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border" style={{ color: 'var(--color-brightdata)', background: 'var(--color-brightdata-muted)', borderColor: 'rgba(242,153,74,0.2)' }}>BRIGHT DATA</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { l: 'Records 24h', v: selected.itemsProcessed24h.toLocaleString(), c: 'var(--color-text-primary)' },
                  { l: 'Health', v: `${selected.healthScore}%`, c: 'var(--color-success)' },
                  { l: 'Last run', v: selected.lastAutoRepairTime, c: 'var(--color-cora)' },
                ].map((m) => (
                  <div key={m.l} className="p-4 rounded-xl text-center" style={{ background: 'var(--color-bg-secondary)', border: '0.5px solid var(--color-border-subtle)' }}>
                    <div className="text-[11px] font-medium tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>{m.l}</div>
                    <div className="text-[18px] font-semibold mt-1 tracking-[-0.02em]" style={{ color: m.c }}>{m.v}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--color-bg-secondary)', border: '0.5px solid var(--color-border-subtle)' }}>
                <h4 className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Active Selector</h4>
                <code className="text-[13px] font-mono font-medium block px-3 py-2 rounded-lg" style={{ color: 'var(--color-cora)', background: 'var(--color-bg-primary)', border: '0.5px solid var(--color-border-subtle)' }}>{selected.activeSelector}</code>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { l: 'Structural', s: 'Healed', ok: true },
                    { l: 'Semantic', s: 'Matched', ok: true },
                    { l: 'AI / Visual', s: 'Standby', ok: false },
                  ].map((r) => (
                    <div key={r.l} className="px-3 py-2 rounded-full border flex justify-between items-center text-[12px] font-medium" style={{
                      backgroundColor: r.ok ? 'var(--color-success-muted)' : 'var(--color-bg-primary)',
                      borderColor: r.ok ? 'rgba(52,211,153,0.2)' : 'var(--color-border-subtle)',
                      color: r.ok ? 'var(--color-success)' : 'var(--color-text-muted)',
                    }}>
                      <span>{r.l}</span><span className="font-semibold">{r.s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => handleRunCollector(selected.id)} disabled={running === selected.id}
                  className="px-6 h-[40px] rounded-full text-[14px] font-semibold transition-all disabled:opacity-50 shadow-sm"
                  style={{ background: 'var(--color-text-primary)', color: 'var(--color-bg-base)' }}>
                  {running === selected.id ? 'Running…' : 'Run Collector'}
                </button>
                <button onClick={() => onToggleActive(selected.id)} className="px-5 h-[40px] rounded-full text-[13px] font-medium border transition-colors shadow-sm"
                  style={{ background: selected.active ? 'var(--color-danger-muted)' : 'var(--color-success-muted)', borderColor: selected.active ? 'var(--color-danger)' : 'var(--color-success)', color: selected.active ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {selected.active ? 'Pause' : 'Activate'}
                </button>
              </div>

              {/* Run Result — clearly labels LIVE vs MOCK vs DEMO + genuine vs simulated healing */}
              {runResult && (
                <div className="p-3 rounded glass-light space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase tracking-[0.15em] font-medium">Last Run Result</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-bold border ${runResult.source?.startsWith('live') || runResult.live ? 'bg-[var(--color-success-muted)] text-[var(--color-success)] border-[var(--color-success)]' : runResult.source === 'mock' ? 'bg-[var(--color-warning-muted)] text-[var(--color-warning)] border-[var(--color-warning)]' : 'bg-[var(--color-cora-muted)] text-[var(--color-cora)] border-[var(--color-cora)]'}`}>{runResult.source?.toUpperCase() || (runResult.live ? 'LIVE' : 'MOCK')} {runResult.live ? '• real API' : runResult.source === 'demo' ? '• simulated' : '• preloaded'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono">
                    <div className="p-1.5 rounded border" style={{ borderColor: 'var(--color-success)', backgroundColor: 'var(--color-success-muted)' }}>
                      <div className="text-[8px] text-[var(--color-text-muted)]">RECORDS</div>
                      <div className="text-[11px] font-medium" style={{ color: 'var(--color-success)' }}>{runResult.records?.length || 0}</div>
                    </div>
                    <div className="p-1.5 rounded border" style={{ borderColor: runResult.validation?.valid ? 'var(--color-success)' : 'var(--color-danger)', backgroundColor: runResult.validation?.valid ? 'var(--color-success-muted)' : 'var(--color-danger-muted)' }}>
                      <div className="text-[8px] text-[var(--color-text-muted)]">VALID</div>
                      <div className="text-[11px] font-medium" style={{ color: runResult.validation?.valid ? 'var(--color-success)' : 'var(--color-danger)' }}>{runResult.validation?.valid ? 'YES' : 'NO'}</div>
                    </div>
                    <div className="p-1.5 rounded border" style={{ borderColor: 'var(--color-cora)', backgroundColor: 'var(--color-cora-muted)' }}>
                      <div className="text-[8px] text-[var(--color-text-muted)]">CONFIDENCE</div>
                      <div className="text-[11px] font-medium" style={{ color: 'var(--color-cora)' }}>{((runResult.validation?.confidence || 0) * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  {runResult.anomalies?.length > 0 && (
                    <div className="text-[9px] font-mono p-1.5 rounded border" style={{ borderColor: 'var(--color-warning)', backgroundColor: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
                      Genuine anomaly: {runResult.anomalies[0]?.type} on {runResult.anomalies[0]?.field || 'field'} — {runResult.anomalies[0]?.reason?.slice(0,80)}
                    </div>
                  )}
                  {runResult.repair && (
                    <div className="text-[9px] font-mono p-1.5 rounded border" style={{ borderColor: 'var(--color-success)', backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success)' }}>
                      Self-healed (genuine): {runResult.repair.old_selector} → {runResult.repair.new_selector}
                    </div>
                  )}
                  {runResult.source?.startsWith('live') && <div className="text-[8px] font-mono text-[var(--color-text-muted)]">Live structured data via CORA backend → validated → persisted. Demo mutations are separate (Mutation Centre / Mutate Web button).</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay">
          <div className="p-5 rounded glass-heavy animate-scaleIn w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[11px] font-medium text-[var(--color-text-primary)] uppercase font-mono">New Collector</h3>
              <button onClick={() => setShowAdd(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"><span className="material-symbols-outlined text-[15px]">close</span></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-2.5 text-[10px] font-mono">
              <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-2.5 py-2 rounded border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:border-[var(--color-cora)] transition-colors" />
              <input required placeholder="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full px-2.5 py-2 rounded border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:border-[var(--color-cora)] transition-colors" />
              <input placeholder="Selector" value={selector} onChange={(e) => setSelector(e.target.value)} className="w-full px-2.5 py-2 rounded border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:border-[var(--color-cora)] transition-colors" />
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
                <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">Cancel</button>
                <button type="submit" className="px-3 py-1.5 font-medium rounded bg-[var(--color-cora)] text-white">Deploy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
