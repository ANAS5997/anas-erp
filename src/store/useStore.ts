// src/store/useStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppUser, Notification } from "@/types";

interface AppState {
  user: AppUser | null;
  theme: "dark" | "light";
  language: "en" | "ar";
  notifications: Notification[];
  unreadCount: number;

  setUser: (user: AppUser | null) => void;
  setTheme: (theme: "dark" | "light") => void;
  setLanguage: (lang: "en" | "ar") => void;
  setNotifications: (notifs: Notification[]) => void;
  markAllRead: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: "dark",
      language: "en",
      notifications: [],
      unreadCount: 0,

      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
        }),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
          })),
          unreadCount: 0,
        })),
    }),
    {
      name: "erp-store",
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);
