import { useState, useEffect } from 'react';
import { MissionBuilder } from './MissionBuilder';
import { apiClient } from '../hooks';

interface Mission {
  id?: string;
  name: string;
  status: 'ACTIVE' | 'DRIFT';
  records: string;
  health: number;
  repairs: number;
  purpose: string;
  target: string;
  collector: string;
  fields: string[];
  lastRun: string;
  resilience: number;
}

export const MissionsView = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    apiClient.getMissions()
      .then(setMissions)
      .catch(() => setMissions([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = (data: any) => {
    apiClient.createMission({
      name: data.intent.split(' ')[0] + ' Tracker',
      purpose: data.intent,
      target: data.targetUrl,
      collector: 'C-' + Math.floor(Math.random() * 899999 + 10000).toString(16).toUpperCase(),
      fields: data.fields || ['product_name'],
    })
      .then(() => apiClient.getMissions())
      .then(setMissions)
      .catch(() => {})
      .finally(() => setIsCreating(false));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this mission?')) return;
    apiClient.deleteMission(id)
      .then(() => apiClient.getMissions())
      .then(setMissions)
      .catch(() => {});
  };

  return (
    <div className="space-y-5 animate-fadeIn mt-14 md:mt-14">
      {/* Header */}
      <div className="flex justify-between items-end pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">Missions</h2>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-mono">Build and manage resilient scraping contracts.</p>
        </div>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="px-3 py-1.5 text-[10px] font-medium font-mono rounded bg-[var(--color-cora)] hover:bg-[var(--color-cora-hover)] text-white transition-colors">
            + NEW
          </button>
        )}
      </div>

      {isCreating ? (
        <MissionBuilder onClose={() => setIsCreating(false)} onComplete={handleCreate} />
      ) : loading ? (
        <div className="p-4 text-[11px] font-mono text-[var(--color-text-muted)]">Loading missions…</div>
      ) : (
        <div className="space-y-1">
          {missions.map((m, idx) => (
            <div key={m.id || idx} className="p-4 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[12px] text-[var(--color-text-primary)] flex items-center gap-2">
                    {m.name}
                    <span className="text-[8px] font-mono text-[var(--color-text-muted)]">({m.collector})</span>
                  </h3>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{m.purpose}</p>
                  <div className="flex gap-3 pt-1 font-mono text-[8px] text-[var(--color-text-muted)]">
                    <span>Records: <strong className="text-[var(--color-text-secondary)]">{m.records}</strong></span>
                    <span>Repairs: <strong className="text-[var(--color-text-secondary)]">{m.repairs}</strong></span>
                    <span>Last: <strong className="text-[var(--color-text-secondary)]">{m.lastRun}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-start md:self-auto">
                  <div className="text-right">
                    <span className="text-[7px] font-mono text-[var(--color-text-muted)] uppercase block tracking-wider">Resilience</span>
                    <span className="text-[11px] font-medium font-mono" style={{ color: 'var(--color-cora)' }}>{m.resilience}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-medium border" style={{
                    color: m.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)',
                    backgroundColor: m.status === 'ACTIVE' ? 'var(--color-success-muted)' : 'var(--color-danger-muted)',
                    borderColor: m.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)',
                  }}>
                    {m.status}
                  </span>
                  {m.id && (
                    <button onClick={() => handleDelete(m.id!)} className="px-2 py-0.5 rounded text-[8px] font-mono font-medium border transition-colors" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)', backgroundColor: 'var(--color-danger-muted)' }}>
                      DEL
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
