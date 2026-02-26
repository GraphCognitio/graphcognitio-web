import { createContext, useCallback, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import {
  clearStoredToken,
  clearStoredUser,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from "./authStorage";
import type { AuthResponse, AuthUser } from "./types/authTypes";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  persistAuth: (data: AuthResponse) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const persistAuth = useCallback((data: AuthResponse) => {
    setStoredToken(data.accessToken);
    setStoredUser(data.user);
    setToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    clearStoredUser();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      persistAuth,
      logout,
    }),
    [logout, persistAuth, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
