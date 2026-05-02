import { getBlocksApiBaseUrl } from './blocks-api-base';
import { useAuthStore } from '@/state/store/auth';
import { getRefreshToken } from '@/modules/auth/services/auth.service';
import { isLocalhost } from './utils/localhost-checker/locahost-checker';
import { isPublicRoutePath } from '@/constant/auth-public-routes';

/**
 * HTTP Client Module
 *
 * A robust HTTP client utility that provides standardized methods for making API requests
 * with built-in error handling, authentication token management, and automatic token refresh.
 *
 * Features:
 * - Typed request/response handling with generics
 * - Standardized methods for GET, POST, PUT, DELETE operations
 * - Automatic handling of authentication token expiration
 * - Consistent error handling with custom HttpError class
 * - URL normalization for relative and absolute paths
 * - Configurable request headers
 * - Environment-based configuration
 *
 * @example
 * // GET request
 * const users = await clients.get<User[]>('users');
 *
 * // POST request with body
 * const newUser = await clients.post<User>(
 *   'users',
 *   JSON.stringify({ name: 'John', email: 'john@example.com' })
 * );
 *
 * // PUT request with custom headers
 * const updatedUser = await clients.put<User>(
 *   `users/${userId}`,
 *   JSON.stringify({ name: 'John Updated' }),
 *   { 'X-Custom-Header': 'value' }
 * );
 *
 * // DELETE request
 * const deleteResult = await clients.delete<{ success: boolean }>(`users/${userId}`);
 *
 * // Handling errors
 * try {
 *   const data = await clients.get<Data>('some-endpoint');
 *   // Process data
 * } catch (error) {
 *   if (error instanceof HttpError) {
 *     console.error(`API Error ${error.status}: ${error.message}`);
 *   }
 * }
 *
 * @note Requires environment variables:
 * - VITE_PUBLIC_BLOCKS_API_URL: Base URL for API requests
 * - VITE_X_BLOCKS_KEY: API key for authentication
 *
 */

interface Https {
  get<T>(url: string, headers?: HeadersInit): Promise<T>;
  post<T>(url: string, body: BodyInit, headers?: HeadersInit): Promise<T>;
  /** POST without injecting the session access token or attempting refresh on 401 (for public / visitor gateway calls). */
  postWithoutSessionRefresh<T>(url: string, body: BodyInit, headers?: HeadersInit): Promise<T>;
  put<T>(url: string, body: BodyInit, headers?: HeadersInit): Promise<T>;
  delete<T>(url: string, headers?: HeadersInit): Promise<T>;
  request<T>(url: string, options: RequestOptions): Promise<T>;
  createHeaders(headers: any): Headers;
  handleAuthError<T>(url: string, method: string, headers: any, body: any): Promise<T>;
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: HeadersInit;
  body?: BodyInit;
}

export class HttpError extends Error {
  status: number;
  error: Record<string, unknown>;

  constructor(status: number, error: Record<string, unknown>) {
    const errorMessage = typeof error.message === 'string' ? error.message : JSON.stringify(error);

    super(errorMessage);
    this.status = status;
    this.error = error;
  }
}

const BASE_URL = getBlocksApiBaseUrl();
const projectKey = import.meta.env.VITE_X_BLOCKS_KEY ?? '';
const localHostChecker = isLocalhost();

function loginPath(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/login`.replace(/([^:]\/)\/+/g, '$1');
}

/** Clear persisted auth and send the user to sign-in when refresh is no longer valid. */
export function clearSessionAndForceLogin(): void {
  useAuthStore.getState().logout();
  try {
    localStorage.removeItem('auth-storage');
  } catch {
    /* ignore */
  }
  const path = window.location.pathname;
  if (path.startsWith('/login') || isPublicRoutePath(path)) return;
  window.location.assign(loginPath());
}

function isInvalidRefreshTokenError(e: unknown): boolean {
  return (
    e instanceof HttpError &&
    typeof e.error === 'object' &&
    e.error !== null &&
    (e.error as { error?: string }).error === 'invalid_refresh_token'
  );
}

export const clients: Https = {
  async get<T>(url: string, headers: HeadersInit = {}): Promise<T> {
    return this.request<T>(url, { method: 'GET', headers });
  },

  async post<T>(url: string, body: BodyInit, headers: HeadersInit = {}): Promise<T> {
    return this.request<T>(url, { method: 'POST', headers, body });
  },

  async postWithoutSessionRefresh<T>(
    url: string,
    body: BodyInit,
    headers: HeadersInit = {}
  ): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}/${url.replace(/^\//, '')}`;

    const headerEntries =
      headers instanceof Headers ? Object.fromEntries(headers.entries()) : { ...headers };

    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      'x-blocks-key': projectKey,
      ...headerEntries,
    });

    const config: RequestInit = {
      method: 'POST',
      headers: requestHeaders,
      referrerPolicy: 'no-referrer',
      body,
    };

    if (!localHostChecker) {
      config.credentials = 'include';
    }

    try {
      const response = await fetch(fullUrl, config);

      if (response.ok) {
        return response.json() as Promise<T>;
      }

      let err;
      try {
        err = await response.json();
      } catch {
        err = { error: response.statusText || 'Request failed' };
      }
      throw new HttpError(response.status, err);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, { error: 'Network error' });
    }
  },

  async put<T>(url: string, body: BodyInit, headers: HeadersInit = {}): Promise<T> {
    return this.request<T>(url, { method: 'PUT', headers, body });
  },

  async delete<T>(url: string, headers: HeadersInit = {}): Promise<T> {
    return this.request<T>(url, { method: 'DELETE', headers });
  },

  async request<T>(url: string, { method, headers = {}, body }: RequestOptions): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}/${url.replace(/^\//, '')}`;

    const requestHeaders = this.createHeaders(headers);

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      referrerPolicy: 'no-referrer',
    };

    if (!localHostChecker) {
      config.credentials = 'include';
    }

    if (body) {
      config.body = body;
    }

    try {
      const response = await fetch(fullUrl, config);

      if (response.ok) {
        return response.json() as Promise<T>;
      }

      if (response.status === 401) {
        // Parse error response first to check if it's a login error
        let err;
        try {
          err = await response.json();
        } catch {
          err = { error: response.statusText || 'Unauthorized' };
        }

        // If error has error_description, it's likely a login error, throw it directly
        if (err.error_description) {
          throw new HttpError(response.status, err);
        }

        // Otherwise, try to refresh token
        return this.handleAuthError<T>(url, method, headers, body);
      }

      let err;
      try {
        err = await response.json();
      } catch {
        err = { error: response.statusText || 'Request failed' };
      }
      throw new HttpError(response.status, err);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, { error: 'Network error' });
    }
  },

  createHeaders(headers: any): Headers {
    const authToken = useAuthStore.getState().accessToken;

    const baseHeaders = {
      'Content-Type': 'application/json',
      'x-blocks-key': projectKey,
      ...(authToken && { Authorization: `bearer ${authToken}` }),
    };

    const headerEntries =
      headers instanceof Headers ? Object.fromEntries(headers.entries()) : headers;

    const newHeader = new Headers({
      ...baseHeaders,
      ...headerEntries,
    });
    return newHeader;
  },

  async handleAuthError<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    headers: any,
    body: any
  ): Promise<T> {
    const authStore = useAuthStore.getState();

    if (!authStore.refreshToken) {
      clearSessionAndForceLogin();
      throw new HttpError(401, { error: 'invalid_request' });
    }

    try {
      const refreshTokenRes = await getRefreshToken();

      if (refreshTokenRes.error === 'invalid_request') {
        clearSessionAndForceLogin();
        throw new HttpError(401, refreshTokenRes);
      }

      authStore.setAccessToken(refreshTokenRes.access_token);
      return this.request<T>(url, { method, headers, body });
    } catch (e) {
      if (isInvalidRefreshTokenError(e)) {
        clearSessionAndForceLogin();
      }
      throw e;
    }
  },
};
