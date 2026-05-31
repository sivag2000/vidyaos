import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function ParentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/parent/children').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--text-dim)' }}>Loading...</p>;

  const children = data?.children || [];

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>📊 Parent Progress Portal</h2>
      {children.length === 0 ? (
        <p style={{ color: 'var(--text-dim)' }}>No linked children found. Please contact the school admin.</p>
      ) : children.map((child: any) => (
        <div key={child.id}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--accent-purple)' }}>👤 {child.name} — {child.classLevel}-{child.section}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Total XP', value: `${child.xp} XP`, color: 'var(--accent-indigo)' },
              { label: 'Level', value: `Level ${child.level}`, color: 'var(--accent-purple)' },
              { label: 'Weak Topics', value: `${child.weakTopics?.length || 0} flagged`, color: 'var(--accent-orange)' },
            ].map(s => (
              <div key={s.label} className="glass-panel" style={{ padding: '16px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {child.testResults?.length > 0 && (
            <div className="glass-panel" style={{ padding: 20, marginBottom: 20 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 14 }}>Recent Test Results</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)' }}>
                    {['Test', 'Date', 'Score', 'Grade'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 0', fontWeight: 700 }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {child.testResults.map((t: any) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '10px 0', fontWeight: 600 }}>{t.testTitle}</td>
                      <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>{new Date(t.completedAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '10px 0', color: t.accuracy >= 75 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>{t.accuracy}%</td>
                      <td style={{ padding: '10px 0' }}><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }}>{t.accuracy >= 90 ? 'A+' : t.accuracy >= 80 ? 'A' : t.accuracy >= 70 ? 'B+' : 'B'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {child.weakTopics?.length > 0 && (
            <div className="glass-panel" style={{ padding: 20 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 14, color: 'var(--accent-red)' }}>⚠️ Weak Topics (Need Attention)</h4>
              {child.weakTopics.map((t: any) => (
                <div key={t.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    <span>{t.topic}</span><span style={{ color: 'var(--accent-red)' }}>{t.clarity}% clarity</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${t.clarity}%`, background: 'var(--accent-red)', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
