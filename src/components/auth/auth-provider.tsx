"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type User = {
  id: string;
  email: string;
  name: string;
  workspace: string;
  createdAt: string;
};

type AuthState = {
  user: User | null;
  ready: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (input: { email: string; password: string }) => Promise<User>;
  signUp: (input: {
    email: string;
    password: string;
    name: string;
    workspace?: string;
  }) => Promise<User>;
  signOut: () => void;
};

const STORAGE_KEY = "hypero-session";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function deriveName(email: string) {
  const local = email.split("@")[0] ?? "User";
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, ready: false });

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const user = JSON.parse(raw) as User;
        setState({ user, ready: true });
        return;
      }
    } catch {
      // ignore
    }
    setState({ user: null, ready: true });
  }, []);

  const persist = useCallback((user: User | null) => {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async ({ email, password }) => {
      // Basic mock validation
      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }
      await delay(700);
      const user: User = {
        id: `usr_${Math.random().toString(36).slice(2, 10)}`,
        email,
        name: deriveName(email),
        workspace: "personal",
        createdAt: new Date().toISOString(),
      };
      persist(user);
      setState({ user, ready: true });
      return user;
    },
    [persist],
  );

  const signUp = useCallback<AuthContextValue["signUp"]>(
    async ({ email, password, name, workspace }) => {
      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address.");
      }
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }
      if (!name.trim()) {
        throw new Error("Please enter your full name.");
      }
      await delay(900);
      const user: User = {
        id: `usr_${Math.random().toString(36).slice(2, 10)}`,
        email,
        name: name.trim(),
        workspace: (workspace || name.split(" ")[0] || "team").toLowerCase(),
        createdAt: new Date().toISOString(),
      };
      persist(user);
      setState({ user, ready: true });
      return user;
    },
    [persist],
  );

  const signOut = useCallback(() => {
    persist(null);
    setState({ user: null, ready: true });
  }, [persist]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signIn, signUp, signOut }),
    [state, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
