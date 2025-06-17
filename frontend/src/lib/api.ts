import { Post, CreatePostDto, UpdatePostDto, AuthResponse, SignUpDto, LoginDto } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

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

    // Handle empty responses (like DELETE operations)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    const text = await response.text();
    if (!text.trim()) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn('Failed to parse JSON response:', text);
      return null;
    }
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
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Disable caching for development
      cache: 'no-store'
    });

    if (!response.ok) {
      // If posts require authentication, return empty array for server-side rendering
      if (response.status === 401) {
        console.warn('Posts require authentication, returning empty array for SSR');
        return [];
      }
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching posts on server:', error);
    // Return empty array for server-side rendering when there's an error
    return [];
  }
}

export async function fetchPostOnServer(id: number): Promise<Post> {
  try {
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
  } catch (error) {
    console.error('Error fetching post on server:', error);
    throw error; // Re-throw for individual posts since they're typically accessed directly
  }
}
