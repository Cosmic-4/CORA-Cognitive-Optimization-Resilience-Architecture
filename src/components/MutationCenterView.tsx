import { useState, useEffect, Fragment } from 'react';
import { apiClient } from '../hooks';

interface MutationEvent {
  id: string;
  time: string;
  type: string;
  collector: string;
  field: string;
  status: 'DETECTED' | 'REPAIRED' | 'VERIFIED' | 'HEALED';
  beforeDom: string;
  afterDom: string;
  mutationPath: string[];
  currentSelector: string;
  proposedSelector: string;
  recordsTested: number;
  contractPassed: number;
  coverage: number;
  duplicateRate: number;
  confidence: number;
  versionBefore: string;
  versionAfter: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const isOk = status === 'VERIFIED' || status === 'HEALED';
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[8px] font-mono font-medium border"
      style={{
        color: isOk ? 'var(--color-success)' : 'var(--color-cora)',
        backgroundColor: isOk ? 'var(--color-success-muted)' : 'var(--color-cora-muted)',
        borderColor: isOk ? 'var(--color-success)' : 'var(--color-cora)',
      }}
    >
      {status}
    </span>
  );
};

export const MutationCenterView = () => {
  const [mutations, setMutations] = useState<MutationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  const [promotedAlert, setPromotedAlert] = useState<{ active: boolean; collector: string; version: string } | null>(null);

  useEffect(() => {
    apiClient.getMutations()
      .then((data) => { setMutations(data); setSelectedId(data[0]?.id || ''); })
      .catch(() => setMutations([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedEvent = mutations.find((m) => m.id === selectedId) || mutations[0];

  const handlePromote = async (evt: MutationEvent) => {
    try {
      await apiClient.promoteMutation(evt.id);
      setPromotedAlert({
        active: true,
        collector: evt.collector,
        version: `${evt.versionBefore} → ${evt.versionAfter}`,
      });
      setTimeout(() => setPromotedAlert(null), 4000);
      apiClient.getMutations().then(setMutations).catch(() => {});
    } catch (err) {
      console.error('Promote failed:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn mt-14 md:mt-14">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--color-border-subtle)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">Mutation Centre</h2>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-mono">The web changed. CORA noticed. Audit HTML shifts, attribute deformations, and semantic drift.</p>
      </div>

      {/* Promotion alert */}
      {promotedAlert?.active && (
        <div className="p-2.5 rounded border flex items-center gap-2.5 font-mono text-[10px] animate-slideIn" style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)', backgroundColor: 'var(--color-success-muted)' }}>
          <span className="material-symbols-outlined text-[14px]">verified</span>
          <div>
            <strong>REPAIR PROMOTED</strong>
            <span className="ml-2 text-[var(--color-text-primary)]">{promotedAlert.collector} ({promotedAlert.version})</span>
          </div>
        </div>
      )}

      {/* Main: timeline + inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-1.5">
          <div className="text-[8px] font-mono text-[var(--color-text-muted)] tracking-[0.15em] uppercase font-medium px-0.5">
            Timeline
          </div>
          {loading ? (
            <div className="p-3 text-[10px] font-mono text-[var(--color-text-muted)]">Loading mutations…</div>
          ) : mutations.length === 0 ? (
            <div className="p-3 text-[10px] font-mono text-[var(--color-text-muted)]">No mutations detected yet. Run a collector to trigger self-healing.</div>
          ) : (
            mutations.map((evt) => {
            const isSelected = selectedId === evt.id;
            return (
              <button
                key={evt.id}
                onClick={() => setSelectedId(evt.id)}
                className="w-full p-3 rounded border cursor-pointer transition-all text-left"
                style={{
                  backgroundColor: isSelected ? 'var(--color-bg-hover)' : 'transparent',
                  borderColor: isSelected ? 'var(--color-cora)' : 'var(--color-border-subtle)',
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-mono text-[var(--color-text-muted)]">{evt.time}</span>
                  <StatusBadge status={evt.status} />
                </div>
                <h4 className="text-[11px] font-medium text-[var(--color-text-primary)] font-mono">{evt.type}</h4>
                <div className="flex justify-between text-[9px] font-mono text-[var(--color-text-muted)] mt-1">
                  <span>{evt.collector}</span>
                  <span>{evt.field}</span>
                </div>
              </button>
            );
          })
          )}
        </div>

        {/* Inspector */}
        <div className="lg:col-span-3">
          {selectedEvent && (
            <div className="p-5 rounded glass space-y-4">
              {/* Inspector header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[10px] font-medium font-mono text-[var(--color-text-muted)] uppercase tracking-[0.1em]">Mutation Inspector</h3>
                  <p className="text-[11px] text-[var(--color-text-secondary)] font-mono mt-0.5">
                    {selectedEvent.collector}.{selectedEvent.field}
                  </p>
                </div>
                <div className="text-[9px] font-mono px-2 py-1 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]">
                  <span className="text-[var(--color-text-muted)]">VERSION </span>
                  <span className="font-medium text-[var(--color-cora)]">
                    {selectedEvent.versionBefore} → {selectedEvent.versionAfter}
                  </span>
                </div>
              </div>

              {/* BEFORE → AFTER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono uppercase tracking-[0.15em] block font-medium" style={{ color: 'var(--color-danger)' }}>Before</span>
                  <pre className="p-3 rounded glass-stable text-[9px] font-mono overflow-x-auto h-24 leading-relaxed" style={{ color: 'var(--color-danger)' }}>
                    {selectedEvent.beforeDom}
                  </pre>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-mono uppercase tracking-[0.15em] block font-medium" style={{ color: 'var(--color-success)' }}>After</span>
                  <pre className="p-3 rounded glass-repaired text-[9px] font-mono overflow-x-auto h-24 leading-relaxed" style={{ color: 'var(--color-success)' }}>
                    {selectedEvent.afterDom}
                  </pre>
                </div>
              </div>

              {/* Mutation pathway */}
              <div className="p-2.5 rounded glass-mutation text-center">
                <span className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase tracking-[0.15em] block mb-2">Mutation Pathway</span>
                <div className="flex flex-wrap items-center justify-center gap-1 font-mono text-[9px]">
                  {selectedEvent.mutationPath.map((step, idx) => (
                    <Fragment key={idx}>
                      <span className="px-2 py-0.5 rounded font-medium text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]">
                        {step}
                      </span>
                      {idx < selectedEvent.mutationPath.length - 1 && (
                        <span className="text-[var(--color-cora)]">→</span>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>

              {/* Selectors + Shadow Test */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded glass-light">
                <div className="space-y-1.5 font-mono text-[9px]">
                  <span className="text-[var(--color-text-muted)] uppercase tracking-[0.1em] block text-[8px] font-medium">Selectors</span>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">CURRENT</span>
                    <code className="font-medium text-[var(--color-danger)]">{selectedEvent.currentSelector}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">PROPOSED</span>
                    <code className="font-medium text-[var(--color-cora)]">{selectedEvent.proposedSelector}</code>
                  </div>
                </div>
                <div className="space-y-1.5 font-mono text-[9px]">
                  <span className="text-[var(--color-text-muted)] uppercase tracking-[0.1em] block text-[8px] font-medium">Shadow Test</span>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {[
                      { label: 'TESTED', val: selectedEvent.recordsTested.toLocaleString(), color: 'var(--color-text-primary)' },
                      { label: 'PASSED', val: selectedEvent.contractPassed.toLocaleString(), color: 'var(--color-success)' },
                      { label: 'COVERAGE', val: `${selectedEvent.coverage}%`, color: 'var(--color-text-primary)' },
                      { label: 'DUPLICATES', val: `${selectedEvent.duplicateRate}%`, color: 'var(--color-text-primary)' },
                    ].map((m) => (
                      <div key={m.label} className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">{m.label}</span>
                        <span className="font-medium" style={{ color: m.color }}>{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-1">
                <div className="flex gap-3 items-center font-mono text-[9px]">
                  <div>
                    <span className="text-[var(--color-text-muted)] block uppercase text-[8px]">Layer 1 (AST)</span>
                    <span className="font-medium text-[var(--color-danger)]">FAILED</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block uppercase text-[8px]">Layer 2 (Semantic)</span>
                    <span className="font-medium text-[var(--color-success)]">MATCHED ({selectedEvent.confidence}%)</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded font-medium uppercase text-[8px] border" style={{ color: 'var(--color-success)', backgroundColor: 'var(--color-success-muted)', borderColor: 'var(--color-success)' }}>
                    SHADOW PASS
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button className="px-3 py-1.5 rounded text-[10px] font-mono font-medium border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    REJECT
                  </button>
                  <button
                    onClick={() => handlePromote(selectedEvent)}
                    className="px-3.5 py-1.5 text-[10px] font-mono font-medium rounded bg-[var(--color-cora)] text-white hover:bg-[var(--color-cora-hover)] active:scale-[0.97] transition-all"
                  >
                    {selectedEvent.status === 'VERIFIED' ? 'PROMOTED' : 'PROMOTE TO PROD'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
