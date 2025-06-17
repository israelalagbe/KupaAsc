import { Post, CreatePostDto, UpdatePostDto, AuthResponse, SignUpDto, LoginDto } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async signup(data: SignUpDto): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Posts endpoints
  async getAllPosts(): Promise<Post[]> {
    return this.fetchWithAuth('/posts');
  }

  async getMyPosts(): Promise<Post[]> {
    return this.fetchWithAuth('/posts/my-posts');
  }

  async getPost(id: number): Promise<Post> {
    return this.fetchWithAuth(`/posts/${id}`);
  }

  async createPost(data: CreatePostDto): Promise<Post> {
    return this.fetchWithAuth('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePost(id: number, data: UpdatePostDto): Promise<Post> {
    return this.fetchWithAuth(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePost(id: number): Promise<void> {
    return this.fetchWithAuth(`/posts/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

// Server-side data fetching functions (for server components)
export async function fetchPostsOnServer(): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    headers: {
      'Content-Type': 'application/json',
    },
    // Disable caching for development
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status}`);
  }

  return response.json();
}

export async function fetchPostOnServer(id: number): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch post: ${response.status}`);
  }

  return response.json();
}
