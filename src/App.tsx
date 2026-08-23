import { useState, useEffect, useCallback, useRef } from 'react';
import { NavTab, SystemMetrics, Incident, CollectorNode } from './types';
import { useTheme, apiClient, authClient, mapCollector, useWebSocket, type CoraEvent } from './hooks';
import { animate } from 'animejs';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CollectorsView } from './components/CollectorsView';
import { MissionsView } from './components/MissionsView';
import { MutationCenterView } from './components/MutationCenterView';
import { ResilienceLabView } from './components/ResilienceLabView';
import { MemoryView } from './components/MemoryView';
import { DataExplorerView } from './components/DataExplorerView';
import { AIIntelligenceView } from './components/AIIntelligenceView';
import { DeployRepairModal } from './components/DeployRepairModal';
import { SettingsModal } from './components/SettingsModal';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginView } from './components/LoginView';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { ToastContainer } from './components/ToastContainer';
import { AIChatView } from './components/AIChatView';
import { LiveTerminalView } from './components/LiveTerminalView';

function AppInner() {
  const { theme, setTheme } = useTheme();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [metrics, setMetrics] = useState<SystemMetrics>({
    systemHealth: 0, systemHealthChange: 0, dataIntegrity: 0,
    activeCollectors: 0, issuesDetected: 0, successfulRepairs24h: 0,
    autoResolutionProgress: 0, totalRecords: 0, resilience: 0,
  });
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [collectors, setCollectors] = useState<CollectorNode[]>([]);
  const [bdMode, setBdMode] = useState<'mock' | 'live'>('mock');
  const [recordCount, setRecordCount] = useState<number>(0);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; username: string; display_name: string; role: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [pipelineActive, setPipelineActive] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<'mutation' | 'adapting' | 'recovering'>('mutation');
  const mainRef = useRef<HTMLElement>(null);

  // Check existing session on mount
  useEffect(() => {
    if (authClient.isLoggedIn()) {
      authClient.me()
        .then((u) => { setUser(u); setAuthChecked(true); })
        .catch(() => { authClient.logout(); setAuthChecked(true); });
    } else {
      setAuthChecked(true);
    }
  }, []);

  // Fetch real metrics + collectors + health from backend on mount
  useEffect(() => {
    if (!user) return;
    apiClient.getHealth()
      .then((h) => setBdMode(h.mock_mode ? 'mock' : 'live'))
      .catch(() => {});

    apiClient.getMetrics()
      .then((m) => {
        setMetrics({
          systemHealth: m.systemHealth,
          systemHealthChange: m.systemHealthChange,
          dataIntegrity: m.dataIntegrity,
          activeCollectors: m.activeCollectors,
          issuesDetected: m.issuesDetected,
          successfulRepairs24h: m.successfulRepairs24h,
          autoResolutionProgress: m.autoResolutionProgress,
          totalRecords: m.totalRecords,
          resilience: m.resilience,
        });
        setRecordCount(m.totalRecords);
      })
      .catch(() => {});

    apiClient.getCollectors()
      .then((apiCollectors) => setCollectors(apiCollectors.map(mapCollector)))
      .catch(() => {});

    apiClient.getEvents()
      .then((events) => {
        if (events.length > 0) {
          const mapped: Incident[] = events.slice(0, 3).map((e: any) => ({
            id: e.id, title: e.message, severity: e.type === 'success' ? 'RESOLVED' : e.type === 'warning' ? 'WARNING' : e.type === 'danger' ? 'CRITICAL' : 'INFO',
            node: e.detail?.split(' — ')[0] || e.detail || 'Unknown',
            timeAgo: e.time || 'Just now', timestamp: new Date().toISOString(),
            description: e.detail || e.message,
          }));
          setIncidents(mapped);
        } else {
          setIncidents([]);
        }
      })
      .catch(() => {});
  }, [user]);

  // WebSocket for real-time events — memoized to avoid reconnect loops (ponytail: single handler ref)
  const handleWsEvent = useCallback((event: CoraEvent) => {
    if (event.event === 'mutation.detected' || event.event === 'anomaly.detected') {
      setPipelineActive(true);
      setPipelineStage('mutation');
    }
    if (event.event === 'repair.started' || event.event === 'candidate.found' || event.event === 'shadow.completed') {
      setPipelineActive(true);
      setPipelineStage('adapting');
    }
    if (event.event === 'repair.promoted') {
      setPipelineStage('recovering');
      setMetrics((prev) => ({
        ...prev,
        systemHealth: Math.min(100, prev.systemHealth + 1),
        issuesDetected: Math.max(0, prev.issuesDetected - 1),
        successfulRepairs24h: prev.successfulRepairs24h + 1,
      }));
      addNotification({ title: 'Repair Promoted', message: `Selector updated for ${event.collector_id || 'collector'}`, type: 'success' });
    }
    if (event.event === 'anomaly.detected') {
      setMetrics((prev) => ({ ...prev, issuesDetected: prev.issuesDetected + 1 }));
      addNotification({ title: 'Anomaly Detected', message: `${event.data?.type || 'Unknown'} on ${event.collector_id || 'collector'}`, type: 'warning' });
    }
    if (event.event === 'collector.completed' && event.collector_id) {
      setCollectors((prev) =>
        prev.map((c) => (c.id === event.collector_id ? { ...c, status: 'HEALTHY', healthScore: 100 } : c))
      );
      setPipelineActive(false);
      // Refresh metrics after run
      apiClient.getMetrics().then((m) => {
        setMetrics({
          systemHealth: m.systemHealth, systemHealthChange: m.systemHealthChange,
          dataIntegrity: m.dataIntegrity, activeCollectors: m.activeCollectors,
          issuesDetected: m.issuesDetected, successfulRepairs24h: m.successfulRepairs24h,
          autoResolutionProgress: m.autoResolutionProgress, totalRecords: m.totalRecords, resilience: m.resilience,
        });
        setRecordCount(m.totalRecords);
      }).catch(()=>{});
      addNotification({ title: 'Collector Completed', message: `${event.collector_id} — ${event.data?.record_count || 0} records`, type: 'info' });
    }
    if (event.event === 'repair.rejected') {
      addNotification({ title: 'Repair Rejected', message: `Candidate failed shadow test for ${event.collector_id || 'collector'}`, type: 'error' });
    }
  }, [addNotification]);

  useWebSocket(handleWsEvent);

  // anime: page transition on tab change
  useEffect(() => {
    if (!mainRef.current) return;
    animate(mainRef.current, { opacity: [0, 1], translateY: [10, 0], duration: 380, ease: 'outExpo' });
  }, [activeTab]);

  const handleMutateWeb = useCallback(async () => {
    setPipelineActive(true);
    setPipelineStage('mutation');
    try {
      const result = await apiClient.runDemoPipeline();
      const { pipeline, collector } = result;
      addNotification({ title: 'Mutation Detected', message: `Mutation pipeline triggered: ${pipeline.mutation}`, type: 'warning' });
      if (pipeline.repair) {
        setCollectors((prev) => prev.map((c) => c.id === collector.id ? { ...mapCollector(collector), status: 'HEALTHY', healthScore: 100 } : c));
        addNotification({ title: 'Repair Promoted', message: `${pipeline.repair.old_selector} → ${pipeline.repair.new_selector}`, type: 'success' });
      }
      // Refresh metrics from backend (real data)
      const m = await apiClient.getMetrics();
      setMetrics({
        systemHealth: m.systemHealth, systemHealthChange: m.systemHealthChange,
        dataIntegrity: m.dataIntegrity, activeCollectors: m.activeCollectors,
        issuesDetected: m.issuesDetected, successfulRepairs24h: m.successfulRepairs24h,
        autoResolutionProgress: m.autoResolutionProgress, totalRecords: m.totalRecords, resilience: m.resilience,
      });
      setRecordCount(m.totalRecords);
    } catch (err: any) {
      addNotification({ title: 'Pipeline Error', message: err.message || 'Demo pipeline failed', type: 'error' });
    } finally {
      setTimeout(() => setPipelineActive(false), 2800);
    }
  }, [addNotification]);

  const handleToggleCollectorActive = (id: string) => {
    setCollectors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleUpdateCollector = (updated: CollectorNode) => {
    setCollectors((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleAddCollector = (newCol: CollectorNode) => {
    setCollectors((prev) => [newCol, ...prev]);
    setMetrics((prev) => ({ ...prev, activeCollectors: prev.activeCollectors + 1 }));
  };

  const handleLogout = async () => {
    await authClient.logout();
    setUser(null);
  };

  if (!authChecked) return null;
  if (!user) return <LoginView onLogin={setUser} />;

  const handleSuccessRepair = (targetNode: string) => {
    setMetrics((prev) => ({
      ...prev,
      systemHealth: 99,
      issuesDetected: Math.max(0, prev.issuesDetected - 1),
      successfulRepairs24h: prev.successfulRepairs24h + 1,
    }));

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.node === targetNode ? { ...inc, severity: 'RESOLVED' } : inc
      )
    );
  };

  const handleInjectChaos = (scenario: string, nodeName: string) => {
    setMetrics((prev) => ({
      ...prev,
      issuesDetected: prev.issuesDetected + 1,
    }));

    const newInc: Incident = {
      id: `inc-${Date.now()}`,
      title: `Chaos Simulation: ${scenario}`,
      severity: 'WARNING',
      node: nodeName,
      timeAgo: 'Just now',
      timestamp: new Date().toLocaleString(),
      description: `Chaos experiment '${scenario}' injected into node '${nodeName}'. Self-healing auto-resolving...`,
    };

    setIncidents((prev) => [newInc, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex flex-col md:flex-row font-[var(--font-sans)]">
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSettingsModal={() => setSettingsModalOpen(true)}
          systemHealth={metrics.systemHealth}
          onLogout={handleLogout}
          userName={user.display_name}
          bdMode={bdMode}
          collectorCount={collectors.filter(c => c.active).length}
          recordCount={recordCount}
        />

      <main ref={mainRef} className="w-full min-h-screen px-5 pt-[68px] pb-8 md:ml-[248px] md:w-[calc(100%-248px)] md:px-10 md:pt-[76px] md:pb-10" style={{ background: 'var(--color-bg-primary)' }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            incidents={incidents}
            bdMode={bdMode}
            onOpenDeployModal={() => setDeployModalOpen(true)}
            onResolveIncident={(id) =>
              setIncidents((prev) =>
                prev.map((i) => (i.id === id ? { ...i, severity: 'RESOLVED' } : i))
              )
            }
            onMutateWeb={handleMutateWeb}
            pipelineActive={pipelineActive}
            pipelineStage={pipelineStage}
          />
        )}

        {activeTab === 'collectors' && (
          <CollectorsView
            collectors={collectors}
            onToggleActive={handleToggleCollectorActive}
            onAddCollector={handleAddCollector}
            onUpdateCollector={handleUpdateCollector}
          />
        )}

        {activeTab === 'missions' && <MissionsView />}
        {activeTab === 'mutation-center' && <MutationCenterView />}
        {activeTab === 'resilience-lab' && <ResilienceLabView onInjectChaos={handleInjectChaos} />}
        {activeTab === 'ai-intelligence' && <AIIntelligenceView />}
        {activeTab === 'memory' && <MemoryView />}
        {activeTab === 'ai-chat' && <AIChatView />}
        {activeTab === 'terminal' && <LiveTerminalView />}
        {activeTab === 'data-explorer' && <DataExplorerView bdMode={bdMode} />}
      </main>

      <DeployRepairModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        onSuccessRepair={handleSuccessRepair}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppInner />
    </NotificationProvider>
  );
}
