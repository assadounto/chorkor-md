import { LOCAL_USERS, type User } from "./localData";
const db: { users: User[] } = { users: [...LOCAL_USERS] };
const delay = (ms=250) => new Promise(res=>setTimeout(res, ms));

export async function apiSignIn(email: string, password: string) {
  await delay();
  const u = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!u) throw new Error("Invalid credentials");
  return { token: `local.${u.id}.${Date.now()}`, user: { id: u.id, name: u.name, email: u.email } };
}
export async function apiRegister(name: string, email: string, password: string) {
  await delay();
  const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("Email already registered");
  const id = `u${Math.random().toString(36).slice(2,8)}`;
  const user: User = { id, name, email, password };
  db.users.push(user);
  return { token: `local.${id}.${Date.now()}`, user: { id, name, email } };
}

