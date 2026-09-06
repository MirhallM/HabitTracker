"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/auth-storage";

export type User = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  accessToken: string;
  user: User;
};

type AuthContextValue = {
  user: User | null;
  // true mientras se verifica si hay sesión guardada al cargar la app
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      if (!getToken()) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const me = await api<User>("/users/me");
        if (!cancelled) setUser(me);
      } catch {
        clearToken(); // token vencido o inválido
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadSession();

    // Si el componente se desmonta antes de que responda el backend,
    // evitamos actualizar estado de un componente que ya no existe.
    return () => {
      cancelled = true;
    };

    api<User>("/users/me")
      .then(setUser)
      .catch(() => clearToken()) // token vencido o inválido
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      skipAuth: true,
    });
    setToken(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await api<AuthResponse>("/auth/register", {
        method: "POST",
        body: { name, email, password },
        skipAuth: true,
      });
      setToken(data.accessToken);
      setUser(data.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para consumir el contexto desde cualquier componente cliente.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return context;
}
