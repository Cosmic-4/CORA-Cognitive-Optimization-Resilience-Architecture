import { useState, useRef, useEffect } from 'react';
import { apiClient } from '../hooks';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const SUGGESTIONS = [
  "What's the overall health of my collectors?",
  "Which mutations have been detected recently?",
  "Show me the memory entries with highest success rates",
  "Why might a collector be degraded?",
  "What repair strategies have worked best?",
  "Summarize my system status",
];

export function AIChatView() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "I'm CORA AI. Ask me anything about your scraping system — health, mutations, repairs, or recommendations.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', content: msg, time: now }]);
    setLoading(true);
    try {
      const res = await apiClient.chatAI(msg);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error reaching Gemini API. Check that GEMINI_API_KEY is set in .env.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fadeIn mt-14 md:mt-14">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--color-cora)' }}>psychology</span>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">CORA AI</h2>
          <span className="px-1.5 py-0.5 rounded text-[7px] font-mono font-medium border" style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)', backgroundColor: 'var(--color-success-muted)' }}>
            GEMINI 2.0
          </span>
        </div>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-mono">Ask about your system state, mutations, or repairs.</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-3 ${m.role === 'user'
              ? 'bg-[var(--color-cora)] text-white'
              : 'border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]'
            }`}>
              {m.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-[12px]" style={{ color: 'var(--color-cora)' }}>smart_toy</span>
                  <span className="text-[8px] font-mono font-medium" style={{ color: 'var(--color-cora)' }}>CORA AI</span>
                </div>
              )}
              <p className={`text-[12px] leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                {m.content}
              </p>
              <p className={`text-[8px] font-mono mt-1.5 ${m.role === 'user' ? 'text-white/60' : 'text-[var(--color-text-muted)]'}`}>{m.time}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg px-4 py-3 border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[12px] animate-pulse" style={{ color: 'var(--color-cora)' }}>smart_toy</span>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)]">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions (only show at start) */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 pb-3">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="px-2.5 py-1.5 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] text-[10px] font-mono text-[var(--color-text-secondary)] hover:border-[var(--color-cora)] hover:text-[var(--color-cora)] transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask CORA about your system..."
          disabled={loading}
          className="flex-1 px-3 py-2.5 text-[12px] font-mono rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cora)] disabled:opacity-50"
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-lg text-[11px] font-mono font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-cora)', color: 'white' }}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
