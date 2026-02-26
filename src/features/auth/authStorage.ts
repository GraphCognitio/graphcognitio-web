import type { AuthUser } from "./types/authTypes";

const TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

function hasWindow() {
  return typeof window !== "undefined";
}

export function getStoredToken() {
  if (!hasWindow()) {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (!hasWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user: AuthUser) {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.removeItem(USER_KEY);
}
