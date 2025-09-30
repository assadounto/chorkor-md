// state/reminders.ts
import { create } from "zustand";
import { storage } from "@/lib/storage";
import {
  scheduleWeeklyReminders,
  cancelMany,
  listScheduled,
} from "@/lib/notifications";

export type Reminder = {
  id: string;
  name: string;
  dose: string;
  time: string; // "HH:MM"
  weekdays: number[]; // 1=Sun..7=Sat (empty => daily)
  notes?: string;
  enabled: boolean;
  notificationIds: string[];
};

type State = {
  items: Reminder[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  reconcileOnLaunch: () => Promise<void>;
  add: (
    r: Omit<Reminder, "id" | "notificationIds" | "enabled">
  ) => Promise<void>;
  update: (
    id: string,
    patch: Partial<Omit<Reminder, "id" | "notificationIds">>
  ) => Promise<void>;
  toggle: (id: string, enabled: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

const KEY = "reminders.v1";

async function save(items: Reminder[]) {
  await storage.setString(KEY, JSON.stringify(items));
}

export const useReminders = create<State>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: async () => {
    const raw = await storage.getString(KEY);
    const items: Reminder[] = raw ? JSON.parse(raw) : [];
    set({ items, hydrated: true });
    await get().reconcileOnLaunch(); // ensure schedules exist after cold start
  },

  reconcileOnLaunch: async () => {
    const items = get().items;
    if (!items.length) return;
    const scheduled = await listScheduled();
    if ((scheduled as any[]).length === 0) {
      const next: Reminder[] = [];
      for (const r of items) {
        if (r.enabled) {
          if (r.notificationIds?.length) await cancelMany(r.notificationIds);
          const body = r.dose ? `${r.name} — ${r.dose}` : r.name;
          const ids = await scheduleWeeklyReminders({
            time: r.time,
            weekdays: r.weekdays,
            title: "Medicine Reminder",
            body,
          });
          next.push({ ...r, notificationIds: ids });
        } else {
          // keep disabled, wipe stale ids
          if (r.notificationIds?.length) await cancelMany(r.notificationIds);
          next.push({ ...r, notificationIds: [] });
        }
      }
      set({ items: next });
      await save(next);
    }
  },

  add: async (input) => {
    const body = input.dose ? `${input.name} — ${input.dose}` : input.name;
    const notificationIds = await scheduleWeeklyReminders({
      time: input.time,
      weekdays: input.weekdays,
      title: "Medicine Reminder",
      body,
    });
    const item: Reminder = {
      id: Math.random().toString(36).slice(2),
      name: input.name,
      dose: input.dose,
      time: input.time,
      weekdays: input.weekdays,
      notes: input.notes,
      enabled: true,
      notificationIds,
    };
    const next = [...get().items, item];
    set({ items: next });
    await save(next);
  },

  update: async (id, patch) => {
    const items = get().items;
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return;

    let current = items[idx];
    const needsReschedule =
      current.enabled &&
      (patch.time !== undefined ||
        patch.weekdays !== undefined ||
        patch.name !== undefined ||
        patch.dose !== undefined);

    if (needsReschedule) {
      if (current.notificationIds.length)
        await cancelMany(current.notificationIds);
      const body =
        patch.dose ?? current.dose
          ? `${patch.name ?? current.name} — ${patch.dose ?? current.dose}`
          : patch.name ?? current.name;
      const ids = await scheduleWeeklyReminders({
        time: patch.time ?? current.time,
        weekdays: patch.weekdays ?? current.weekdays,
        title: "Medicine Reminder",
        body,
      });
      current = { ...current, ...patch, notificationIds: ids };
    } else {
      current = { ...current, ...patch };
    }

    const next = [...items];
    next[idx] = current;
    set({ items: next });
    await save(next);
  },

  toggle: async (id, enabled) => {
    const items = get().items;
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const r = items[idx];

    if (enabled && !r.enabled) {
      const body = r.dose ? `${r.name} — ${r.dose}` : r.name;
      const ids = await scheduleWeeklyReminders({
        time: r.time,
        weekdays: r.weekdays,
        title: "Medicine Reminder",
        body,
      });
      const nextItem = { ...r, enabled: true, notificationIds: ids };
      const next = [...items];
      next[idx] = nextItem;
      set({ items: next });
      await save(next);
    } else if (!enabled && r.enabled) {
      if (r.notificationIds.length) await cancelMany(r.notificationIds);
      const nextItem = { ...r, enabled: false, notificationIds: [] };
      const next = [...items];
      next[idx] = nextItem;
      set({ items: next });
      await save(next);
    }
  },

  remove: async (id) => {
    const items = get().items;
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const r = items[idx];
    if (r.notificationIds.length) await cancelMany(r.notificationIds);
    const next = items.filter((x) => x.id !== id);
    set({ items: next });
    await save(next);
  },
}));
