// state/reminders.ts
import { create } from "zustand";
import { storage } from "@/lib/storage";

export type Reminder = {
  id: string;
  name: string;
  dose: string;
  time: string; // "HH:MM"
  weekdays: number[]; // 1=Sun..7=Sat (empty => daily)
  notes?: string;
  enabled: boolean; // kept for UI toggles, but no system scheduling anymore
};

type State = {
  items: Reminder[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  // kept as a no-op to avoid refactor elsewhere if it's called
  reconcileOnLaunch: () => Promise<void>;
  add: (r: Omit<Reminder, "id" | "enabled">) => Promise<void>;
  update: (id: string, patch: Partial<Omit<Reminder, "id">>) => Promise<void>;
  toggle: (id: string, enabled: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

const KEY = "reminders.v1";

async function save(items: Reminder[]) {
  await storage.setString(KEY, JSON.stringify(items));
}

// Helper: migrate any legacy saved items by stripping notificationIds etc.
function migrate(rawItems: any[]): Reminder[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.map((r) => {
    const {
      id,
      name,
      dose,
      time,
      weekdays,
      notes,
      enabled,
      // legacy fields to discard: notificationIds, anything else
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      notificationIds,
      ...rest
    } = r ?? {};
    return {
      id: String(id ?? Math.random().toString(36).slice(2)),
      name: String(name ?? ""),
      dose: String(dose ?? ""),
      time: String(time ?? "08:00"),
      weekdays: Array.isArray(weekdays) ? weekdays : [],
      notes: notes ? String(notes) : undefined,
      enabled: Boolean(enabled ?? true),
      // ignore rest (unknown legacy keys)
    } as Reminder;
  });
}

export const useReminders = create<State>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: async () => {
    const raw = await storage.getString(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const items = migrate(parsed);
    set({ items, hydrated: true });
    // previously ensured OS schedules; now a no-op
    await get().reconcileOnLaunch();
  },

  // No system scheduling anymore — left here as a safe no-op
  reconcileOnLaunch: async () => {
    return;
  },

  add: async (input) => {
    const item: Reminder = {
      id: Math.random().toString(36).slice(2),
      name: input.name,
      dose: input.dose,
      time: input.time,
      weekdays: input.weekdays,
      notes: input.notes,
      enabled: true, // default to enabled in local state only
    };
    const next = [...get().items, item];
    set({ items: next });
    await save(next);
  },

  update: async (id, patch) => {
    const items = get().items;
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return;

    const current = items[idx];
    const nextItem: Reminder = { ...current, ...patch };

    const next = [...items];
    next[idx] = nextItem;
    set({ items: next });
    await save(next);
  },

  toggle: async (id, enabled) => {
    const items = get().items;
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return;

    const nextItem = { ...items[idx], enabled };
    const next = [...items];
    next[idx] = nextItem;
    set({ items: next });
    await save(next);
  },

  remove: async (id) => {
    const items = get().items;
    const next = items.filter((x) => x.id !== id);
    set({ items: next });
    await save(next);
  },
}));
