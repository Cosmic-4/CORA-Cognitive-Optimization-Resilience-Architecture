import { useState, type FormEvent } from 'react';
import { CollectorNode } from '../types';
import { apiClient } from '../hooks';

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

  const statusStyle = (s: string) => {
    if (s === 'HEALTHY') return { color: 'var(--color-success)', bg: 'var(--color-success-muted)' };
    if (s === 'MUTATING') return { color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' };
    if (s === 'REPAIRING') return { color: 'var(--color-cora)', bg: 'var(--color-cora-muted)' };
    return { color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' };
  };

  return (
    <div className="space-y-5 animate-fadeIn mt-14 md:mt-14">
      {/* Header */}
      <div className="flex justify-between items-end pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">Collectors</h2>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-mono">Scraper Studio custom collectors → CORA validates, detects drift & shadow-verifies repairs</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-3 py-1.5 text-[10px] font-medium font-mono rounded bg-[var(--color-cora)] hover:bg-[var(--color-cora-hover)] text-white transition-colors">
          + ADD
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1">
        {['ALL', 'HEALTHY', 'MUTATING', 'REPAIRING', 'DEGRADED'].map((st) => (
          <button key={st} onClick={() => setFilterStatus(st)} className={`px-2 py-1 rounded text-[9px] font-mono transition-all ${filterStatus === st ? 'neu-control-active' : 'neu-control'}`} style={{
            color: filterStatus === st ? 'var(--color-cora)' : 'var(--color-text-muted)',
          }}>
            {st} ({st === 'ALL' ? collectors.length : collectors.filter((c) => c.status === st).length})
          </button>
        ))}
      </div>

      {/* Main layout: list + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-1 max-h-[640px] overflow-y-auto pr-1">
          {filtered.map((c) => {
            const sc = statusStyle(c.status);
            return (
              <button key={c.id} onClick={() => setSelectedId(c.id)} className="w-full p-3 rounded border cursor-pointer transition-all text-left" style={{
                backgroundColor: selectedId === c.id ? 'var(--color-bg-hover)' : 'transparent',
                borderColor: selectedId === c.id ? 'var(--color-cora)' : 'var(--color-border-subtle)',
              }}>
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h3 className="text-[11px] font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                      {c.name}
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.active ? 'var(--color-success)' : 'var(--color-text-muted)' }} />
                    </h3>
                    <code className="text-[9px] text-[var(--color-text-muted)] font-mono block truncate mt-0.5">{c.targetDomain}</code>
                    <div className="text-[9px] font-mono text-[var(--color-text-secondary)] mt-1">Health: {c.healthScore}%</div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-medium border shrink-0" style={{ color: sc.color, backgroundColor: sc.bg, borderColor: sc.color }}>{c.status}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {selected && (
            <div className="p-5 rounded glass space-y-4">
              {/* Collector header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase tracking-[0.15em]">Collector</div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5">{selected.name}</h3>
                  <code className="text-[11px] font-mono text-[var(--color-cora)] mt-0.5 block">{selected.targetDomain}</code>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-medium border" style={{ color: 'var(--color-success)', backgroundColor: 'var(--color-success-muted)', borderColor: 'var(--color-success)' }}>
                    ACTIVE
                  </span>
                  <span className="text-[8px] font-mono font-medium px-2 py-0.5 rounded border" style={{ color: 'var(--color-brightdata)', backgroundColor: 'var(--color-brightdata-muted)', borderColor: 'var(--color-brightdata)' }}>
                    BRIGHT DATA
                  </span>
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
                {[
                  { l: 'RECORDS 24H', v: selected.itemsProcessed24h.toLocaleString(), c: 'var(--color-text-primary)' },
                  { l: 'HEALTH', v: `${selected.healthScore}%`, c: 'var(--color-success)' },
                  { l: 'LAST RUN', v: selected.lastAutoRepairTime, c: 'var(--color-cora)' },
                ].map((m) => (
                  <div key={m.l} className="p-2.5 rounded glass-light text-center">
                    <div className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-wider">{m.l}</div>
                    <div className="text-[11px] font-medium mt-0.5" style={{ color: m.c }}>{m.v}</div>
                  </div>
                ))}
              </div>

              {/* Active selector */}
              <div className="p-3 rounded glass-light space-y-2">
                <h4 className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase tracking-[0.15em] font-medium">Active Selector</h4>
                <code className="text-[11px] font-mono font-medium block text-[var(--color-cora)]">{selected.activeSelector}</code>
                <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono">
                  {[
                    { l: 'STRUCTURAL', s: 'HEALED', ok: true },
                    { l: 'SEMANTIC', s: 'MATCHED', ok: true },
                    { l: 'AI / VISUAL', s: 'STANDBY', ok: false },
                  ].map((r) => (
                    <div key={r.l} className="p-1.5 rounded border flex justify-between items-center text-[8px] font-medium" style={{
                      backgroundColor: r.ok ? 'var(--color-success-muted)' : 'var(--color-bg-secondary)',
                      borderColor: r.ok ? 'var(--color-success)' : 'var(--color-border-subtle)',
                      color: r.ok ? 'var(--color-success)' : 'var(--color-text-muted)',
                    }}>
                      <span>{r.l}</span><span>{r.s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleRunCollector(selected.id)}
                  disabled={running === selected.id}
                  className="px-3 py-1.5 rounded text-[10px] font-mono font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-cora)',
                    color: 'white',
                  }}
                >
                  {running === selected.id ? 'RUNNING...' : 'RUN COLLECTOR'}
                </button>
                <button onClick={() => onToggleActive(selected.id)} className="px-3 py-1.5 rounded text-[10px] font-mono font-medium border transition-colors" style={{
                  backgroundColor: selected.active ? 'var(--color-danger-muted)' : 'var(--color-success-muted)',
                  borderColor: selected.active ? 'var(--color-danger)' : 'var(--color-success)',
                  color: selected.active ? 'var(--color-danger)' : 'var(--color-success)',
                }}>
                  {selected.active ? 'PAUSE' : 'ACTIVATE'}
                </button>
              </div>

              {/* Run Result */}
              {runResult && (
                <div className="p-3 rounded glass-light space-y-2">
                  <h4 className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase tracking-[0.15em] font-medium">Last Run Result</h4>
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
                  {runResult.repair && (
                    <div className="text-[9px] font-mono p-1.5 rounded border" style={{ borderColor: 'var(--color-success)', backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success)' }}>
                      Self-healed: {runResult.repair.old_selector} → {runResult.repair.new_selector}
                    </div>
                  )}
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
