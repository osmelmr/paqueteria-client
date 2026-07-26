const TOKEN_KEY = 'paqueteria_token';
const USER_KEY = 'paqueteria_user';

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser<T = unknown>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: unknown): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}
