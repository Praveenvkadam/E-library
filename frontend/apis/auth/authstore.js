import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/lib/authapi";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ─── State ───────────────────────────────────────────────
      user: null,       // { id, username, email, provider, role }
      token: null,
      isLoading: false,
      error: null,

      // ─── Helpers ─────────────────────────────────────────────
      clearError: () => set({ error: null }),
      isAuthenticated: () => !!get().token,

      // ─── Manual Register ─────────────────────────────────────
      register: async ({ username, email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.register({ username, email, password });
          set({
            user: { id: data.id, username: data.username, email: data.email, provider: data.provider, role: data.role },
            token: data.token,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return { success: false, error: err.message };
        }
      },

      // ─── Manual Login ────────────────────────────────────────
      login: async ({ usernameOrEmail, password }) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.login({ usernameOrEmail, password });
          set({
            user: { id: data.id, username: data.username, email: data.email, provider: data.provider, role: data.role },
            token: data.token,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return { success: false, error: err.message };
        }
      },

      // ─── Google Login (called from root page after OAuth redirect) ─
      // Spring Boot redirects to /?token=JWT after successful Google login.
      // Root page calls processToken to get full user info then calls this.
      loginWithGoogle: ({ backendToken, backendUser }) => {
        set({ user: backendUser, token: backendToken, isLoading: false, error: null });
      },

      // ─── Reset Password ──────────────────────────────────────
      resetPassword: async ({ email, newPassword }) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.resetPassword({ email, newPassword });
          set({ isLoading: false });
          return { success: true };
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return { success: false, error: err.message };
        }
      },

      // ─── Logout ──────────────────────────────────────────────
      logout: () => set({ user: null, token: null, error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;