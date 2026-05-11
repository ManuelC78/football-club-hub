import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/auth';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      register: async (data) => {
        const res = await apiRegister(data);
        const { user, access } = res.data;
        localStorage.setItem('accessToken', access);
        set({ user, accessToken: access, isAuthenticated: true });
        return res.data;
      },

      login: async (credentials) => {
        const res = await apiLogin(credentials);
        const { user, access } = res.data;
        localStorage.setItem('accessToken', access);
        set({ user, accessToken: access, isAuthenticated: true });
        return res.data;
      },

      logout: async () => {
        await apiLogout().catch(() => {});
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    { name: 'fch-auth', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
);

export default useAuthStore;
