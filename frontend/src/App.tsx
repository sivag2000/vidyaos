import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import StudentLayout from './pages/student/StudentLayout';
import TeacherLayout from './pages/teacher/TeacherLayout';
import ParentLayout from './pages/parent/ParentLayout';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: string }) {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (user && user.role !== role) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === 'PARENT') return <Navigate to="/parent/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  const { fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/student/*" element={
          <ProtectedRoute role="STUDENT"><StudentLayout /></ProtectedRoute>
        } />
        <Route path="/teacher/*" element={
          <ProtectedRoute role="TEACHER"><TeacherLayout /></ProtectedRoute>
        } />
        <Route path="/parent/*" element={
          <ProtectedRoute role="PARENT"><ParentLayout /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
