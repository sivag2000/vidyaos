import { useEffect, useState } from 'react';
import api from '../../api/client';

const SUBJECTS = { science: ['Chemical Reactions', 'Electricity', 'Light', 'Acids & Bases'], mathematics: ['Quadratic Equations', 'Trigonometry', 'Arithmetic Progressions'] };

export default function TeacherDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [genForm, setGenForm] = useState({ subject: 'science', chapter: 'Electricity', topic: '', type: 'mcq' });
  const [annForm, setAnnForm] = useState({ title: '', content: '', targetClass: 'Class 10-A' });
  const [generated, setGenerated] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    api.get('/teacher/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  async function generateQuestions() {
    setGenerating(true); setGenerated(null);
    try {
      const { data: res } = await api.post('/ai/generate-questions', { ...genForm, count: 3 });
      setGenerated(res);
    } finally { setGenerating(false); }
  }

  async function publishAnnouncement() {
    if (!annForm.title || !annForm.content) return;
    setPublishing(true);
    try {
      await api.post('/teacher/announcement', annForm);
      setAnnForm({ title: '', content: '', targetClass: 'Class 10-A' });
      alert('Announcement published!');
    } finally { setPublishing(false); }
  }

  if (loading) return <p style={{ color: 'var(--text-dim)' }}>Loading...</p>;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>🏫 Teacher Oversight Desk</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Homeworks */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Active Homework Allocations</h3>
          {data?.homeworks?.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No active homeworks.</p>}
          {data?.homeworks?.map((hw: any) => (
            <div key={hw.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--accent-indigo)', marginBottom: 4 }}>
                <span>{hw.targetClass} • Active</span>
                <span style={{ color: 'var(--text-dim)' }}>Due: {new Date(hw.dueDate).toLocaleDateString('en-IN')}</span>
              </div>
              <p style={{ fontSize: 14, marginBottom: 8 }}>{hw.title}</p>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${Math.round((hw.submittedCount / hw.totalCount) * 100)}%`, background: 'linear-gradient(to right, var(--accent-indigo), var(--accent-green))', borderRadius: 2 }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{hw.submittedCount}/{hw.totalCount} submitted</p>
            </div>
          ))}
        </div>

        {/* Class performance */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Class Grade Averages</h3>
          {[{ label: 'Class 10-A', avg: 78 }, { label: 'Class 10-B', avg: 72 }, { label: 'Class 9-C', avg: 81 }].map(c => (
            <div key={c.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                <span>{c.label}</span><span>{c.avg}%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${c.avg}%`, background: 'linear-gradient(to right, var(--accent-indigo), var(--accent-purple))', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Question Generator */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="glass-panel" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>⚙️ AI Question Generator</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Subject', field: 'subject', options: [['science','Science'],['mathematics','Mathematics']] },
              { label: 'Question Type', field: 'type', options: [['mcq','MCQ'],['assertion-reason','Assertion-Reason'],['short','Short Answer']] },
            ].map(({ label, field, options }) => (
              <div key={field}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>{label}</label>
                <select className="form-input" value={(genForm as any)[field]} onChange={e => setGenForm(f => ({ ...f, [field]: e.target.value }))}>
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>Chapter</label>
              <select className="form-input" value={genForm.chapter} onChange={e => setGenForm(f => ({ ...f, chapter: e.target.value }))}>
                {(SUBJECTS[genForm.subject as keyof typeof SUBJECTS] || []).map(ch => <option key={ch}>{ch}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>Topic (optional)</label>
              <input className="form-input" value={genForm.topic} onChange={e => setGenForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Resistors in parallel" />
            </div>
            <button className="primary-btn" onClick={generateQuestions} disabled={generating}>{generating ? '🤖 Generating...' : '🤖 Generate Sheet'}</button>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20, overflowY: 'auto', maxHeight: 400 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Generated Sheet Preview</h3>
          {!generated && <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Configure parameters and generate to preview the worksheet.</p>}
          {generated?.questions?.map((q: any, i: number) => (
            <div key={i} style={{ marginBottom: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, whiteSpace: 'pre-line' }}>Q{i+1}: {q.question}</p>
              {q.options.map((opt: string, j: number) => (
                <p key={j} style={{ fontSize: 12, color: j === q.correctAnswer ? 'var(--accent-green)' : 'var(--text-muted)', padding: '3px 0' }}>{['A','B','C','D'][j]}: {opt}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div className="glass-panel" style={{ padding: 20, maxWidth: 600 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📣 Publish Board Update</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>Title</label>
            <input className="form-input" value={annForm.title} onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. CBSE Syllabus Checklist" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>Content</label>
            <textarea className="form-input" value={annForm.content} onChange={e => setAnnForm(f => ({ ...f, content: e.target.value }))} placeholder="Type instructions for students..." rows={4} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <button className="primary-btn" onClick={publishAnnouncement} disabled={publishing || !annForm.title || !annForm.content} style={{ alignSelf: 'flex-start' }}>
            {publishing ? 'Publishing...' : 'Broadcast Announcement'}
          </button>
        </div>
      </div>
    </div>
  );
}
