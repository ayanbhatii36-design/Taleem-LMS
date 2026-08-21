import { apiRequest, AuthUser, ApiResponse } from './client';

export interface LoginResult {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

export interface MeResult {
  user: AuthUser & { avatar_url?: string; last_login_at?: string | null };
  institute?: {
    id: string;
    name: string;
    code: string;
    phone: string;
    email: string;
    address?: string;
    city: string;
    province: string;
    currency: string;
    is_active: boolean;
  } | null;
  profileDetails?: Record<string, unknown>;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: 'principal' | 'teacher' | 'student' | 'parent';
  instituteCode?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  guardian_name?: string;
  guardian_phone?: string;
  designation?: string;
  qualification?: string;
}

export const authApi = {
  async login(emailOrPhone: string, password: string, instituteCode?: string): Promise<LoginResult> {
    return apiRequest<LoginResult>('/auth/login', {
      method: 'POST',
      body: { emailOrPhone, password, instituteCode }
    });
  },

  async register(payload: RegisterPayload): Promise<LoginResult> {
    return apiRequest<LoginResult>('/auth/register', {
      method: 'POST',
      body: payload
    });
  },

  async me(): Promise<MeResult> {
    return apiRequest<MeResult>('/auth/me');
  },

  async logout(): Promise<null> {
    try {
      return await apiRequest<null>('/auth/logout', { method: 'POST' });
    } catch {
      return null;
    }
  },

  async resetPassword(email: string, newPassword: string): Promise<null> {
    return apiRequest<null>('/auth/reset-password', {
      method: 'POST',
      body: { email, newPassword }
    });
  },

  async refresh(): Promise<{ token: string; refreshToken: string }> {
    return apiRequest('/auth/refresh', {
      method: 'POST',
      body: { refreshToken: localStorage.getItem('taleem_lms_refresh_token') }
    });
  }
};

export type { ApiResponse };