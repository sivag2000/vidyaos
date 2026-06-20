import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import TeacherDashboard from './TeacherDashboard';

export default function TeacherLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(10,10,15,0.95)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🎓</span>
          <span style={{ fontWeight: 800, fontSize: 18 }}>VidyaOS</span>
          <span style={{ fontSize: 11, background: 'rgba(34,197,94,0.15)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>TEACHER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>🏫 {user?.teacher?.name}</span>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--accent-red)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🚪 Sign Out</button>
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: 220, borderRight: '1px solid var(--glass-border)', padding: '20px 12px' }}>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>🏫 Teacher Mode</p>
          <NavLink to="/teacher/dashboard" style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', color: isActive ? 'var(--text-main)' : 'var(--text-muted)', background: isActive ? 'rgba(34,197,94,0.12)' : 'transparent' })}>
            🏫 Console
          </NavLink>
        </aside>
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <Routes>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="*" element={<TeacherDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
