import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  bootstrapUser,
  endSession,
  findUser,
  registerUser,
  startSession,
  updateUser,
  verifyPassword,
} from "@/lib/store";
import type { StoredUser, UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: UserProfile | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (name: string, email: string, password: string) => Promise<UserProfile>;
  signOut: () => void;
  updateProfile: (patch: (p: UserProfile) => UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = bootstrapUser();
    setStored(u);
    setReady(true);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const u = findUser(email);
    if (!u) throw new Error("No account found for that email — try creating one.");
    if (!verifyPassword(u, password)) throw new Error("Incorrect password. Please try again.");
    startSession(u.profile.email);
    setStored(u);
    return u.profile;
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const u = registerUser(name, email, password);
    startSession(u.profile.email);
    setStored(u);
    return u.profile;
  }, []);

  const signOut = useCallback(() => {
    endSession();
    setStored(null);
  }, []);

  const updateProfile = useCallback((patch: (p: UserProfile) => UserProfile) => {
    setStored((prev) => {
      if (!prev) return prev;
      const next = updateUser(prev.profile.email, patch) ?? prev;
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: stored?.profile ?? null,
      ready,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }),
    [stored, ready, signIn, signUp, signOut, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
