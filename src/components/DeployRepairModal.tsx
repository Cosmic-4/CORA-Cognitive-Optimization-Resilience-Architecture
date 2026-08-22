import { useState } from 'react';

interface DeployRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRepair: (nodeName: string) => void;
}

export const DeployRepairModal = ({ isOpen, onClose, onSuccessRepair }: DeployRepairModalProps) => {
  const [selectedTarget, setSelectedTarget] = useState('US-East-Cluster-1');
  const [strategy, setStrategy] = useState('DOM Resampling & Selector Re-indexing');
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleStartRepair = () => {
    setIsExecuting(true);
    setProgress(0);
    setLogs(['[09:32:01] Initiating pipeline repair...']);
    setCompleted(false);

    setTimeout(() => { setProgress(25); setLogs((p) => [...p, '[09:32:02] Freezing corrupted worker...']); }, 600);
    setTimeout(() => { setProgress(60); setLogs((p) => [...p, '[09:32:03] Running AI selector synthesis...']); }, 1400);
    setTimeout(() => { setProgress(90); setLogs((p) => [...p, '[09:32:04] Applying patch...']); }, 2200);
    setTimeout(() => {
      setProgress(100);
      setLogs((p) => [...p, '[09:32:05] Repair complete. Health restored.']);
      setIsExecuting(false);
      setCompleted(true);
      onSuccessRepair(selectedTarget);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay">
      <div className="rounded glass-heavy p-5 w-full max-w-md animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[var(--color-cora)]">build</span>
            <h3 className="text-[12px] font-semibold text-[var(--color-text-primary)]">Deploy Repair</h3>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {!isExecuting && !completed ? (
          <div className="space-y-2.5 text-[11px]">
            <div>
              <label className="block text-[9px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Target</label>
              <select value={selectedTarget} onChange={(e) => setSelectedTarget(e.target.value)} className="w-full rounded px-3 py-2 text-[var(--color-text-primary)] text-[11px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] focus:outline-none focus:border-[var(--color-cora)] transition-colors">
                <option>US-East-Cluster-1</option>
                <option>Alpha-Shop</option>
                <option>Beta-Parser-V2</option>
                <option>ALL_NODES</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Strategy</label>
              <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="w-full rounded px-3 py-2 text-[var(--color-text-primary)] text-[11px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] focus:outline-none focus:border-[var(--color-cora)] transition-colors">
                <option>DOM Resampling & Selector Re-indexing</option>
                <option>Headless Session Reset</option>
                <option>AI Schema Coercion</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2.5 border-t border-[var(--color-border-subtle)]">
              <button onClick={onClose} className="px-3 py-1.5 rounded text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">Cancel</button>
              <button onClick={handleStartRepair} className="px-3.5 py-1.5 text-[10px] font-medium rounded bg-[var(--color-cora)] text-white hover:bg-[var(--color-cora-hover)] transition-colors">Execute</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-[var(--color-text-secondary)]">Status</span>
              <span className="font-medium text-[var(--color-cora)]">{progress}%</span>
            </div>
            <div className="w-full h-1 rounded-full overflow-hidden bg-[var(--color-bg-primary)]">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: completed ? 'var(--color-success)' : 'var(--color-cora)' }} />
            </div>
            <div className="p-2.5 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] font-mono text-[9px] text-[var(--color-cora)] space-y-0.5 h-32 overflow-y-auto">
              {logs.map((l, i) => <div key={i}>{l}</div>)}
            </div>
            {completed && (
              <button onClick={onClose} className="w-full py-2 text-[10px] font-medium rounded bg-[var(--color-cora)] text-white hover:bg-[var(--color-cora-hover)] transition-colors">Done</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
