import { useState, useRef, useEffect } from 'react';
import api from '../../api/client';

interface Message { sender: 'bot' | 'user'; text: string; suggestions?: string[]; }

const SUBJECTS = {
  science: { label: '🔬 Science', chapters: ['Electricity', 'Chemical Reactions', 'Light', 'Acids & Bases', 'Magnetic Effects'] },
  mathematics: { label: '📐 Maths', chapters: ['Quadratic Equations', 'Arithmetic Progressions', 'Trigonometry'] },
};

const COMPLEXITY_OPTIONS = ['foundation', 'standard', 'advanced', 'deep-dive'];

export default function AiTutor() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: '<p>Hello! I am your <strong>Vidya AI Tutor</strong>. Select a chapter from the sidebar or type a question to begin. 🚀</p>', suggestions: ["Ohm's Law 💡", "Balance Equations 🔬", "Quadratic Formula 📐"] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [complexity, setComplexity] = useState('standard');
  const [activeTopic, setActiveTopic] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/tutor', { topic: activeTopic, message: text, complexity });
      setActiveTopic(activeTopic || text.slice(0, 40));
      setMessages(prev => [...prev, { sender: 'bot', text: data.text, suggestions: data.suggestions }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: '<p>Sorry, something went wrong. Please try again.</p>' }]);
    } finally { setLoading(false); }
  }

  function selectChapter(chapter: string) {
    setActiveTopic(chapter);
    sendMessage(`Revise: ${chapter}`);
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>🤖 AI Learning Companion</h2>

      {/* Complexity switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {COMPLEXITY_OPTIONS.map(c => (
          <button key={c} onClick={() => setComplexity(c)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid', borderColor: complexity === c ? 'var(--accent-indigo)' : 'var(--glass-border)', background: complexity === c ? 'rgba(99,102,241,0.15)' : 'transparent', color: complexity === c ? 'var(--accent-indigo)' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, height: '62vh' }}>
        {/* Chapter sidebar */}
        <div className="glass-panel" style={{ padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Object.entries(SUBJECTS).map(([subj, data]) => (
            <div key={subj}>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', margin: '10px 0 6px' }}>{data.label}</p>
              {data.chapters.map(ch => (
                <button key={ch} onClick={() => selectChapter(ch)} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: 'none', background: activeTopic === ch ? 'rgba(99,102,241,0.12)' : 'transparent', color: activeTopic === ch ? 'var(--text-main)' : 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
                  {ch}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Chat history */}
          <div ref={chatRef} style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.sender === 'bot' ? (
                  <div className="chat-msg-bot" dangerouslySetInnerHTML={{ __html: msg.text }} />
                ) : (
                  <div className="chat-msg-user">{msg.text}</div>
                )}
                {msg.suggestions && msg.sender === 'bot' && i === messages.length - 1 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {msg.suggestions.map(s => (
                      <button key={s} onClick={() => sendMessage(s)} style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid var(--glass-border)', background: 'rgba(99,102,241,0.08)', color: 'var(--accent-indigo)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="chat-msg-bot" style={{ fontStyle: 'italic', color: 'var(--text-dim)' }}>Tutor is thinking...</div>}
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 10 }}>
            <input className="form-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage(input)} placeholder="Ask a doubt or select a chapter..." style={{ flex: 1 }} />
            <button className="primary-btn" onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{ padding: '10px 20px' }}>➔</button>
          </div>
        </div>
      </div>
    </div>
  );
}
