import { useState, useEffect } from 'react';
import { apiClient } from '../hooks';

interface NodeDetail {
  id: string;
  label: string;
  type: 'pattern' | 'site' | 'strategy';
  observed: string;
  success: string;
  confidence: string;
  recovery: string;
  description: string;
}

const nodePos = [
  { key: 'central', cx: 160, cy: 130, r: 22, label: 'AST' },
  { key: 'alpha', cx: 60, cy: 60, r: 15, label: 'A' },
  { key: 'beta', cx: 160, cy: 40, r: 15, label: 'B' },
  { key: 'gamma', cx: 260, cy: 60, r: 15, label: 'C' },
  { key: 'pattern', cx: 80, cy: 220, r: 15, label: 'PAT' },
  { key: 'strategy', cx: 240, cy: 220, r: 15, label: 'STR' },
];

const nodeColors: Record<string, string> = {
  pattern: 'var(--color-cora)',
  site: 'var(--color-success)',
  strategy: 'var(--color-info)',
};

const fallback: NodeDetail = { id: '#NA', label: 'No Data', type: 'pattern', observed: '0', success: '0', confidence: '0%', recovery: '0s', description: 'Run a collector to build mutation memory.' };

export const MemoryView = () => {
  const [memList, setMemList] = useState<NodeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    apiClient.getMemory()
      .then(setMemList)
      .catch(() => setMemList([]))
      .finally(() => setLoading(false));
  }, []);

  const selected = memList[selectedIdx] || fallback;

  return (
    <div className="space-y-6 animate-fadeIn mt-14 md:mt-14">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--color-border-subtle)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">Mutation Memory</h2>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-mono">CORA compiles structural change patterns into a learning network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Knowledge graph */}
        <div className="lg:col-span-3 p-5 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
          <h3 className="text-[9px] font-bold font-mono text-[var(--color-text-primary)] uppercase tracking-[0.12em] mb-4">Knowledge Graph</h3>
          <div className="w-full flex justify-center">
            <svg className="w-full max-w-[400px] h-[300px]" viewBox="0 0 320 300">
              {[
                ['160,130', '60,60'], ['160,130', '160,40'], ['160,130', '260,60'],
                ['160,130', '80,220'], ['160,130', '240,220'],
              ].map(([from, to], i) => (
                <line key={i} x1={from.split(',')[0]} y1={from.split(',')[1]} x2={to.split(',')[0]} y2={to.split(',')[1]} stroke="var(--color-border-default)" strokeWidth="1" opacity="0.6" />
              ))}

              {nodePos.map((n, i) => {
                const node = memList[i] || fallback;
                const color = nodeColors[node.type] || nodeColors.pattern;
                return (
                  <g key={n.key}>
                    <circle cx={n.cx} cy={n.cy} r={n.r} fill="var(--color-bg-secondary)" stroke={color} strokeWidth={i === 0 ? 2 : 1.5} className="cursor-pointer" onClick={() => setSelectedIdx(i)} style={{ filter: selectedIdx === i ? `drop-shadow(0 0 6px ${color})` : 'none' }} />
                    <text x={n.cx} y={n.cy + 3} fill="var(--color-text-primary)" fontSize={i === 0 ? 7 : 6} fontFamily="monospace" fontWeight="600" textAnchor="middle" pointerEvents="none">{n.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="text-[8px] font-mono text-[var(--color-text-muted)] text-center mt-2">Click nodes to inspect.</div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2 p-5 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
          {loading ? (
            <div className="text-[10px] font-mono text-[var(--color-text-muted)]">Loading memory…</div>
          ) : (
            <>
              <div className="flex justify-between items-start pb-3 mb-4 border-b border-[var(--color-border-subtle)]">
                <div>
                  <span className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase tracking-[0.15em] block">Node</span>
                  <h3 className="text-[11px] font-semibold font-mono text-[var(--color-text-primary)] uppercase mt-0.5">{selected.label}</h3>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded border text-[var(--color-cora)] border-[var(--color-cora)] bg-[var(--color-cora-muted)]">{selected.id}</span>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">{selected.description}</p>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--color-border-subtle)] font-mono text-[9px]">
                  {[
                    { l: 'Observed', v: selected.observed, c: 'var(--color-text-primary)' },
                    { l: 'Success', v: selected.success, c: 'var(--color-success)' },
                    { l: 'Confidence', v: selected.confidence, c: 'var(--color-cora)' },
                    { l: 'MTTR', v: selected.recovery, c: 'var(--color-text-primary)' },
                  ].map((m) => (
                    <div key={m.l}>
                      <span className="text-[var(--color-text-muted)] block text-[8px] uppercase tracking-wider">{m.l}</span>
                      <span className="font-medium" style={{ color: m.c }}>{m.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-2.5 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] text-[8px] font-mono text-[var(--color-text-muted)] leading-relaxed">
                Used to match mutations on similar hierarchies across domains.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
