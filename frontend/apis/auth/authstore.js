import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApi } from "@/lib/authapi";

let _token = null;

export function getToken() {
  return _token;
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),
      isAuthenticated: () => !!_token,

      // ─── Manual Register ───────────────────────────────────────
      register: async ({ username, email, password }) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register({ username, email, password });
          set({ isLoading: false });
          return { success: true };
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return { success: false, error: err.message };
        }
      },

      // ─── Manual Login ─────────────────────────────────────────
      login: async ({ usernameOrEmail, password }) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.login({ usernameOrEmail, password });
          _token = data.token;
          // persist token to localStorage manually
          if (typeof window !== "undefined") {
            localStorage.setItem("auth-token", data.token);
          }
          // Decode token in case role or other info is missing/incorrectly mapped
          let payload = {};
          try {
            payload = JSON.parse(atob(data.token.split(".")[1]));
          } catch (e) {
            // ignore
          }
          
          set({
            user: { 
              id: data.userId || payload.id, 
              username: data.username || payload.username, 
              email: data.email || payload.sub, 
              provider: data.provider || payload.provider || "LOCAL", 
              role: data.role || payload.role 
            },
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return { success: false, error: err.message };
        }
      },

      // ─── Google Login ─────────────────────────────────────────
      loginWithGoogle: ({ backendToken, backendUser }) => {
        _token = backendToken;
        if (typeof window !== "undefined") {
          localStorage.setItem("auth-token", backendToken);
        }
        set({ user: backendUser, isLoading: false, error: null });
      },

      // ─── Reset Password ───────────────────────────────────────
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
      logout: () => {
        _token = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-token");
        }
        set({ user: null, error: null });
      },
    }),
    {
      name: "auth-user",
      storage: createJSONStorage(() => localStorage),
      // ✅ Only persist user object — token is NEVER in Zustand state
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        // Restore token from separate localStorage key on client rehydration
        if (typeof window !== "undefined") {
          _token = localStorage.getItem("auth-token");
        }
      },
    }
  )
);

export default useAuthStore;