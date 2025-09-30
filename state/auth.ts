import { create } from "zustand";

// simple in-memory + async helpers
const mem: Record<string, string | null> = {};
const storage = {
  async getString(k: string) {
    return mem[k] ?? null;
  },
  async setString(k: string, v: string) {
    mem[k] = v;
  },
  async delete(k: string) {
    mem[k] = null;
  },
};

type User = { id: string; name: string; email: string } | null;
type AuthState = {
  token: string | null;
  user: User;
  hydrate: () => Promise<void>;
  setAuth: (token: string | null, user: User) => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrate: async () => {
    const token = await storage.getString("token");
    const raw = await storage.getString("user");
    set({ token, user: raw ? JSON.parse(raw) : null });
  },
  setAuth: async (token, user) => {
    if (token) await storage.setString("token", token);
    else await storage.delete("token");
    if (user) await storage.setString("user", JSON.stringify(user));
    else await storage.delete("user");
    set({ token, user });
  },
}));
