const TOKEN_KEY = "streamforge_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ContentItem {
  id: string;
  title: string;
  synopsis: string | null;
  kind: string;
  genres: string[];
  rating: number | null;
  year: number | null;
  maturity: string | null;
  video_url: string | null;
  duration_min: number | null;
  thumbnail: string | null;
}

export interface Row {
  id: string;
  title: string;
  items: ContentItem[];
}

async function http<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(path, { ...opts, headers });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (body as { error?: { message?: string } }).error?.message ??
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body as T;
}

export const api = {
  health: () => http<{ ok: boolean }>("/api/health"),

  // auth
  register: (data: { email: string; password: string; name: string }) =>
    http<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    http<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => http<{ user: User }>("/api/auth/me"),

  // catalog
  rows: () => http<{ rows: Row[] }>("/api/content/rows"),
  content: (id: string) =>
    http<{ data: ContentItem & { related: ContentItem[] } }>(`/api/content/${id}`),
  search: (q: string) =>
    http<{ data: ContentItem[] }>(`/api/content?q=${encodeURIComponent(q)}`),
  list: (kind?: string, genre?: string) => {
    const p = new URLSearchParams();
    if (kind) p.set("kind", kind);
    if (genre) p.set("genre", genre);
    return http<{ data: ContentItem[] }>(`/api/content?${p.toString()}`);
  },

  // lists
  watchlist: () => http<{ data: ContentItem[] }>("/api/list/watchlist"),
  favorites: () => http<{ data: ContentItem[] }>("/api/list/favorites"),
  addWatchlist: (id: string) => http(`/api/list/watchlist/${id}`, { method: "POST" }),
  removeWatchlist: (id: string) => http(`/api/list/watchlist/${id}`, { method: "DELETE" }),
  addFavorite: (id: string) => http(`/api/list/favorites/${id}`, { method: "POST" }),
  removeFavorite: (id: string) => http(`/api/list/favorites/${id}`, { method: "DELETE" }),
}