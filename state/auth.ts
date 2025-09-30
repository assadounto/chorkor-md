// state/auth.ts
import { create } from "zustand";
import { storage } from "@/lib/storage";

type User = { id: string; name: string; email: string } | null;
type AuthState = {
  token: string | null;
  user: User;
  hydrated: boolean; // 👈 new
  hydrate: () => Promise<void>;
  setAuth: (token: string | null, user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false, // 👈 new
  hydrate: async () => {
    const token = await storage.getString("token");
    const raw = await storage.getString("user");
    set({ token, user: raw ? JSON.parse(raw) : null, hydrated: true }); // 👈 set hydrated
  },
  setAuth: async (token, user) => {
    if (token) await storage.setString("token", token);
    else await storage.delete("token");
    if (user) await storage.setString("user", JSON.stringify(user));
    else await storage.delete("user");
    set({ token, user });
  },
  signOut: async () => {
    await storage.delete("token");
    await storage.delete("user");
    set({ token: null, user: null });
  },
}));
