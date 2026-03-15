import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApi } from "@/lib/authapi";

// ✅ _token lives outside the store so it's never serialized to localStorage
// and is always up-to-date in memory across the session.
let _token = null;

export function getToken() {
  return _token;
}

function decodeJWT(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

function normalizeRole(raw) {
  if (!raw) return null;
  const r = raw.toUpperCase();
  if (r.includes("ADMIN")) return "ADMIN";
  if (r.includes("USER"))  return "USER";
  return r;
}

function extractRole(data, payload) {
  const raw =
    data?.role ||
    payload?.role ||
    payload?.authorities?.[0]?.authority ||
    payload?.roles?.[0] ||
    null;
  return normalizeRole(raw);
}

const useAuthStore = create(
  persist(
    (set) => ({
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

          if (typeof window !== "undefined") {
            localStorage.setItem("auth-token", data.token);
          }

          const payload = decodeJWT(data.token);

          const user = {
            id:       data.userId   || payload.id    || payload.sub,
            username: data.username || payload.username,
            name:     data.name     || payload.name,
            email:    data.email    || payload.email  || payload.sub,
            provider: data.provider || payload.provider || "LOCAL",
            role:     extractRole(data, payload),
          };

          console.log("[AuthStore] login →", user);
          set({ user, isLoading: false });
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

        const payload = decodeJWT(backendToken);

        const user = {
          ...backendUser,
          id:       backendUser.id       || payload.id       || payload.userId,
          username: backendUser.username || payload.username,
          name:     backendUser.name     || payload.name,
          email:    backendUser.email    || payload.email    || payload.sub,
          provider: backendUser.provider || "GOOGLE",
          role:     extractRole(backendUser, payload),
        };

        console.log("[AuthStore] Google login →", user);
        set({ user, isLoading: false, error: null });
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
        // ✅ Clear the in-memory token
        _token = null;

        if (typeof window !== "undefined") {
          // ✅ Clear the JWT from localStorage
          localStorage.removeItem("auth-token");

          // ❌ REMOVED: localStorage.removeItem("auth-user")
          // Manually removing "auth-user" caused a race condition —
          // Zustand's persist middleware re-writes it immediately after.
          // set({ user: null }) below is enough; Zustand persist will
          // automatically sync the cleared user state to localStorage.
        }

        // ✅ Clear user from store — Zustand persist handles localStorage sync
        set({ user: null, error: null });
      },
    }),
    {
      name: "auth-user", // localStorage key for persisted state
      storage: createJSONStorage(() => localStorage),

      // ✅ Only persist the user object, not loading/error state
      partialize: (state) => ({ user: state.user }),

      // ✅ On page reload, rehydrate _token from localStorage
      // so isAuthenticated() returns true for returning users
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== "undefined") {
          _token = localStorage.getItem("auth-token");
        }
      },
    }
  )
);

export default useAuthStore;