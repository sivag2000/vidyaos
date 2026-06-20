import { useState, useEffect } from 'react';
import { fetchCurriculum, fetchChapterQuestions, submitAttempt, type SubjectDef, type PracticeQuestion, type AttemptResult } from '../../api/practice';

type View = 'subjects' | 'chapters' | 'practice';

export default function Practice() {
  const [view, setView] = useState<View>('subjects');
  const [subjects, setSubjects] = useState<SubjectDef[]>([]);
  const [activeSubject, setActiveSubject] = useState<SubjectDef | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);

  useEffect(() => { fetchCurriculum().then(c => setSubjects(c.subjects)).catch(() => {}); }, []);

  async function openChapter(chapterId: string) {
    const qs = await fetchChapterQuestions(chapterId);
    setQuestions(qs); setIdx(0); setSelected(null); setResult(null); setView('practice');
  }

  async function answer(optIdx: number) {
    if (result) return;
    setSelected(optIdx);
    const r = await submitAttempt(questions[idx].id, optIdx);
    setResult(r);
  }

  function nextQ() {
    setSelected(null); setResult(null);
    setIdx(i => Math.min(i + 1, questions.length - 1));
  }

  const q = questions[idx];

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>📚 Practice</h2>

      {view === 'subjects' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {subjects.map(s => (
            <div key={s.id} className="glass-panel" style={{ padding: 20, cursor: 'pointer' }}
                 onClick={() => { setActiveSubject(s); setView('chapters'); }}>
              <h3 style={{ fontWeight: 700 }}>{s.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.chapters.length} chapters</p>
            </div>
          ))}
        </div>
      )}

      {view === 'chapters' && activeSubject && (
        <div>
          <button className="sec-btn" onClick={() => setView('subjects')} style={{ marginBottom: 16 }}>← Subjects</button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {activeSubject.chapters.map(c => (
              <button key={c.id} className="glass-panel" style={{ padding: 16, textAlign: 'left', cursor: 'pointer' }}
                      onClick={() => openChapter(c.id)}>
                <strong>{c.name}</strong>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'practice' && q && (
        <div>
          <button className="sec-btn" onClick={() => setView('chapters')} style={{ marginBottom: 16 }}>← Chapters</button>
          <div className="glass-panel" style={{ padding: 24 }}>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>Question {idx + 1} of {questions.length} · {q.difficulty}</p>
            <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6, marginBottom: 20, whiteSpace: 'pre-line' }}>{q.question}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(q.options || []).map((opt, i) => {
                const isPicked = selected === i;
                const isAnswer = result && i === result.correctAnswer;
                const border = isAnswer ? 'var(--accent-green)' : isPicked ? 'var(--accent-indigo)' : 'var(--glass-border)';
                return (
                  <div key={i} onClick={() => answer(i)} style={{ display: 'flex', gap: 14, padding: '12px 16px', borderRadius: 10, border: `1px solid ${border}`, cursor: result ? 'default' : 'pointer' }}>
                    <span style={{ fontWeight: 700 }}>{['A','B','C','D','E','F'][i]}</span>
                    <span style={{ fontSize: 14 }}>{opt}</span>
                  </div>
                );
              })}
            </div>
            {result && (
              <div className="glass-panel" style={{ marginTop: 16, padding: 16 }}>
                <p style={{ fontWeight: 700, color: result.isCorrect ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {result.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, whiteSpace: 'pre-line' }}>{result.explanation}</p>
                <button className="primary-btn" onClick={nextQ} style={{ marginTop: 12 }} disabled={idx >= questions.length - 1}>Next ▶</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
