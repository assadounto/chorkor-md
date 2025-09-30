import { create } from "zustand";
import { storage } from "@/lib/storage";

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};
export type DeliveryInfo = {
  name: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  notes?: string;
};

export type Order = {
  id: string; // reference
  items: OrderItem[];
  total: number;
  delivery: DeliveryInfo;
  paymentMethod: "COD"; // cash on delivery
  status: "pending" | "delivered" | "cancelled";
  createdAt: number;
};

type State = {
  orders: Order[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  add: (o: Omit<Order, "id" | "createdAt" | "status">) => Promise<Order>;
  clearAll: () => Promise<void>;
  updateStatus: (id: string, status: Order["status"]) => Promise<void>;
  getById: (id: string) => Order | undefined;
};

const KEY = "orders.v1";

async function save(orders: Order[]) {
  await storage.setString(KEY, JSON.stringify(orders));
}
export const useOrders = create<State>((set, get) => ({
  orders: [],
  hydrated: false,

  hydrate: async () => {
    const raw = await storage.getString(KEY);
    const orders: Order[] = raw ? JSON.parse(raw) : [];
    set({ orders, hydrated: true });
  },

  add: async (input) => {
    const id = "CMD-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const order: Order = {
      id,
      items: input.items,
      total: input.total,
      delivery: input.delivery,
      paymentMethod: "COD",
      status: "pending",
      createdAt: Date.now(),
    };
    const next = [...get().orders, order];
    set({ orders: next });
    await save(next);
    return order;
  },

  clearAll: async () => {
    set({ orders: [] });
    await save([]);
  },

  updateStatus: async (id, status) => {
    const list = get().orders.map((o) => (o.id === id ? { ...o, status } : o));
    set({ orders: list });
    await save(list);
  },

  getById: (id) => get().orders.find((o) => o.id === id),
}));
