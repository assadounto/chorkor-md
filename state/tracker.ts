import { create } from "zustand";
import { storage } from "@/lib/storage";

export type ReadingType = "bp" | "hr" | "steps" | "weight" | "sugar";

export type Reading =
  | { id: string; type: "bp"; sys: number; dia: number; createdAt: number }
  | {
      id: string;
      type: Exclude<ReadingType, "bp">;
      value: number;
      createdAt: number;
    };

type TrackerState = {
  items: Reading[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  add: (r: Omit<Reading, "id" | "createdAt">) => Promise<void>;
  lastOf: <T extends ReadingType>(type: T) => Reading | undefined;
  recentValues: (type: Exclude<ReadingType, "bp">, n?: number) => number[]; // last N values for sparkline
  recentBP: (n?: number) => { sys: number; dia: number }[];
};

const KEY = "tracker.v1";

async function save(items: Reading[]) {
  await storage.setString(KEY, JSON.stringify(items));
}

export const useTracker = create<TrackerState>((set, get) => ({
  items: [],
  hydrated: false,
  hydrate: async () => {
    const raw = await storage.getString(KEY);
    set({ items: raw ? JSON.parse(raw) : [], hydrated: true });
  },
  add: async (r) => {
    const item = {
      ...r,
      id: Math.random().toString(36).slice(2),
      createdAt: Date.now(),
    } as Reading;
    const next = [item, ...get().items].slice(0, 400); // keep latest 400
    set({ items: next });
    await save(next);
  },
  lastOf: (type) => get().items.find((i) => i.type === type),
  recentValues: (type, n = 12) =>
    get()
      .items.filter((i) => i.type === type)
      .slice(0, n)
      .reverse()
      .map((i: any) => i.value),
  recentBP: (n = 8) =>
    get()
      .items.filter((i) => i.type === "bp")
      .slice(0, n)
      .reverse()
      .map((i: any) => ({ sys: i.sys, dia: i.dia })),
}));
