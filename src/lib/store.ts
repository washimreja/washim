import type { ActivityProfile, GeoPlace, Plan, StoredUser, UserProfile } from "./types";
import { ACTIVITIES } from "./personalize";

const USERS_KEY = "skysense.users.v1";
const SESSION_KEY = "skysense.session.v1";
const PLANS_KEY = "skysense.plans.v1";

/* ---------- tiny digest (demo-grade, not crypto) ---------- */

function digest(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(12, "0");
}

export function hashPassword(pw: string): string {
  return digest(`skysense::${pw}::v1`);
}

/* ---------- helpers ---------- */

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

function defaultComfort() {
  return { heatC: 28, coldC: 5, rainTolerance: 35, windTolerance: 5, sunLove: 30, intensity: "steady" as const };
}

function defaultWeights(): Record<string, number> {
  const base: Record<string, number> = {};
  for (const a of ACTIVITIES) base[a.id] = 0.5;
  base.running = 0.85;
  base.photography = 0.7;
  base.indoor = 0.3;
  return base;
}

export function newUser(name: string, email: string): StoredUser {
  const profile: UserProfile = {
    id: `u_${Date.now().toString(36)}`,
    name,
    email,
    memberSince: Date.now(),
    homePlace: null,
    favorites: [],
    comfort: defaultComfort(),
    activityWeights: defaultWeights(),
    interactions: 0,
  };
  return { profile, passwordHash: "" };
}

/* ---------- users ---------- */

function loadUsers(): Record<string, StoredUser> {
  return readJson<Record<string, StoredUser>>(USERS_KEY, {});
}

function saveUsers(users: Record<string, StoredUser>): void {
  writeJson(USERS_KEY, users);
}

export function findUser(email: string): StoredUser | null {
  return loadUsers()[email.toLowerCase()] ?? null;
}

export function registerUser(name: string, email: string, password: string): StoredUser {
  const users = loadUsers();
  const key = email.toLowerCase();
  if (users[key]) throw new Error("An account with this email already exists — try signing in.");
  const user = newUser(name, email);
  user.passwordHash = hashPassword(password);
  users[key] = user;
  saveUsers(users);
  return user;
}

export function verifyPassword(user: StoredUser, password: string): boolean {
  return user.passwordHash === hashPassword(password);
}

export function updateUser(email: string, patch: (p: UserProfile) => UserProfile): StoredUser | null {
  const users = loadUsers();
  const key = email.toLowerCase();
  const existing = users[key];
  if (!existing) return null;
  existing.profile = patch(existing.profile);
  users[key] = existing;
  saveUsers(users);
  return existing;
}

/* ---------- session ---------- */

export function startSession(email: string): void {
  writeJson(SESSION_KEY, { email, at: Date.now() });
}

export function endSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function currentUser(): StoredUser | null {
  const session = readJson<{ email: string } | null>(SESSION_KEY, null);
  if (!session) return null;
  return findUser(session.email);
}

export function bootstrapUser(): StoredUser | null {
  // Auto-seed a demo account on first visit so the experience is instant.
  const users = loadUsers();
  const demoEmail = "demo@skysense.app";
  if (!users[demoEmail]) {
    const demo = newUser("Alex Rivera", demoEmail);
    demo.passwordHash = hashPassword("demo1234");
    users[demoEmail] = demo;
    saveUsers(users);
  }
  return currentUser();
}

/* ---------- plans ---------- */

function seedPlans(): Plan[] {
  const now = Date.now();
  const d = (offsetDays: number, hour: number): string => {
    const t = new Date(now + offsetDays * 86400_000);
    t.setHours(hour, 0, 0, 0);
    return t.toISOString();
  };
  return [
    {
      id: "p_seed_1",
      title: "Sunrise run — riverside loop",
      note: "Beat the heat, catch golden hour on the bridge. 8k easy pace.",
      when: d(1, 6),
      placeName: "Home",
      activity: "running",
      createdAt: now - 26 * 3600_000,
      shared: true,
    },
    {
      id: "p_seed_2",
      title: "Golden-hour photo walk",
      note: "Clouds look promising — bring the 35mm and a polarizer.",
      when: d(2, 18),
      placeName: "Old town",
      activity: "photography",
      createdAt: now - 5 * 3600_000,
      shared: false,
    },
  ];
}

export function listPlans(): Plan[] {
  const existing = readJson<Plan[] | null>(PLANS_KEY, null);
  if (!existing) {
    writeJson(PLANS_KEY, seedPlans());
    return seedPlans();
  }
  return existing;
}

export function savePlans(plans: Plan[]): void {
  writeJson(PLANS_KEY, plans);
}

export function addPlan(plan: Plan): Plan[] {
  const plans = [plan, ...listPlans()];
  savePlans(plans);
  return plans;
}

export function removePlan(id: string): Plan[] {
  const plans = listPlans().filter((p) => p.id !== id);
  savePlans(plans);
  return plans;
}

export function setPlanShared(id: string, shared: boolean): Plan[] {
  const plans = listPlans().map((p) => (p.id === id ? { ...p, shared } : p));
  savePlans(plans);
  return plans;
}

export function getPlan(id: string): Plan | null {
  return listPlans().find((p) => p.id === id) ?? null;
}

export function activityLabel(id: string): string {
  return ACTIVITIES.find((a: ActivityProfile) => a.id === id)?.label ?? id;
}

export function placeLabel(p: GeoPlace): string {
  return [p.name, p.admin1, p.country].filter(Boolean).join(", ");
}
