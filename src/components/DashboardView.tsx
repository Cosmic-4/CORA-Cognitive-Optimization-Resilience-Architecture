import { Fragment } from 'react';
import { SystemMetrics, Incident } from '../types';
import { SystemState } from './CoraCore';
import CoraCore from './CoraCore';

interface DashboardViewProps {
  metrics: SystemMetrics;
  incidents: Incident[];
  onOpenDeployModal: () => void;
  onResolveIncident: (id: string) => void;
  onMutateWeb: () => void;
  pipelineActive: boolean;
  pipelineStage: 'mutation' | 'adapting' | 'recovering';
}

const STATUS_LABELS: Record<SystemState, { label: string; color: string }> = {
  calm: { label: '● Stable', color: '#34D399' },
  monitoring: { label: '◐ Monitoring', color: '#818CF8' },
  mutation: { label: '⚠ Mutation', color: '#FBBF24' },
  adapting: { label: '◍ Adapting', color: '#0EA293' },
  recovering: { label: '↺ Recovering', color: '#34D399' },
};

const PIPELINE_STAGES: Array<{ key: string; label: string; stateKey: SystemState }> = [
  { key: 'detect', label: 'Detect', stateKey: 'mutation' },
  { key: 'analyze', label: 'Analyze', stateKey: 'adapting' },
  { key: 'repair', label: 'Repair', stateKey: 'adapting' },
  { key: 'verify', label: 'Verify', stateKey: 'recovering' },
  { key: 'complete', label: 'Complete', stateKey: 'recovering' },
];

export const DashboardView = ({ metrics, incidents, onOpenDeployModal, onMutateWeb, pipelineActive, pipelineStage }: DashboardViewProps) => {
  const coreState = pipelineActive ? pipelineStage : 'calm';
  const activeStageIndex = PIPELINE_STAGES.findIndex((s) => s.stateKey === coreState);
  const statusInfo = STATUS_LABELS[coreState as SystemState];

  return (
    <div className="mx-auto w-full max-w-[1160px] pb-10">
      {/* Header — Apple: 48px title, 15px subtitle */}
      <div className="pt-2 pb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">Overview</h1>
          <span className="hidden md:inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[12px] font-medium border" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: statusInfo.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusInfo.color }} />{statusInfo.label}
          </span>
        </div>
        <p className="text-[14px] leading-relaxed mt-1.5 max-w-[560px]" style={{ color: 'var(--color-text-secondary)' }}>
          Self-healing data infrastructure — collectors, mutations & repairs, verified in real time.
        </p>
      </div>

      {/* Hero */}
      <div className="flex justify-center py-6">
        <CoraCore
          health={metrics.systemHealth}
          systemState={coreState as SystemState}
          collectors={metrics.activeCollectors}
          records={metrics.totalRecords || 0}
          repairs={metrics.successfulRepairs24h}
          resilience={metrics.resilience || metrics.autoResolutionProgress || 0}
          onCoreClick={() => onOpenDeployModal()}
        />
      </div>

      {/* Mutate action — Apple: 44px pill, generous */}
      <div className="flex flex-col items-center gap-5 mt-2 mb-10">
        <button
          onClick={onMutateWeb}
          disabled={pipelineActive}
          className={`inline-flex items-center justify-center gap-2 px-7 h-[44px] rounded-full text-[14px] font-semibold tracking-[-0.01em] transition-all shadow-sm border ${pipelineActive ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] cursor-wait' : 'bg-[var(--color-text-primary)] text-[var(--color-bg-base)] border-[var(--color-text-primary)] hover:opacity-[0.92] active:scale-[0.98] shadow-[0_2px_8px_rgba(0,0,0,0.12)]'}`}>
          <span className={`material-symbols-outlined text-[18px] ${pipelineActive ? 'animate-spin' : ''}`}>{pipelineActive ? 'progress_activity' : 'bolt'}</span>
          {pipelineActive ? 'Mutation in progress…' : 'Mutate Web — Run Chaos Test'}
        </button>
        {pipelineActive && (
          <div className="flex items-center gap-2 mt-1">
            {PIPELINE_STAGES.map((stage, idx) => {
              const isReached = idx <= activeStageIndex;
              const isActive = idx === activeStageIndex;
              return (
                <Fragment key={stage.key}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full transition-all ${isActive ? 'scale-125' : ''}`} style={{ background: isReached ? (stage.stateKey === 'mutation' ? '#FBBF24' : stage.stateKey === 'recovering' ? '#34D399' : '#0EA293') : 'var(--color-border-strong)', boxShadow: isActive ? `0 0 10px ${stage.stateKey === 'mutation' ? '#FBBF24' : stage.stateKey === 'recovering' ? '#34D399' : '#0EA293'}60` : 'none' }} />
                    <span className="text-[11px] font-medium tracking-wide" style={{ color: isReached ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>{stage.label}</span>
                  </div>
                  {idx < PIPELINE_STAGES.length - 1 && <div className="w-8 h-px mb-5" style={{ background: isReached ? 'var(--color-border-strong)' : 'var(--color-border-subtle)' }} />}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid — Linear: 2-col incidents + resilience */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-[18px] p-6" style={{ background: 'var(--color-bg-elevated)', border: '0.5px solid var(--color-border-subtle)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[13px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Recent Incidents</h3>
            <span className="text-[12px] font-medium px-2.5 py-1 rounded-full border" style={{ background: incidents.filter(i => i.severity !== 'RESOLVED').length ? 'var(--color-warning-muted)' : 'var(--color-success-muted)', borderColor: incidents.filter(i => i.severity !== 'RESOLVED').length ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.2)', color: incidents.filter(i => i.severity !== 'RESOLVED').length ? 'var(--color-warning)' : 'var(--color-success)' }}>
              {incidents.filter(i => i.severity !== 'RESOLVED').length} active
            </span>
          </div>
          <div className="space-y-3">
            {incidents.slice(0, 3).map((inc) => {
              const severityColor = inc.severity === 'CRITICAL' ? '#EF4444' : inc.severity === 'WARNING' ? '#F59E0B' : inc.severity === 'RESOLVED' ? '#10B981' : '#6B7280';
              return (
                <div key={inc.id} className="group flex gap-4 p-4 rounded-xl border hover:shadow-sm transition-all" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)' }}>
                  <span className="text-[12px] font-mono tabular-nums shrink-0 w-[64px] pt-0.5" style={{ color: 'var(--color-text-muted)' }}>{inc.timeAgo}</span>
                  <span className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: severityColor, boxShadow: `0 0 8px ${severityColor}40` }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium leading-tight" style={{ color: 'var(--color-text-primary)' }}>{inc.title}</div>
                    <div className="text-[13px] leading-relaxed mt-1" style={{ color: 'var(--color-text-secondary)' }}>{inc.description}</div>
                  </div>
                </div>
              );
            })}
            {incidents.length === 0 && <div className="text-[13px] py-8 text-center rounded-xl border border-dashed" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border-subtle)', background: 'var(--color-bg-secondary)' }}>No incidents — system stable</div>}
          </div>
        </div>

        <div className="rounded-[18px] p-6 flex flex-col" style={{ background: 'var(--color-bg-elevated)', border: '0.5px solid var(--color-border-subtle)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)' }}>
          <h3 className="text-[13px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Resilience</h3>
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <span className="text-[56px] font-bold tracking-[-0.04em] leading-none tabular-nums" style={{ color: 'var(--color-cora)' }}>{metrics.autoResolutionProgress}</span>
            <span className="text-[13px] font-medium tracking-wide mt-1" style={{ color: 'var(--color-text-muted)' }}>/ 100 — {metrics.successfulRepairs24h} / {Math.max(1, metrics.issuesDetected)} survived</span>
            <div className="w-full h-2 rounded-full mt-6 overflow-hidden" style={{ background: 'var(--color-bg-secondary)', border: '0.5px solid var(--color-border-subtle)' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${metrics.autoResolutionProgress}%`, background: 'var(--color-cora)' }} />
            </div>
          </div>
          <div className="pt-4 mt-2 flex items-center justify-between text-[12px] border-t" style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}>
            <span>Auto-resolution</span><span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{metrics.dataIntegrity}% integrity</span>
          </div>
        </div>
      </div>
    </div>
  );
};
