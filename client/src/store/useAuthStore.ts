import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login, getMe, logout } from "@/apis/auth.api";
import type { AuthState } from "@/types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,

      fetchUser: async () => {
        try {
          const res = await getMe();
          set({ user: res.data.user });
        } catch {
          set({ user: null });
        } finally {
          set({ loading: false });
        }
      },

      login: async (email, password) => {
        const res = await login(email, password);

        if (!res.success) {
          throw new Error(res.message);
        }

        const userInfo = await getMe();
        set({ user: userInfo.data.user });

        return res;
      },

      logout: async () => {
        const res = await logout();

        if (!res.success) {
          throw new Error(res.message);
        }

        set({ user: null });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
