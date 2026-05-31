import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface Task { id: string; title: string; completed: boolean; }
interface Announcement { id: string; read: boolean; announcement: { title: string; content: string; createdAt: string; teacher: { name: string } }; }

export default function Dashboard() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/student/tasks'), api.get('/student/announcements')])
      .then(([t, a]) => { setTasks(t.data); setAnnouncements(a.data); })
      .finally(() => setLoading(false));
  }, []);

  async function toggleTask(task: Task) {
    const { data } = await api.patch(`/student/tasks/${task.id}`, { completed: !task.completed });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: data.task.completed } : t));
  }

  if (loading) return <div style={{ color: 'var(--text-dim)', padding: 20 }}>Loading...</div>;

  const student = user?.student;

  return (
    <div>
      {/* Welcome */}
      <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Namaste, {student?.name?.split(' ')[0] ?? 'Student'}! 🚀</h1>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          {[student?.classLevel, student?.section && `Section ${student.section}`, 'CBSE', '2026-27'].filter(Boolean).map((tag, i) => (
            <span key={i} style={{ fontSize: 12, background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)', padding: '3px 10px', borderRadius: 6, fontWeight: 600 }}>{tag}</span>
          ))}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Complete your revision checklist to maintain your streak and level up!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Daily Tasks */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Daily Revision Tasks</h3>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No tasks for today.</p>
          ) : tasks.map(task => (
            <label key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--glass-border)', cursor: 'pointer' }}>
              <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} style={{ width: 16, height: 16, accentColor: 'var(--accent-indigo)', cursor: 'pointer' }} />
              <span style={{ fontSize: 14, color: task.completed ? 'var(--text-dim)' : 'var(--text-main)', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</span>
              {task.completed && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent-green)', fontWeight: 700 }}>+50 XP</span>}
            </label>
          ))}
        </div>

        {/* Announcements */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Announcements</h3>
          {announcements.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No announcements.</p>
          ) : announcements.slice(0, 4).map(a => (
            <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-indigo)' }}>{a.announcement.teacher.name} • {a.announcement.title}</span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{new Date(a.announcement.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{a.announcement.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* XP & Streak */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 20 }}>
        {[
          { label: 'Total XP', value: `${student?.xp ?? 0} XP`, icon: '✨', color: 'var(--accent-indigo)' },
          { label: 'Study Streak', value: `${student?.streak ?? 0} Days`, icon: '🔥', color: 'var(--accent-orange)' },
          { label: 'Current Level', value: `Level ${student?.level ?? 1}`, icon: '⭐', color: 'var(--accent-purple)' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel" style={{ padding: '18px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
