import { useState, useEffect } from 'react';
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

export const DataExplorerView = () => {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    apiClient.getCollectors()
      .then((cs) => cs[0]?.id)
      .then((cid) => cid ? apiClient.getData(cid) : Promise.resolve([]))
      .then((data: ProductRecord[]) => { setProducts(data); setSelectedId(data[0]?.id || ''); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const selected = products.find((p) => p.id === selectedId) || products[0];

  return (
    <div className="space-y-6 animate-fadeIn mt-14 md:mt-14">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--color-border-subtle)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">Data Explorer</h2>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-mono">Inspect extracted payloads with trust metrics and provenance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Table */}
        <div className="lg:col-span-3 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] overflow-hidden">
          <table className="w-full text-left text-[9px] font-mono">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]">
                <th className="px-4 py-2.5 font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Product</th>
                <th className="px-4 py-2.5 font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Price</th>
                <th className="px-4 py-2.5 font-medium text-[var(--color-text-muted)] uppercase tracking-wider text-right">Trust</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-[10px] font-mono text-[var(--color-text-muted)]">Loading data…</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-[10px] font-mono text-[var(--color-text-muted)]">No extracted records yet. Run a collector.</td></tr>
              ) : (
                products.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className="cursor-pointer transition-colors border-b border-[var(--color-border-subtle)] last:border-b-0"
                  style={{ backgroundColor: selectedId === p.id ? 'var(--color-bg-hover)' : 'transparent' }}
                >
                  <td className="px-4 py-3 text-[var(--color-text-primary)] font-medium text-[11px]">{p.product}</td>
                  <td className="px-4 py-3 text-[var(--color-cora)] font-medium">{p.price}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.trust >= 99 ? 'var(--color-success)' : 'var(--color-warning)' }} />
                      <span className="font-medium text-[var(--color-text-primary)]">{p.trust}%</span>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Provenance */}
        <div className="lg:col-span-2 p-4 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
          <div className="pb-3 mb-4 border-b border-[var(--color-border-subtle)]">
            <span className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase tracking-[0.15em] block">Audit Diagnostic</span>
            <h3 className="text-[11px] font-semibold text-[var(--color-text-primary)] uppercase mt-0.5">Data Provenance</h3>
          </div>
          <div className="space-y-2.5 font-mono text-[9px]">
            <div>
              <span className="text-[var(--color-text-muted)] block text-[8px] uppercase tracking-wider">Value</span>
              <strong className="text-sm text-[var(--color-text-primary)]">{selected.price}</strong>
            </div>
            {[
              { l: 'Source', v: selected.collector },
              { l: 'Contract', v: selected.contractStatus, c: 'var(--color-success)' },
              { l: 'Rule', v: selected.selectorUsed, c: 'var(--color-cora)' },
              { l: 'Verified', v: selected.lastVerified },
              { l: 'Confidence', v: `${selected.trust}%`, c: 'var(--color-success)' },
            ].map((item) => (
              <div key={item.l} className="flex justify-between py-1.5 border-t border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-muted)] uppercase">{item.l}</span>
                <span className="font-medium" style={{ color: item.c || 'var(--color-text-primary)' }}>{item.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
