import { create } from "zustand";
import { storage } from "@/app/_layout";

type User = { id: string; name: string; email: string } | null;

type AuthState = {
  token: string | null;
  user: User;
  setAuth: (token: string | null, user: User) => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: storage.getString("token") ?? null,
  user: (() => { const raw = storage.getString("user"); return raw ? JSON.parse(raw) : null })(),
  setAuth: (token, user) => {
    if (token) storage.set("token", token); else storage.delete("token");
    if (user) storage.set("user", JSON.stringify(user)); else storage.delete("user");
    set({ token, user });
  }
}));
