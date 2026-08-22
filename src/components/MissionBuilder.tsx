import { useState } from 'react';

interface MissionBuilderProps {
  onClose: () => void;
  onComplete: (missionData: any) => void;
}

export const MissionBuilder = ({ onClose, onComplete }: MissionBuilderProps) => {
  const [intent, setIntent] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>(['price']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim() || !targetUrl.trim()) return;
    onComplete({ id: `mission-${Date.now()}`, intent, targetUrl, fields: selectedFields, createdAt: new Date().toISOString() });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)]">New Mission</h3>
        <button type="button" onClick={onClose} className="text-[9px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">✕</button>
      </div>

      <div>
        <label className="block text-[9px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Intent — what to monitor</label>
        <input value={intent} onChange={(e) => setIntent(e.target.value)} required placeholder="e.g. Track GPU pricing across stores" className="w-full p-2.5 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-[11px] font-mono focus:outline-none focus:border-[var(--color-cora)]" />
      </div>

      <div>
        <label className="block text-[9px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Target URL</label>
        <input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} required placeholder="https://example.com/products" className="w-full p-2.5 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-[11px] font-mono focus:outline-none focus:border-[var(--color-cora)]" />
      </div>

      <div>
        <label className="block text-[9px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Fields to extract</label>
        <div className="grid grid-cols-2 gap-2">
          {['price', 'name', 'stock', 'availability'].map((f) => (
            <label key={f} className="flex items-center gap-2 px-3 py-2 rounded border cursor-pointer text-[10px] font-mono" style={{ backgroundColor: selectedFields.includes(f) ? 'var(--color-cora-muted)' : 'var(--color-bg-primary)', borderColor: selectedFields.includes(f) ? 'var(--color-cora)' : 'var(--color-border-subtle)', color: selectedFields.includes(f) ? 'var(--color-cora)' : 'var(--color-text-muted)' }}>
              <input type="checkbox" checked={selectedFields.includes(f)} onChange={() => setSelectedFields((p) => p.includes(f) ? p.filter((x) => x !== f) : [...p, f])} />
              <span className="capitalize">{f}</span>
            </label>
          ))}
        </div>
        <p className="text-[9px] font-mono text-[var(--color-text-muted)] mt-1.5">Contracts auto-generated from selected fields.</p>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
        <button type="button" onClick={onClose} className="px-3 py-1.5 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">Cancel</button>
        <button type="submit" className="px-4 py-1.5 text-[10px] font-medium font-mono rounded bg-[var(--color-cora)] text-white hover:bg-[var(--color-cora-hover)]">CREATE MISSION</button>
      </div>
    </form>
  );
};
