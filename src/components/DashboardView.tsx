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

const STATUS_LABELS: Record<SystemState, { label: string; colorVar: string }> = {
  calm: { label: '● STABLE', colorVar: 'var(--sv-cyan)' },
  monitoring: { label: '◐ MONITORING', colorVar: 'rgb(129,140,248)' },
  mutation: { label: '⚠ MUTATION', colorVar: 'rgb(251,191,36)' },
  adapting: { label: '∇ ADAPTING', colorVar: 'var(--sv-cyan)' },
  recovering: { label: '↺ RECOVERING', colorVar: 'rgb(52,211,153)' },
};

const PIPELINE_STAGES: Array<{ key: string; label: string; stateKey: SystemState }> = [
  { key: 'detect', label: 'DETECT', stateKey: 'mutation' },
  { key: 'analyze', label: 'ANALYZE', stateKey: 'adapting' },
  { key: 'repair', label: 'REPAIR', stateKey: 'adapting' },
  { key: 'verify', label: 'VERIFY', stateKey: 'recovering' },
  { key: 'complete', label: 'COMPLETE', stateKey: 'recovering' },
];

export const DashboardView = ({
  metrics,
  incidents,
  onOpenDeployModal,
  onMutateWeb,
  pipelineActive,
  pipelineStage,
}: DashboardViewProps) => {
  const coreState = pipelineActive ? pipelineStage : 'calm';
  const activeStageIndex = PIPELINE_STAGES.findIndex((s) => s.stateKey === coreState);
  const statusInfo = STATUS_LABELS[coreState];

  return (
    <div className="relative mx-auto min-h-[calc(100vh-4.75rem)] w-full max-w-[1440px] pt-4 pb-10">
      {/* Hero: CoraCore — single viz (yagni: MiniDom+ExtractionOverlay removed) */}
      <div className="relative pt-8 pb-8 opacity-0 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <div className="scape-section-title justify-center mb-6">
          <span className="title-text">CORA System — Self-Healing Infrastructure</span>
        </div>
        <div className="flex justify-center mt-4">
          <CoraCore
            health={metrics.systemHealth}
            systemState={coreState}
            collectors={metrics.activeCollectors}
            records={metrics.totalRecords || 0}
            repairs={metrics.successfulRepairs24h}
            resilience={metrics.resilience || metrics.autoResolutionProgress || 0}
            onCoreClick={() => onOpenDeployModal()}
          />
        </div>
      </div>

      <div className="flex justify-center mb-8 opacity-0 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
        <div className="scape-pill" style={{ borderColor: `${statusInfo.colorVar}40`, color: statusInfo.colorVar }}>
          {statusInfo.label}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mb-10 opacity-0 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        <button
          onClick={onMutateWeb}
          disabled={pipelineActive}
          className={`scape-tap font-mono text-[0.55rem] font-bold uppercase tracking-[0.15em] ${pipelineActive ? 'scape-tap--danger scape-tap--active' : ''}`}
        >
          {pipelineActive ? 'MUTATION IN PROGRESS...' : 'MUTATE WEB'}
        </button>
        {pipelineActive && (
          <div className="flex items-center gap-1 mt-2">
            {PIPELINE_STAGES.map((stage, idx) => {
              const isReached = idx <= activeStageIndex;
              const isActive = idx === activeStageIndex;
              return (
                <Fragment key={stage.key}>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: isReached ? (stage.stateKey === 'mutation' ? 'rgb(251,191,36)' : stage.stateKey === 'recovering' ? 'rgb(52,211,153)' : 'rgb(0,230,181)') : 'rgba(255,255,255,0.15)',
                        boxShadow: isActive ? `0 0 12px ${isReached ? (stage.stateKey === 'mutation' ? 'rgb(251,191,36)' : stage.stateKey === 'recovering' ? 'rgb(52,211,153)' : 'rgb(0,230,181)') : 'transparent'}` : 'none',
                      }}
                    />
                    <span className="text-[0.5rem] font-mono mt-1" style={{ color: isReached ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', opacity: isReached ? 1 : 0.4 }}>
                      {stage.label}
                    </span>
                  </div>
                  {idx < PIPELINE_STAGES.length - 1 && (
                    <div className="w-6 h-0.5" style={{ background: isReached ? 'rgba(0,230,181,0.3)' : 'var(--sv-border-subtle)' }} />
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Incidents + resilience */}
      <div className="mb-6 opacity-0 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
        <div className="scape-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="scape-section-title mb-0"><span className="title-text">Recent Incidents</span></h3>
            <div className="scape-pill" style={{ color: 'var(--color-text-secondary)' }}>{incidents.filter(i => i.severity !== 'RESOLVED').length} ACTIVE</div>
          </div>
          <div className="space-y-1">
            {incidents.slice(0, 3).map((inc) => {
              const severityColor = inc.severity === 'CRITICAL' ? 'rgb(240,91,91)' : inc.severity === 'WARNING' ? 'rgb(251,191,36)' : inc.severity === 'RESOLVED' ? 'rgb(52,211,153)' : 'var(--color-text-secondary)';
              return (
                <div key={inc.id} className="scape-item group" style={{ borderColor: 'var(--sv-border-default)' }}>
                  <div className="flex gap-3 items-start">
                    <div className="font-mono text-[0.65rem] shrink-0 w-16" style={{ color: 'var(--color-text-secondary)' }}>{inc.timeAgo}</div>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: severityColor, boxShadow: `0 0 6px ${severityColor}80` }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.7rem] font-medium" style={{ color: 'var(--color-text-primary)' }}>{inc.title}</div>
                      <div className="text-[0.6rem] font-mono mt-px" style={{ color: 'var(--color-text-secondary)' }}>{inc.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--sv-border-subtle)' }}>
            <div>
              <span className="text-[0.6rem] font-mono uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-muted)' }}>Resilience Score</span>
              <div className="text-[0.7rem] font-mono mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{metrics.successfulRepairs24h} / {metrics.issuesDetected} mutations survived</div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold" style={{ color: 'rgb(0,230,181)' }}>{metrics.autoResolutionProgress}</span>
              <span className="text-[0.65rem] font-mono ml-1" style={{ color: 'var(--color-text-muted)' }}>/ 100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
