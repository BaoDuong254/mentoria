import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login, getMe } from "@/apis/auth.api";
import type { AuthState } from "@/types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,

      fetchUser: async () => {
        try {
          const res = await getMe();
          set({ user: res });
        } catch {
          set({ user: null });
        } finally {
          set({ loading: false });
        }
      },

      login: async (email, password) => {
        const res = await login(email, password);

        console.log(res);

        if (!res.success) {
          throw new Error(res.message);
        }

        const userInfo = await getMe();
        set({ user: userInfo });

        return res;
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
