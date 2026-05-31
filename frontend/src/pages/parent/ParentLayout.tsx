import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import ParentDashboard from './ParentDashboard';

export default function ParentLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(10,10,15,0.95)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🎓</span>
          <span style={{ fontWeight: 800, fontSize: 18 }}>VidyaOS</span>
          <span style={{ fontSize: 11, background: 'rgba(168,85,247,0.15)', color: 'var(--accent-purple)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>PARENT</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>👪 {user?.parent?.name}</span>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--accent-red)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🚪 Sign Out</button>
        </div>
      </header>
      <main style={{ flex: 1, padding: '28px' }}>
        <Routes>
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="*" element={<ParentDashboard />} />
        </Routes>
      </main>
    </div>
  );
}
