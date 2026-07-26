export function getToken(): string {
  return window.localStorage.getItem('paqueteria_token') || '';
}

export function setToken(token: string): void {
  window.localStorage.setItem('paqueteria_token', token);
}

export function clearToken(): void {
  window.localStorage.removeItem('paqueteria_token');
}

export function setUser(user: unknown): void {
  window.localStorage.setItem('paqueteria_user', JSON.stringify(user));
}

export function getUser(): unknown {
  const raw = window.localStorage.getItem('paqueteria_user');
  return raw ? JSON.parse(raw) : null;
}

export function clearUser(): void {
  window.localStorage.removeItem('paqueteria_user');
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function api<T = unknown>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.message || data?.error?.message || res.statusText || 'Request failed');
  }
  return data as T;
}
