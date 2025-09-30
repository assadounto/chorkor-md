import { create } from "zustand";

export type Item = { id: string; name: string; price: number; qty: number };

type CartState = {
  items: Item[];
  add: (p: Omit<Item, "qty">) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  total: () => number;
  clear: () => void;
};

export const useCart = create<CartState>((set, get) => ({
  items: [],
  add: (p) =>
    set((s) => {
      const idx = s.items.findIndex((i) => i.id === p.id);
      if (idx >= 0) {
        const items = [...s.items];
        items[idx] = { ...items[idx], qty: items[idx].qty + 1 };
        return { items };
      }
      return { items: [...s.items, { ...p, qty: 1 }] };
    }),
  inc: (id) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
    })),
  dec: (id) =>
    set((s) => ({
      items: s.items.flatMap((i) =>
        i.id === id ? (i.qty > 1 ? [{ ...i, qty: i.qty - 1 }] : []) : [i]
      ),
    })),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
  clear: () => set({ items: [] }),
}));
