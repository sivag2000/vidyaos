import { create } from 'zustand';
import api from '../api/client';

interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: 'STUDENT' | 'PARENT' | 'TEACHER';
  student?: { id: string; name: string; classLevel: string; section: string; xp: number; level: number; streak: number };
  teacher?: { id: string; name: string; subject: string };
  parent?: { id: string; name: string };
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (identity: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  role: 'STUDENT' | 'PARENT' | 'TEACHER';
  name: string;
  classLevel?: string;
  section?: string;
  board?: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('vidyaos_token'),
  loading: false,

  login: async (identity, password) => {
    const { data } = await api.post('/auth/login', { identity, password });
    localStorage.setItem('vidyaos_token', data.token);
    set({ token: data.token });
    const me = await api.get('/auth/me');
    set({ user: me.data });
  },

  register: async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('vidyaos_token', data.token);
    set({ token: data.token });
    const me = await api.get('/auth/me');
    set({ user: me.data });
  },

  fetchMe: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data });
    } catch {
      localStorage.removeItem('vidyaos_token');
      set({ user: null, token: null });
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('vidyaos_token');
    set({ user: null, token: null });
  },
}));
