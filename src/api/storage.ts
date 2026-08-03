const TOKEN_KEY = 'paqueteria_token';
const USER_KEY = 'paqueteria_user';

let memoryToken = '';

try {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_KEY);
  }
} catch {
  /* ignore */
}

export function getToken(): string {
  return memoryToken;
}

export function setToken(token: string): void {
  memoryToken = token;
}

export function clearToken(): void {
  memoryToken = '';
}

export function getUser<T = unknown>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setUser(user: unknown): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}
