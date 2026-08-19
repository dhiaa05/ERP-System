import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'lamsti-auth-storage', // unique name
      // Only store token in local storage, not the user object directly, or store both if needed for quick UI rendering
      // In a real app we might want to store both for offline capability or immediate render before validation
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
