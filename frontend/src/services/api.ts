const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Base API client with HTTP method abstractions
export class BaseApiClient {
  constructor(protected baseUrl: string = API_BASE_URL) {}

  private async request<T>(url: string, options: RequestInit = {}, requireAuth = true): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    // Add auth token if required
    if (requireAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string>) },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) return undefined as T;
    
    const text = await response.text();
    return text.trim() ? JSON.parse(text) : undefined as T;
  }

  protected async get<T>(url: string, requireAuth = true): Promise<T> {
    return this.request<T>(url, { method: 'GET' }, requireAuth);
  }

  protected async post<T>(url: string, data?: any, requireAuth = true): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request<T>(url, { method: 'POST', body }, requireAuth);
  }

  protected async patch<T>(url: string, data?: any, requireAuth = true): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request<T>(url, { method: 'PATCH', body }, requireAuth);
  }

  protected async del<T>(url: string, requireAuth = true): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' }, requireAuth);
  }
}
