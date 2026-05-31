import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

type Tab = 'login' | 'register';
type Role = 'STUDENT' | 'PARENT' | 'TEACHER';

const QUICK_FILL = {
  student: { identity: 'rohan@vidyaos.edu.in', password: 'Test@1234' },
  teacher: { identity: 'sharma.teacher@vidyaos.edu.in', password: 'Test@1234' },
  parent: { identity: 'parent@vidyaos.edu.in', password: 'Test@1234' },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');

  // Register form
  const [regData, setRegData] = useState({ email: '', username: '', password: '', name: '', role: 'STUDENT' as Role, classLevel: 'Class 10', section: 'A', board: 'CBSE' });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(identity, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(regData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  }

  function quickFill(type: 'student' | 'teacher' | 'parent') {
    setIdentity(QUICK_FILL[type].identity);
    setPassword(QUICK_FILL[type].password);
    setTab('login');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 440, padding: '32px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 12px auto', boxShadow: 'var(--glow-shadow)' }}>🎓</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>VidyaOS</h2>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>Your AI Learning Operating System</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--glass-border)', paddingBottom: 8 }}>
          {(['login', 'register'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }} style={{ flex: 1, background: 'transparent', border: 'none', color: tab === t ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 700, fontSize: 15, padding: '8px 0', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--accent-indigo)' : '2px solid transparent', transition: 'var(--transition-smooth)' }}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--accent-red)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent-red)', marginBottom: 16 }}>⚠️ {error}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email or Username</label>
              <input className="form-input" type="text" value={identity} onChange={e => setIdentity(e.target.value)} placeholder="rohan@vidyaos.edu.in" required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Password</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button className="primary-btn" type="submit" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Quick fill */}
            <div style={{ borderTop: '1px dashed var(--glass-border)', paddingTop: 14 }}>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>⚡ Dev Quick Fill</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['student', 'teacher', 'parent'] as const).map(r => (
                  <button key={r} type="button" onClick={() => quickFill(r)} className="sec-btn" style={{ flex: 1, fontSize: 11, padding: '6px 0', textTransform: 'capitalize' }}>{r}</button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Rohan Sharma' },
              { label: 'Username', key: 'username', type: 'text', placeholder: 'rohan_sharma' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'rohan@email.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 9 chars, upper + number' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input className="form-input" type={f.type} placeholder={f.placeholder} value={(regData as any)[f.key]} onChange={e => setRegData(d => ({ ...d, [f.key]: e.target.value }))} required />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Role</label>
              <select className="form-input" value={regData.role} onChange={e => setRegData(d => ({ ...d, role: e.target.value as Role }))}>
                <option value="STUDENT">👤 Student</option>
                <option value="PARENT">👪 Parent</option>
                <option value="TEACHER">🏫 Teacher</option>
              </select>
            </div>
            {regData.role === 'STUDENT' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Class</label>
                  <select className="form-input" value={regData.classLevel} onChange={e => setRegData(d => ({ ...d, classLevel: e.target.value }))}>
                    {['Class 10', 'Class 9', 'Class 8', 'Class 7', 'Class 6'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Board</label>
                  <select className="form-input" value={regData.board} onChange={e => setRegData(d => ({ ...d, board: e.target.value }))}>
                    <option>CBSE</option><option>ICSE</option><option>STATE</option>
                  </select>
                </div>
              </div>
            )}
            <button className="primary-btn" type="submit" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
