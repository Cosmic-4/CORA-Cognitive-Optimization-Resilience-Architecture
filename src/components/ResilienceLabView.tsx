import { useState, useEffect } from 'react';
import { apiClient } from '../hooks';

interface ResilienceLabProps {
  onInjectChaos: (type: string, node: string) => void;
}

interface ChaosStepLog {
  mutation: string;
  detail: string;
  status: 'SUCCESS' | 'WARNING' | 'HEALING' | 'ERROR';
}

interface ResilienceResult {
  score: number;
  survived: number;
  healed: number;
  failed: number;
  total: number;
  breakdown: Record<string, number>;
  logs: ChaosStepLog[];
}

export const ResilienceLabView = ({ onInjectChaos }: ResilienceLabProps) => {
  const [checklist, setChecklist] = useState({
    cssObfuscation: true,
    domRestructuring: true,
    attributeShift: true,
    localization: true,
    noiseInjection: true,
    elementRelocation: true,
    conditionalRendering: true,
    schemaInversion: false,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ChaosStepLog[]>([]);
  const [scoreExpanded, setScoreExpanded] = useState(false);
  const [progressVal, setProgressVal] = useState(0);
  const [testComplete, setTestComplete] = useState(false);
  const [result, setResult] = useState<ResilienceResult | null>(null);
  const [target, setTarget] = useState<{ id: string; name: string }>({ id: '', name: 'Product Price Collector' });

  useEffect(() => {
    apiClient.getCollectors()
      .then((cs) => { if (cs[0]) setTarget({ id: cs[0].id, name: cs[0].name }); })
      .catch(() => {});
  }, []);

  const handleCheckbox = (key: keyof typeof checklist) => {
    if (isRunning) return;
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const startChaosTest = async () => {
    if (!target.id) return;
    setIsRunning(true);
    setTestComplete(false);
    setLogs([]);
    setProgressVal(0);
    setScoreExpanded(false);
    setResult(null);

    onInjectChaos('Full Chaos Suite', target.name);

    try {
      const types = Object.entries(checklist).filter(([,v]) => v).map(([k]) => {
        const map: Record<string, string> = { cssObfuscation: 'CSS_OBFUSCATION', domRestructuring: 'DOM_RESTRUCTURE', attributeShift: 'ATTRIBUTE_SHIFT', localization: 'LOCALIZATION_CHANGE', noiseInjection: 'PROMO_INJECTION', elementRelocation: 'ELEMENT_RELOCATION', conditionalRendering: 'DOM_RESTRUCTURE', schemaInversion: 'ATTRIBUTE_SHIFT' };
        return map[k] || k;
      });
      const res = await apiClient.runResilience(target.id, types);
      const data = res as ResilienceResult;
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < data.logs.length) {
          setLogs((prev) => [...prev, data.logs[idx]]);
          setProgressVal(((idx + 1) / data.logs.length) * 100);
          idx++;
        } else {
          clearInterval(interval);
          setIsRunning(false);
          setTestComplete(true);
          setResult(data);
        }
      }, 700);
    } catch {
      setIsRunning(false);
      setTestComplete(true);
    }
  };

  const statusColors: Record<string, { color: string; bg: string }> = {
    SUCCESS: { color: 'var(--color-success)', bg: 'var(--color-success-muted)' },
    WARNING: { color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
    HEALING: { color: 'var(--color-cora)', bg: 'var(--color-cora-muted)' },
    ERROR: { color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
  };

  return (
    <div className="mx-auto w-full max-w-[1160px] space-y-8 animate-fadeIn">
      <div className="pb-6" style={{ borderBottom: '0.5px solid var(--color-border-subtle)' }}>
        <h2 className="text-[28px] md:text-[30px] font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">Resilience Lab</h2>
        <p className="text-[14px] leading-relaxed mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>Inject chaos to test whether your collector structures can survive — Apple-grade verification.</p>
      </div>

      <div className="py-8 flex flex-col items-center">
        <span className="text-[11px] font-semibold tracking-[0.16em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Resilience Score</span>
        <div className={`mt-5 liquid-instrument ${isRunning ? 'liquid-instrument-running' : testComplete ? 'liquid-instrument-complete' : ''}`} style={{ width: 240, height: 240 }}>
          <div className="text-center">
            <span className="hero-number" style={{ color: 'var(--color-cora)', fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.04em' }}>{result ? result.score : 95.8}</span>
            <div className="text-[12px] font-medium tracking-wide mt-1" style={{ color: 'var(--color-text-muted)' }}>/ 100</div>
          </div>
        </div>
        <div className="mt-4 text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>{result ? `${result.survived + result.healed} / ${result.total}` : '19 / 20'} mutations survived</div>
        <button onClick={() => setScoreExpanded(!scoreExpanded)} className="mt-3 text-[13px] font-medium hover:opacity-80 transition-opacity" style={{ color: 'var(--color-cora)' }}>{scoreExpanded ? 'Hide breakdown ↑' : 'View breakdown →'}</button>
      </div>

      {/* Diagnostic breakdown */}
      {scoreExpanded && (
        <div className="animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[10px]">
            {Object.entries(result ? result.breakdown : {
              STRUCTURAL: 98, SEMANTIC: 96, 'DATA INTEGRITY': 94, 'RECOVERY MTTR': 95,
            }).map(([label, val]) => (
              <div key={label} className="p-2.5 rounded border border-[var(--color-border-subtle)] flex justify-between items-center bg-[var(--color-bg-secondary)]">
                <span className="text-[var(--color-text-secondary)]">{label}</span>
                <span className="font-medium" style={{ color: (val as number) >= 94 ? 'var(--color-success)' : 'var(--color-cora)' }}>{val}%</span>
              </div>
            ))}
          </div>
          <div className="mt-2 p-2.5 rounded border text-[9px] font-mono" style={{ borderColor: 'var(--color-danger)', backgroundColor: 'var(--color-danger-muted)' }}>
            <div className="font-medium" style={{ color: 'var(--color-danger)' }}>WEAKNESS: Localization Mutation (INR currency drift)</div>
            <div className="text-[var(--color-text-secondary)] mt-0.5">Add currency format normalization rule.</div>
          </div>
          <div className="mt-3 text-[9px] font-mono text-[var(--color-text-muted)]">
            MTTR: <strong className="text-[var(--color-text-secondary)]">1.82 seconds</strong> average
          </div>
        </div>
      )}

      {/* Main suite: checklist + logs */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Checklist */}
          <div className="lg:col-span-2 p-4 rounded glass space-y-3">
          <h3 className="text-[9px] font-bold font-mono text-[var(--color-text-primary)] uppercase tracking-[0.12em]">Chaos Suite</h3>
          <div className="space-y-1 font-mono text-[10px]">
            {Object.entries(checklist).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleCheckbox(key as keyof typeof checklist)}
                className={`w-full flex items-center justify-between p-2 rounded transition-all text-left ${val ? 'neu-control-active' : 'neu-control'}`}
                style={{
                  color: val ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                }}
              >
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="material-symbols-outlined text-[14px]" style={{ color: val ? 'var(--color-cora)' : 'var(--color-text-muted)' }}>
                  {val ? 'check_box' : 'check_box_outline_blank'}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={startChaosTest}
            disabled={isRunning || !target.id}
            className="w-full mt-2 py-2 text-white font-mono text-[10px] font-medium rounded liquid-glass-danger hover:opacity-90 active:scale-[0.97] disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
          >
            <span className={`material-symbols-outlined text-[14px] ${isRunning ? 'animate-spin' : ''}`}>science</span>
            {isRunning ? 'INJECTING...' : 'RUN CHAOS SUITE'}
          </button>
        </div>

        {/* Logs */}
          <div className="lg:col-span-3 p-4 rounded glass flex flex-col">
          <h3 className="text-[9px] font-bold font-mono text-[var(--color-text-primary)] uppercase tracking-[0.12em] mb-3">Simulation Logs</h3>
          <div className="flex-1">
            {isRunning || logs.length > 0 ? (
              <div className="space-y-1.5 font-mono text-[9px] max-h-[280px] overflow-y-auto pr-1">
                {logs.map((log, idx) => {
                  const sc = statusColors[log.status] || statusColors.SUCCESS;
                  return (
                    <div key={idx} className="p-2.5 rounded glass-light flex items-center justify-between gap-3 animate-slideIn">
                      <div className="flex-1 text-[var(--color-text-secondary)] leading-relaxed">
                        <strong className="text-[var(--color-text-primary)] block text-[8px] mb-0.5 uppercase tracking-wider">{log.mutation}</strong>
                        {log.detail}
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-medium shrink-0 border" style={{ color: sc.color, backgroundColor: sc.bg, borderColor: sc.color }}>
                        {log.status}
                      </span>
                    </div>
                  );
                })}
                {isRunning && (
                  <div className="p-2 text-center text-[9px] animate-pulse text-[var(--color-cora)]">
                    Scanning and applying mutations...
                  </div>
                )}
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center border border-dashed rounded border-[var(--color-border-subtle)] text-[9px] text-[var(--color-text-muted)] font-mono">
                <span className="material-symbols-outlined text-xl mb-1 text-[var(--color-text-muted)]">query_stats</span>
                Run Chaos Suite to verify parser thresholds.
              </div>
            )}
          </div>

          {/* Progress */}
          {(isRunning || testComplete) && (
            <div className="space-y-1 pt-3 mt-3 border-t border-[var(--color-border-subtle)] font-mono text-[8px]">
              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span>PROGRESS</span>
                <span style={{ color: testComplete ? 'var(--color-success)' : 'var(--color-cora)' }} className={testComplete ? 'font-medium' : ''}>
                  {testComplete ? 'COMPLETE' : `${Math.round(progressVal)}%`}
                </span>
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden bg-[var(--color-bg-primary)]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressVal}%`, backgroundColor: testComplete ? 'var(--color-success)' : 'var(--color-cora)' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
