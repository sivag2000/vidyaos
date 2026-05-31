import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Dashboard from './Dashboard';
import AiTutor from './AiTutor';
import MockTests from './MockTests';
import DoubtSolver from './DoubtSolver';

const NAV = [
  { to: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { to: 'tutor', icon: '🤖', label: 'AI Tutor' },
  { to: 'doubt', icon: '🔍', label: 'Doubt Solver' },
  { to: 'tests', icon: '📝', label: 'Mock Exams' },
];

export default function StudentLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(10,10,15,0.95)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🎓</span>
          <div>
            <span style={{ fontWeight: 800, fontSize: 18 }}>VidyaOS</span>
            <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.15)', color: 'var(--accent-indigo)', padding: '2px 6px', borderRadius: 4, marginLeft: 8, fontWeight: 700 }}>AI STUDY OS</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>🔥 {user?.student?.streak ?? 0} Day Streak</span>
          <span style={{ fontSize: 13, color: 'var(--accent-indigo)', fontWeight: 700 }}>✨ {user?.student?.xp ?? 0} XP</span>
          <span style={{ fontSize: 12, background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>Lvl {user?.student?.level ?? 1}</span>
          <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--accent-red)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🚪 Sign Out</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: 220, borderRight: '1px solid var(--glass-border)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>👤 Student Mode</p>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', color: isActive ? 'var(--text-main)' : 'var(--text-muted)', background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent', transition: 'var(--transition-smooth)' })}>
              <span>{n.icon}</span> {n.label}
            </NavLink>
          ))}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tutor" element={<AiTutor />} />
            <Route path="doubt" element={<DoubtSolver />} />
            <Route path="tests" element={<MockTests />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
