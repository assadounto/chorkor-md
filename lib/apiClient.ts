/**
 * Local mocked API: in-memory persistence via MMKV.
 * Swap with real Rails endpoints later by replacing implementations.
 */
import { storage } from "@/app/_layout";
import { LOCAL_USERS, type User, MEDICINES, DOCTORS } from "./localData";

function delay(ms=300){ return new Promise(res=>setTimeout(res, ms)); }

export async function apiSignIn(email: string, password: string) {
  await delay();
  const u = LOCAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!u) throw new Error("Invalid credentials");
  const token = `local.${u.id}.${Date.now()}`;
  storage.set("token", token);
  storage.set("user", JSON.stringify({ id: u.id, name: u.name, email: u.email }));
  return { token, user: { id: u.id, name: u.name, email: u.email } };
}

export async function apiRegister(name: string, email: string, password: string) {
  await delay();
  const exists = LOCAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("Email already registered");
  const id = `u${Math.random().toString(36).slice(2,8)}`;
  const user: User = { id, name, email, password };
  const db = JSON.parse(storage.getString("local_users") || "[]");
  db.push(user);
  storage.set("local_users", JSON.stringify(db));
  const token = `local.${id}.${Date.now()}`;
  storage.set("token", token);
  storage.set("user", JSON.stringify({ id, name, email }));
  return { token, user: { id, name, email } };
}

export async function apiMe() {
  await delay(150);
  const raw = storage.getString("user");
  if (!raw) throw new Error("Not authenticated");
  return JSON.parse(raw);
}

export async function apiLogout() {
  await delay(100);
  storage.delete("token"); storage.delete("user");
}

export async function apiMedicines() { await delay(200); return MEDICINES; }
export async function apiDoctors() { await delay(200); return DOCTORS; }

// Checkout stubs
export async function apiCheckout(payload: any) {
  await delay(400);
  // Return a fake redirect url-like string
  return { checkout_url: "https://pay.example.local/preview", reference: "TESTREF" };
}
