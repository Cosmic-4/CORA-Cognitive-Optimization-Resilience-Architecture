import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [autoRepair, setAutoRepair] = useState(true);
  const [sensitivity, setSensitivity] = useState('High');
  const [confidence, setConfidence] = useState(85);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay">
      <div className="rounded glass-heavy p-5 w-full max-w-md animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[var(--color-cora)]">settings</span>
            <h3 className="text-[12px] font-semibold text-[var(--color-text-primary)]">Settings</h3>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <div className="space-y-4 text-[11px]">
          {/* Auto-repair toggle */}
          <div className="flex justify-between items-center p-3 rounded neu-control">
            <div>
              <div className="font-medium text-[var(--color-text-primary)] text-[11px]">Autonomous Self-Healing</div>
              <div className="text-[9px] text-[var(--color-text-muted)]">Auto-apply selector repairs</div>
            </div>
            <button
              onClick={() => setAutoRepair(!autoRepair)}
              className="w-9 h-5 rounded-full transition-colors relative cursor-pointer"
              style={{ backgroundColor: autoRepair ? 'var(--color-cora)' : 'var(--color-bg-hover)' }}
            >
              <div
                className="w-3.5 h-3.5 rounded-full absolute top-0.5 transition-transform"
                style={{
                  backgroundColor: autoRepair ? '#fff' : 'var(--color-text-muted)',
                  transform: autoRepair ? 'translateX(18px)' : 'translateX(2px)',
                }}
              />
            </button>
          </div>

          {/* Sensitivity */}
          <div>
            <label className="block text-[9px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Sensitivity</label>
            <select
              value={sensitivity}
              onChange={(e) => setSensitivity(e.target.value)}
              className="w-full rounded px-3 py-2 text-[var(--color-text-primary)] text-[11px] focus:outline-none border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] focus:border-[var(--color-cora)] transition-colors"
            >
              <option value="High">High (Instant Auto-Repair)</option>
              <option value="Medium">Medium (3 Retries)</option>
              <option value="Conservative">Conservative (Manual Approval)</option>
            </select>
          </div>

          {/* Confidence threshold */}
          <div>
            <div className="flex justify-between text-[9px] font-mono text-[var(--color-text-muted)] mb-1.5">
              <span>Min AI Confidence</span>
              <span className="font-medium text-[var(--color-cora)]">{confidence}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: 'var(--color-cora)' }}
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-[var(--color-border-subtle)]">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-[10px] font-medium rounded bg-[var(--color-cora)] text-white hover:bg-[var(--color-cora-hover)] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
