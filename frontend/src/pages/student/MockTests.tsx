import { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { MOCK_TESTS_DATA } from '../../data/mockTests';

type Screen = 'select' | 'session' | 'report';
interface Answers { [qId: string]: number | number[]; }

export default function MockTests() {
  const [screen, setScreen] = useState<Screen>('select');
  const [activeTest, setActiveTest] = useState<any>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [report, setReport] = useState<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function startTest(testKey: string) {
    const test = MOCK_TESTS_DATA[testKey];
    setActiveTest({ ...test, key: testKey });
    setAnswers({});
    setCurrentIdx(0);
    setTimeLeft(test.timeLimit);
    setScreen('session');

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); submitTest({ ...test, key: testKey }, {}); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  function selectOption(qId: string, optIdx: number, isMulti: boolean) {
    setAnswers(prev => {
      if (isMulti) {
        const current = (prev[qId] as number[]) || [];
        return { ...prev, [qId]: current.includes(optIdx) ? current.filter(i => i !== optIdx) : [...current, optIdx] };
      }
      return { ...prev, [qId]: optIdx };
    });
  }

  function submitTest(test?: any, ans?: Answers) {
    const t = test || activeTest;
    const a = ans || answers;
    if (timerRef.current) clearInterval(timerRef.current);

    let correct = 0;
    t.questions.forEach((q: any) => {
      if (q.type === 'msq') {
        const userAns = (a[q.id] as number[]) || [];
        const allMatch = userAns.length === q.correctAnswers.length && userAns.every((v: number) => q.correctAnswers.includes(v));
        if (allMatch) correct++;
      } else {
        if (a[q.id] === q.correctAnswer) correct++;
      }
    });

    const accuracy = Math.round((correct / t.questions.length) * 100);
    const xpAwarded = correct * 50 + 50;

    api.post('/tests/submit', { testKey: t.key, testTitle: t.title, subject: t.subject, score: correct, totalMarks: t.questions.length, accuracy, answers: a, xpAwarded }).catch(() => {});

    setReport({ correct, total: t.questions.length, accuracy, xpAwarded, questions: t.questions, answers: a });
    setScreen('report');
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const q = activeTest?.questions?.[currentIdx];

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>📝 Mock Exam Center</h2>

      {screen === 'select' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {Object.entries(MOCK_TESTS_DATA).map(([key, test]: [string, any]) => (
            <div key={key} className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: test.subject === 'science' ? 'rgba(59,130,246,0.15)' : 'rgba(168,85,247,0.15)', color: test.subject === 'science' ? 'var(--accent-blue)' : 'var(--accent-purple)' }}>{test.subject}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{test.questions.length} Questions</span>
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{test.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Time: {test.timeLimit / 60} minutes. CBSE-aligned questions.</p>
              <button className="primary-btn" onClick={() => startTest(key)} style={{ width: '100%' }}>Launch Exam</button>
            </div>
          ))}
        </div>
      )}

      {screen === 'session' && q && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
          <div>
            <div className="glass-panel" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>Question {currentIdx + 1} of {activeTest.questions.length}</p>
              {q.type === 'msq' && <div style={{ fontSize: 12, color: 'var(--accent-orange)', background: 'rgba(249,115,22,0.1)', padding: '8px 12px', borderRadius: 6, marginBottom: 12 }}>⚠️ Multiple correct answers possible</div>}
              <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6, marginBottom: 20, whiteSpace: 'pre-line' }}>{q.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.options.map((opt: string, idx: number) => {
                  const isSelected = q.type === 'msq' ? ((answers[q.id] as number[]) || []).includes(idx) : answers[q.id] === idx;
                  return (
                    <div key={idx} onClick={() => selectOption(q.id, idx, q.type === 'msq')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, border: `1px solid ${isSelected ? 'var(--accent-indigo)' : 'var(--glass-border)'}`, background: isSelected ? 'rgba(99,102,241,0.1)' : 'transparent', cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: isSelected ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.05)', color: isSelected ? '#fff' : 'var(--text-muted)', flexShrink: 0 }}>{['A','B','C','D'][idx]}</span>
                      <span style={{ fontSize: 14 }}>{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="sec-btn" onClick={() => setCurrentIdx(i => i - 1)} disabled={currentIdx === 0}>◀ Back</button>
              {currentIdx < activeTest.questions.length - 1 ? (
                <button className="primary-btn" onClick={() => setCurrentIdx(i => i + 1)}>Next ▶</button>
              ) : (
                <button className="primary-btn" onClick={() => submitTest()} style={{ background: 'linear-gradient(135deg, var(--accent-red), var(--accent-orange))' }}>Submit Exam</button>
              )}
            </div>
          </div>

          <div>
            <div className="glass-panel" style={{ padding: 20, textAlign: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Time Remaining</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: timeLeft < 60 ? 'var(--accent-red)' : 'var(--text-main)', fontFamily: 'monospace' }}>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</p>
            </div>
            <div className="glass-panel" style={{ padding: 16 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: 13 }}>Question Palette</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                {activeTest.questions.map((_: any, i: number) => {
                  const isAnswered = answers[activeTest.questions[i].id] !== undefined;
                  return (
                    <button key={i} onClick={() => setCurrentIdx(i)} style={{ aspectRatio: '1', borderRadius: 6, border: '1px solid', borderColor: currentIdx === i ? 'var(--accent-indigo)' : isAnswered ? 'var(--accent-green)' : 'var(--glass-border)', background: currentIdx === i ? 'rgba(99,102,241,0.2)' : isAnswered ? 'rgba(34,197,94,0.1)' : 'transparent', color: 'var(--text-main)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{i + 1}</button>
                  );
                })}
              </div>
              <button className="primary-btn" onClick={() => submitTest()} style={{ width: '100%', marginTop: 16, background: 'linear-gradient(135deg, var(--accent-red), var(--accent-orange))', fontSize: 13 }}>Submit Exam</button>
            </div>
          </div>
        </div>
      )}

      {screen === 'report' && report && (
        <div>
          <div className="glass-panel" style={{ padding: 28, textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ fontWeight: 800, marginBottom: 16 }}>Concept Assessment Summary</h2>
            <div style={{ fontSize: 52, fontWeight: 900, color: report.accuracy >= 75 ? 'var(--accent-green)' : 'var(--accent-orange)', marginBottom: 8 }}>{report.accuracy}%</div>
            <p style={{ color: 'var(--text-muted)' }}>{report.correct}/{report.total} correct · +{report.xpAwarded} XP awarded</p>
          </div>
          <div className="glass-panel" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ color: 'var(--accent-indigo)', fontWeight: 700, marginBottom: 16 }}>🤖 AI Diagnostic Recommendations</h3>
            {report.questions.map((q: any, i: number) => {
              const isCorrect = q.type === 'msq'
                ? JSON.stringify([...(report.answers[q.id] || [])].sort()) === JSON.stringify([...q.correctAnswers].sort())
                : report.answers[q.id] === q.correctAnswer;
              return (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: 18 }}>{isCorrect ? '✅' : '❌'}</span>
                  <div style={{ fontSize: 13 }}>
                    {isCorrect ? <strong>Q{i+1} (Correct):</strong> : <><strong>Q{i+1} (Incorrect): </strong><em style={{ color: 'var(--text-muted)' }}>{q.explanation}</em></>}
                  </div>
                </div>
              );
            })}
          </div>
          <button className="sec-btn" onClick={() => setScreen('select')}>← Back to Exams</button>
        </div>
      )}
    </div>
  );
}
