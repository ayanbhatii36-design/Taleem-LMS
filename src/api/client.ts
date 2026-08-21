const TOKEN_KEY = 'taleem_lms_token';
const REFRESH_KEY = 'taleem_lms_refresh_token';
const USER_KEY = 'taleem_lms_user';

export const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  pagination?: { page: number; limit: number; total: number; total_pages?: number };
}

export interface AuthUser {
  id: string;
  institute_id: string;
  email: string;
  phone: string;
  full_name: string;
  role: string;
  permissions: string[];
  institute_name?: string;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// ---------------------------------------------------------- token storage
export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function storeSession(accessToken: string, refreshToken: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

// ------------------------------------------------------------- http client
let refreshing: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  const json = (await res.json()) as ApiResponse<{ token: string; refreshToken: string }>;
  if (!res.ok || !json.success || !json.data?.token) return null;
  localStorage.setItem(TOKEN_KEY, json.data.token);
  localStorage.setItem(REFRESH_KEY, json.data.refreshToken);
  return json.data.token;
}

export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}
): Promise<T> {
  const { method = 'GET', body, headers } = options;
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  const doFetch = async (token: string | null) => {
    const finalHeaders: Record<string, string> = {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    };
    if (token) finalHeaders.Authorization = `Bearer ${token}`;

    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });

    let json: ApiResponse<T>;
    try {
      json = (await res.json()) as ApiResponse<T>;
    } catch {
      throw new ApiError(`Invalid response from ${url}`, 'BAD_RESPONSE', res.status);
    }

    if (!json.success || !res.ok) {
      const err = json.error || { code: 'UNKNOWN', message: `Request failed (${res.status})` };
      throw new ApiError(err.message, err.code, res.status, err.details);
    }
    return json.data as T;
  };

  let token = getAccessToken();
  try {
    return await doFetch(token);
  } catch (err) {
    // One retry with a fresh token on 401
    if (err instanceof ApiError && err.status === 401 && token) {
      refreshing = refreshing || tryRefresh();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        try {
          return await doFetch(newToken);
        } catch {
          clearSession();
          throw err;
        }
      }
      clearSession();
    }
    throw err;
  }
}