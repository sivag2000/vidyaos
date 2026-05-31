import { useState } from 'react';
import api from '../../api/client';

const PRESET_DOUBTS = [
  { question: "Why does copper sulfate change color when iron is placed in it?", subject: "Science (Chemistry)" },
  { question: "How do we find the nature of roots for a quadratic equation?", subject: "Mathematics" },
  { question: "What is Ohm's Law and its mathematical expression?", subject: "Science (Physics)" },
  { question: "What is the difference between resistors in series and parallel?", subject: "Science (Physics)" },
];

interface DoubtResult { question: string; explanation: string; eli5: string; tips: string; }

export default function DoubtSolver() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<DoubtResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'standard' | 'eli5'>('standard');

  async function solve(q: string, subj = 'General') {
    if (!q.trim()) return;
    setLoading(true); setResult(null);
    try {
      const { data } = await api.post('/ai/doubt', { question: q, subject: subj });
      setResult(data); setMode('standard');
    } finally { setLoading(false); }
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>🔍 AI Photo Doubt Solver</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
        {/* Left panel */}
        <div>
          <div className="glass-panel" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <input className="form-input" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && solve(question)} placeholder="Type your doubt here..." style={{ flex: 1 }} />
              <button className="primary-btn" onClick={() => solve(question)} disabled={loading || !question.trim()} style={{ whiteSpace: 'nowrap' }}>Solve</button>
            </div>
          </div>

          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>Quick Select Doubts</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRESET_DOUBTS.map(d => (
              <button key={d.question} onClick={() => { setQuestion(d.question); solve(d.question, d.subject); }} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', cursor: 'pointer', fontSize: 13, lineHeight: 1.4, transition: 'var(--transition-smooth)' }}>
                <span style={{ color: 'var(--accent-indigo)', fontWeight: 700, marginRight: 6 }}>[{d.subject}]</span>{d.question}
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: 12, marginBottom: 16 }}>
            <h3 style={{ color: 'var(--accent-indigo)', fontWeight: 700 }}>Interactive Explanation</h3>
            {result && (
              <button onClick={() => setMode(m => m === 'standard' ? 'eli5' : 'standard')} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid', borderColor: mode === 'eli5' ? 'var(--accent-green)' : 'var(--accent-purple)', color: mode === 'eli5' ? 'var(--accent-green)' : 'var(--accent-purple)', background: 'transparent', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {mode === 'standard' ? "ELI5 🎈" : "Advanced 🔬"}
              </button>
            )}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
              <div style={{ fontSize: 32, marginBottom: 12, animation: 'pulse 1s infinite' }}>🤖</div>
              <p>Analyzing doubt...</p>
            </div>
          )}

          {!loading && !result && (
            <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Select a preset doubt or type your question to see the AI explanation.</p>
          )}

          {result && !loading && (
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: 14, lineHeight: 1.5 }}>Q: {result.question}</h4>
              <div style={{ fontSize: 14, lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: mode === 'eli5' ? result.eli5 : result.explanation }}
              />
              {mode === 'standard' && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(99,102,241,0.06)', borderRadius: 10, fontSize: 13 }}
                  dangerouslySetInnerHTML={{ __html: result.tips }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
