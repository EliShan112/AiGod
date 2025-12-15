import api from "@/lib/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IUser {
  id: string;
  email: string;
  username: string;
}

interface IAuthState {
  user: IUser | null;
  accessToken: string | null;

  setAuth: (user: IUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => set({ user, accessToken }),

      setAccessToken: (accessToken) =>
        set((state) => ({ ...state, accessToken })),

      logout: () => set({ user: null, accessToken: null }),

      initializeAuth: async () => {
        try {
          const { data } = await api.get("/api/auth/me");
          if (data?.user && data.accessToken) {
            set({ user: data.user, accessToken: data.accessToken });
          }
        } catch (error) {
          console.log("No active session.");
          set({ user: null, accessToken: null });
        } 
      },
    }),
    { name: "auth-store" }
  )
);
