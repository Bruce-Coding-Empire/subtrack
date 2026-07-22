import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

import {
  getStoredRefreshToken,
  login as loginRequest,
  logout as logoutRequest,
  refreshAccessToken,
  register as registerRequest,
  subscribeToSessionInvalidation,
} from "@/lib/auth";
import type { ApiResponse, AuthResponse, User } from "@/lib/types";

type SessionContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<ApiResponse<AuthResponse>>;
  signUp: (name: string, email: string, password: string) => Promise<ApiResponse<AuthResponse>>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const storedRefreshToken = await getStoredRefreshToken();
      const authenticated = storedRefreshToken ? await refreshAccessToken() : false;
      if (!cancelled) {
        setIsAuthenticated(authenticated);
        setIsLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return subscribeToSessionInvalidation(() => {
      setIsAuthenticated(false);
      setUser(null);
    });
  }, []);

  async function signIn(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const result = await loginRequest(email, password);
    if (result.success && result.data) {
      setUser(result.data.user);
      setIsAuthenticated(true);
    }
    return result;
  }

  async function signUp(
    name: string,
    email: string,
    password: string,
  ): Promise<ApiResponse<AuthResponse>> {
    const result = await registerRequest(name, email, password);
    if (result.success && result.data) {
      setUser(result.data.user);
      setIsAuthenticated(true);
    }
    return result;
  }

  async function signOut(): Promise<void> {
    await logoutRequest();
    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <SessionContext.Provider value={{ isAuthenticated, isLoading, user, signIn, signUp, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}
