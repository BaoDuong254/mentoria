import { create } from "zustand";
import { persist } from "zustand/middleware";

import { login, getMe, logout, registerMentee, verify } from "@/apis/auth.api";
import menteeApi from "@/apis/mentee.api";
import type { AuthState } from "@/types/auth.type";
import type { DashboardSessionStatus, MenteeDashboardSession } from "@/types/mentee.type";

type SessionsByDate = Record<string, MenteeDashboardSession[] | undefined>;

interface MenteeStoreState extends AuthState {
  sessionsByDate: SessionsByDate;
  loadedMonths: Record<string, boolean>;
  dashboardLoading: boolean;
  dashboardError: string | null;
  fetchMenteeSessions: (params: { month: number; year: number; force?: boolean }) => Promise<void>;
  cancelPendingSession: (sessionId: number, sessionDate: string) => Promise<void>;
  replaceSessionStatus: (sessionId: number, sessionDate: string, status: DashboardSessionStatus) => void;
}

const padMonth = (value: number) => value.toString().padStart(2, "0");

export const useAuthStore = create<MenteeStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      sessionsByDate: {},
      loadedMonths: {},
      dashboardLoading: false,
      dashboardError: null,

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

        set({
          user: null,
          sessionsByDate: {},
          loadedMonths: {},
        });
      },

      registerMentee: async (firstName, lastName, email, password) => {
        const res = await registerMentee(firstName, lastName, email, password);
        if (!res.success) {
          const errors = res.data?.errors?.join("\n") ?? "Unknown error";
          throw new Error(errors);
        }

        return res;
      },

      verify: async (otp) => {
        const res = await verify(otp);
        if (!res.success) {
          throw new Error(res.message);
        }
        return res;
      },

      fetchMenteeSessions: async ({ month, year, force = false }) => {
        const user = get().user;
        if (user?.role !== "Mentee") return;

        const monthKey = `${String(year)}-${padMonth(month)}`;
        if (!force && get().loadedMonths[monthKey]) {
          return;
        }

        set({ dashboardLoading: true, dashboardError: null });

        try {
          const response = await menteeApi.getDashboardSessions(user.user_id, { month, year });

          set((state) => {
            const updated: SessionsByDate = { ...state.sessionsByDate };

            response.data.sessions.forEach((session) => {
              const dateKey = session.sessionDate;
              const existingSessions = updated[dateKey] ? [...updated[dateKey]] : [];
              const index = existingSessions.findIndex((item) => item.sessionId === session.sessionId);
              if (index >= 0) {
                existingSessions[index] = session;
              } else {
                existingSessions.push(session);
              }

              existingSessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
              updated[dateKey] = existingSessions;
            });

            return {
              sessionsByDate: updated,
              loadedMonths: { ...state.loadedMonths, [monthKey]: true },
              dashboardLoading: false,
            };
          });
        } catch (error) {
          set({
            dashboardLoading: false,
            dashboardError: error instanceof Error ? error.message : "Unable to load mentee sessions",
          });
          throw error;
        }
      },

      cancelPendingSession: async (sessionId, sessionDate) => {
        const user = get().user;
        if (!user) {
          throw new Error("You must be logged in to cancel a session.");
        }

        await menteeApi.cancelSession(user.user_id, sessionId);
        get().replaceSessionStatus(sessionId, sessionDate, "cancelled");
      },

      replaceSessionStatus: (sessionId, sessionDate, status) => {
        set((state) => {
          const daySessions = state.sessionsByDate[sessionDate];
          if (!daySessions?.length) return state;

          const updatedDaySessions = daySessions.map((session) =>
            session.sessionId === sessionId ? { ...session, status } : session
          );

          return {
            ...state,
            sessionsByDate: {
              ...state.sessionsByDate,
              [sessionDate]: updatedDaySessions,
            },
          };
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
