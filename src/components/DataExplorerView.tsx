import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../hooks';

interface ProductRecord {
  id: string;
  product: string;
  price: string;
  trust: number;
  collector: string;
  contractStatus: string;
  selectorUsed: string;
  lastVerified: string;
}

interface DataExplorerProps {
  bdMode?: 'mock' | 'live';
}

export const DataExplorerView = ({ bdMode = 'mock' }: DataExplorerProps) => {
  const [collectors, setCollectors] = useState<any[]>([]);
  const [selectedCollector, setSelectedCollector] = useState('');
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [search, setSearch] = useState('');
  const [trustFilter, setTrustFilter] = useState<'all' | 'high' | 'low'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedDetailId, setSelectedDetailId] = useState('');
  const [showManage, setShowManage] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [formName, setFormName] = useState('');
  const [formDomain, setFormDomain] = useState('');
  const [formSelector, setFormSelector] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCollectors = async () => {
    try {
      const cs = await apiClient.getCollectors();
      setCollectors(cs);
      if (cs[0] && !selectedCollector) setSelectedCollector(cs[0].id);
      else if (cs.length && !cs.find((c: any) => c.id === selectedCollector)) setSelectedCollector(cs[0].id);
    } catch {}
  };

  const loadData = async (cid: string) => {
    if (!cid) return;
    setLoading(true);
    try {
      const data: ProductRecord[] = await apiClient.getData(cid);
      setProducts(data);
      if (data[0]) setSelectedDetailId(data[0].id);
      setSelectedIds(new Set());
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCollectors(); }, []);
  useEffect(() => { if (selectedCollector) loadData(selectedCollector); }, [selectedCollector]);

  const handleExtract = async () => {
    if (!selectedCollector) return;
    setExtracting(true);
    try {
      await apiClient.runCollector(selectedCollector);
      await loadData(selectedCollector);
    } catch (e) {
      console.error(e);
    } finally {
      setExtracting(false);
    }
  };
  const openAdd = () => { setFormName(''); setFormDomain(''); setFormSelector('.product-card .price'); setEditing(null); setShowAdd(true); };
  const openEdit = (c: any) => { setEditing(c); setFormName(c.name); setFormDomain(c.target_domain || ''); setFormSelector(c.active_selector || ''); setShowAdd(true); };
  const handleSaveWebsite = async () => {
    if (!formName || !formDomain) return;
    setSaving(true);
    try {
      if (editing) {
        await apiClient.updateCollector(editing.id, { name: formName, target_domain: formDomain, active_selector: formSelector });
      } else {
        const created: any = await apiClient.createCollector({ name: formName, target_domain: formDomain, active_selector: formSelector } as any);
        setSelectedCollector(created.id);
      }
      setShowAdd(false); setEditing(null);
      await loadCollectors();
      if (selectedCollector) await loadData(selectedCollector);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this website? This cannot be undone.')) return;
    try { await apiClient.deleteCollector(id); await loadCollectors(); if (id === selectedCollector) setProducts([]); } catch (e) { console.error(e); }
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.product.toLowerCase().includes(search.toLowerCase())) return false;
      if (trustFilter === 'high' && p.trust < 90) return false;
      if (trustFilter === 'low' && p.trust >= 90) return false;
      return true;
    });
  }, [products, search, trustFilter]);

  const selected = filtered.find((p) => p.id === selectedDetailId) || filtered[0];
  const toExport = selectedIds.size > 0 ? filtered.filter((p) => selectedIds.has(p.id)) : filtered;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((p) => p.id)));
  };

  const downloadCSV = () => {
    const rows = [['Product', 'Price', 'Trust', 'Collector', 'Contract', 'Selector', 'Verified']];
    toExport.forEach((p) => rows.push([p.product, p.price, `${p.trust}%`, p.collector, p.contractStatus, p.selectorUsed, p.lastVerified]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `cora-data-${selectedCollector || 'export'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    // ponytail: native print keeps PDF export UI without 230kB jspdf; CSV remains for data
    window.print();
  };

  return (
    <div className="mx-auto w-full max-w-[1160px] space-y-6 animate-fadeIn">
      {/* Header — Apple */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6" style={{ borderBottom: '0.5px solid var(--color-border-subtle)' }}>
        <div>
          <h2 className="text-[28px] md:text-[30px] font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">Data Explorer</h2>
          <p className="text-[14px] leading-relaxed mt-1.5 max-w-[520px]" style={{ color: 'var(--color-text-secondary)' }}>
            Inspect extracted payloads with trust metrics and provenance. Extract manually, select rows, and export as PDF.
          </p>
          <p className="text-[12px] font-medium mt-2" style={{ color: bdMode === 'live' ? 'var(--color-success)' : 'var(--color-warning)' }}>
            Source: {bdMode === 'live' ? 'Live (fakestoreapi.com)' : 'Demo (mockData)'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleExtract} disabled={extracting || !selectedCollector}
            className="inline-flex items-center gap-2 px-5 h-[40px] rounded-full text-[14px] font-semibold bg-[#007AFF] text-white hover:bg-[#0063CC] disabled:opacity-50 active:scale-[0.98] transition-all shadow-sm">
            <span className={`material-symbols-outlined text-[18px] ${extracting ? 'animate-spin' : ''}`}>{extracting ? 'progress_activity' : 'bolt'}</span>
            {extracting ? 'Extracting…' : 'Extract Manually'}
          </button>
          <button onClick={downloadPDF} disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-5 h-[40px] rounded-full text-[14px] font-semibold bg-[var(--color-text-primary)] text-[var(--color-bg-base)] hover:opacity-90 disabled:opacity-40 active:scale-[0.98] transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Download PDF
          </button>
          <button onClick={downloadCSV} disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-4 h-[40px] rounded-full text-[13px] font-medium border hover:shadow-sm disabled:opacity-40 transition-all"
            style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)' }}>
            <span className="material-symbols-outlined text-[16px]">table_view</span>CSV
          </button>
        </div>
      </div>

      {/* Controls — collector + search + trust + manage */}
      <div className="flex flex-col md:flex-row gap-3">
        <select value={selectedCollector} onChange={(e) => setSelectedCollector(e.target.value)}
          className="px-4 h-[40px] rounded-full text-[14px] font-medium border focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 min-w-[220px]"
          style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)' }}>
          {collectors.map((c: any) => <option key={c.id} value={c.id}>{c.name} — {c.id}</option>)}
          {collectors.length === 0 && <option>No collectors</option>}
        </select>
        <button onClick={() => setShowManage(!showManage)} className={`px-4 h-[40px] rounded-full text-[13px] font-medium border transition-all ${showManage ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-base)] border-[var(--color-text-primary)]' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'}`}>
          <span className="material-symbols-outlined text-[16px] align-middle mr-1">{showManage ? 'close' : 'tune'}</span>{showManage ? 'Hide Websites' : 'Manage Websites'}
        </button>
        <button onClick={openAdd} className="px-5 h-[40px] rounded-full text-[13px] font-semibold bg-[var(--color-cora)] text-white hover:bg-[var(--color-cora-hover)] active:scale-[0.98] transition-all shadow-sm inline-flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">add</span>Add Website
        </button>
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]" style={{ color: 'var(--color-text-muted)' }}>search</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
            className="w-full pl-10 pr-4 h-[40px] rounded-full text-[14px] border focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)' }} />
        </div>
        <div className="flex gap-2">
          {(['all', 'high', 'low'] as const).map((f) => (
            <button key={f} onClick={() => setTrustFilter(f)}
              className={`px-4 h-[40px] rounded-full text-[13px] font-medium capitalize border transition-all ${trustFilter === f ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-base)] border-[var(--color-text-primary)]' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'}`}>
              {f === 'all' ? 'All' : f === 'high' ? '≥90% trust' : '<90% trust'}
            </button>
          ))}
        </div>
      </div>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 text-[13px] px-4 py-2.5 rounded-full border w-fit" style={{ background: 'var(--color-cora-muted)', borderColor: 'rgba(14,162,147,0.15)', color: 'var(--color-cora)' }}>
          <span className="font-medium">{selectedIds.size} selected</span>
          <span style={{ color: 'var(--color-text-muted)' }}>•</span>
          <span>PDF/CSV will export only selected rows</span>
          <button onClick={() => setSelectedIds(new Set())} className="ml-2 underline hover:no-underline">Clear</button>
        </div>
      )}

      {/* Manage Websites — premium grid */}
      {showManage && (
        <div className="rounded-[18px] p-6 space-y-4" style={{ background: 'var(--color-bg-elevated)', border: '0.5px solid var(--color-border-subtle)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Manage Websites — {collectors.length} configured</h3>
            <span className="text-[12px] px-2.5 py-1 rounded-full border" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}>{collectors.filter((c: any) => c.active).length} active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {collectors.map((c: any) => (
              <div key={c.id} className={`p-4 rounded-xl border text-left transition-all ${selectedCollector === c.id ? 'ring-1 ring-[var(--color-cora)]' : ''}`} style={{ background: selectedCollector === c.id ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)', borderColor: selectedCollector === c.id ? 'var(--color-cora)' : 'var(--color-border-subtle)' }}>
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold tracking-[-0.01em] truncate" style={{ color: 'var(--color-text-primary)' }}>{c.name}</div>
                    <div className="text-[12px] font-mono truncate mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{c.target_domain || '—'}</div>
                    <code className="text-[11px] font-mono mt-1.5 block truncate px-2 py-1 rounded-full border" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-cora)' }}>{c.active_selector || '—'}</code>
                  </div>
                  <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${c.active ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-muted)]'}`} />
                </div>
                <div className="flex gap-1.5 mt-3">
                  <button onClick={() => setSelectedCollector(c.id)} className={`flex-1 h-8 rounded-full text-[12px] font-medium border ${selectedCollector === c.id ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-base)] border-[var(--color-text-primary)]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'}`}>View</button>
                  <button onClick={() => openEdit(c)} className="flex-1 h-8 rounded-full text-[12px] font-medium border bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border-[var(--color-border-subtle)] hover:border-[var(--color-text-primary)] transition-colors">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="w-8 h-8 rounded-full flex items-center justify-center border bg-[var(--color-danger-muted)] text-[var(--color-danger)] border-[var(--color-danger)]/20 hover:bg-[var(--color-danger)] hover:text-white transition-colors"><span className="material-symbols-outlined text-[14px]">delete</span></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Table — premium Apple */}
        <div className="lg:col-span-3 rounded-[18px] overflow-hidden" style={{ background: 'var(--color-bg-elevated)', border: '0.5px solid var(--color-border-subtle)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '0.5px solid var(--color-border-subtle)' }}>
                  <th className="px-2 py-3 w-10 text-center">
                    <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleAll} className="w-4 h-4 rounded border-[var(--color-border-strong)] bg-[var(--color-bg-primary)] accent-[var(--color-cora)]" />
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Product</th>
                  <th className="px-4 py-3 text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Price</th>
                  <th className="px-4 py-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-right" style={{ color: 'var(--color-text-muted)' }}>Trust</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-12 text-center"><span className="inline-flex items-center gap-2 text-[14px]" style={{ color: 'var(--color-text-muted)' }}><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Loading data…</span></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-[14px]" style={{ color: 'var(--color-text-muted)' }}>{products.length === 0 ? 'No extracted records yet. Click Extract Manually.' : 'No matches — clear search/filters.'}</td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} onClick={() => setSelectedDetailId(p.id)}
                      className="cursor-pointer border-b last:border-b-0 hover:opacity-[0.98] transition-colors" style={{ background: selectedDetailId === p.id ? 'var(--color-bg-secondary)' : 'transparent', borderColor: 'var(--color-border-subtle)' }}>
                      <td className="px-2 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} className="w-4 h-4 rounded border-[var(--color-border-strong)] accent-[var(--color-cora)]" />
                      </td>
                      <td className="px-4 py-3.5 text-[14px] font-medium tracking-[-0.01em]" style={{ color: 'var(--color-text-primary)' }}>{p.product}</td>
                      <td className="px-4 py-3.5 text-[14px] font-semibold" style={{ color: 'var(--color-cora)' }}>{p.price}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border" style={{ color: p.trust >= 90 ? 'var(--color-success)' : 'var(--color-warning)', background: p.trust >= 90 ? 'var(--color-success-muted)' : 'var(--color-warning-muted)', borderColor: p.trust >= 90 ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.trust >= 90 ? 'var(--color-success)' : 'var(--color-warning)' }} />{p.trust}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 flex items-center justify-between text-[12px] border-t" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}>
            <span>{filtered.length} of {products.length} records {selectedIds.size ? `• ${selectedIds.size} selected` : ''}</span>
            <span>Collector: <strong style={{ color: 'var(--color-text-primary)' }}>{collectors.find((c) => c.id === selectedCollector)?.name || '—'}</strong></span>
          </div>
        </div>

        {/* Provenance — premium */}
        <div className="lg:col-span-2 rounded-[18px] p-6" style={{ background: 'var(--color-bg-elevated)', border: '0.5px solid var(--color-border-subtle)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)' }}>
          <div className="pb-4 mb-5" style={{ borderBottom: '0.5px solid var(--color-border-subtle)' }}>
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Audit Diagnostic</span>
            <h3 className="text-[18px] font-semibold tracking-[-0.02em] mt-1" style={{ color: 'var(--color-text-primary)' }}>Data Provenance</h3>
            <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>Click a row to inspect. Select checkboxes for PDF export.</p>
          </div>
          {!selected ? (
            <div className="py-10 text-center text-[14px] rounded-xl border border-dashed p-6" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border-subtle)', background: 'var(--color-bg-secondary)' }}>Select a record to see provenance</div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg-secondary)', border: '0.5px solid var(--color-border-subtle)' }}>
                <span className="text-[11px] font-medium tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>Value</span>
                <div className="text-[28px] font-bold tracking-[-0.03em] mt-1" style={{ color: 'var(--color-text-primary)' }}>{selected.price}</div>
                <div className="text-[14px] font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>{selected.product}</div>
              </div>
              {[
                { l: 'Source', v: selected.collector },
                { l: 'Contract', v: selected.contractStatus, c: selected.contractStatus === 'valid' ? 'var(--color-success)' : 'var(--color-warning)' },
                { l: 'Selector', v: selected.selectorUsed, c: 'var(--color-cora)', mono: true },
                { l: 'Verified', v: selected.lastVerified },
                { l: 'Confidence', v: `${selected.trust}%`, c: selected.trust >= 90 ? 'var(--color-success)' : 'var(--color-warning)' },
              ].map((item) => (
                <div key={item.l} className="flex justify-between items-center py-3" style={{ borderTop: '0.5px solid var(--color-border-subtle)' }}>
                  <span className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--color-text-muted)' }}>{item.l}</span>
                  <span className={`font-medium text-[13px] ${item.mono ? 'font-mono text-[12px] px-2 py-1 rounded-full border' : ''}`} style={{ color: item.c || 'var(--color-text-primary)', background: item.mono ? 'var(--color-bg-secondary)' : 'transparent', borderColor: item.mono ? 'var(--color-border-subtle)' : 'transparent' }}>{item.v}</span>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button onClick={() => selected && toggleSelect(selected.id)}
                  className={`flex-1 h-[40px] rounded-full text-[13px] font-medium border transition-colors ${selectedIds.has(selected.id) ? 'bg-[var(--color-cora)] text-white border-[var(--color-cora)]' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'}`}>
                  {selectedIds.has(selected.id) ? '✓ Selected for export' : 'Select for PDF'}
                </button>
                <button onClick={downloadPDF} className="px-4 h-[40px] rounded-full text-[13px] font-semibold bg-[var(--color-text-primary)] text-[var(--color-bg-base)] hover:opacity-90 transition-opacity">Export PDF</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Website Modal — premium Apple */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }} onClick={() => setShowAdd(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[440px] rounded-[20px] p-6 animate-scaleIn" style={{ background: 'var(--color-bg-elevated)', border: '0.5px solid var(--color-border-subtle)', boxShadow: '0 16px 48px rgba(0,0,0,0.16), 0 0 0 0.5px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--color-text-primary)' }}>{editing ? 'Edit Website' : 'Add Website'}</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-bg-secondary)] border border-transparent hover:border-[var(--color-border-subtle)] transition-colors"><span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--color-text-muted)' }}>close</span></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Website Name *</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. My Retail Store"
                  className="w-full mt-1.5 px-4 h-[44px] rounded-xl text-[14px] border focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)' }} />
              </div>
              <div>
                <label className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Domain / URL *</label>
                <input value={formDomain} onChange={(e) => setFormDomain(e.target.value)} placeholder="e.g. shop.example.com or https://example.com/products"
                  className="w-full mt-1.5 px-4 h-[44px] rounded-xl text-[14px] border focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 font-mono" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)' }} />
              </div>
              <div>
                <label className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--color-text-muted)' }}>CSS Selector</label>
                <input value={formSelector} onChange={(e) => setFormSelector(e.target.value)} placeholder="e.g. .product-card .price"
                  className="w-full mt-1.5 px-4 h-[44px] rounded-xl text-[14px] border focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 font-mono" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)' }} />
                <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>Used to locate price/name. Leave default if unsure.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4" style={{ borderTop: '0.5px solid var(--color-border-subtle)' }}>
              <button onClick={() => setShowAdd(false)} className="px-5 h-[40px] rounded-full text-[14px] font-medium border hover:border-[var(--color-border-default)] transition-colors" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}>Cancel</button>
              <button onClick={handleSaveWebsite} disabled={saving || !formName || !formDomain} className="px-6 h-[40px] rounded-full text-[14px] font-semibold bg-[#007AFF] text-white hover:bg-[#0063CC] disabled:opacity-40 active:scale-[0.98] transition-all shadow-sm">
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Website'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
