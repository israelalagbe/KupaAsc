import { Post, CreatePostDto, UpdatePostDto } from '@/types/api';
import { BaseApiClient, serverFetch } from './api';

export class PostsService extends BaseApiClient {
  async getAll(): Promise<Post[]> {
    return this.get('/posts');
  }

  async getMy(): Promise<Post[]> {
    return this.get('/posts/my-posts');
  }

  async getById(id: number): Promise<Post> {
    return this.get(`/posts/${id}`);
  }

  async create(data: CreatePostDto): Promise<Post> {
    return this.post('/posts', data);
  }

  async update(id: number, data: UpdatePostDto): Promise<Post> {
    return this.patch(`/posts/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return this.del(`/posts/${id}`);
  }
}

export const postsService = new PostsService();

// Server-side data fetching functions
export const fetchPostsOnServer = (): Promise<Post[]> => 
  serverFetch('/posts', []);

export const fetchPostOnServer = (id: number): Promise<Post> => 
  serverFetch(`/posts/${id}`);
