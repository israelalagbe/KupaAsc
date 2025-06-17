'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { Post, User, AuthResponse } from '@/types/api';
import { apiClient } from '@/lib/api';

// Simplified state shape
interface State {
  posts: Post[];
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Simplified actions
type Action = 
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_POST'; payload: Post }
  | { type: 'DELETE_POST'; payload: number };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_POSTS': return { ...state, posts: action.payload };
    case 'SET_USER': return { ...state, user: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'UPDATE_POST': return { 
      ...state, 
      posts: state.posts.map(p => p.id === action.payload.id ? action.payload : p) 
    };
    case 'DELETE_POST': return { 
      ...state, 
      posts: state.posts.filter(p => p.id !== action.payload) 
    };
    default: return state;
  }
};

// Initial state
const initialState: State = {
  posts: [],
  user: null,
  loading: false,
  error: null,
};

// Context interface
interface PostsContextValue extends State {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  fetchPosts: () => Promise<void>;
  fetchMyPosts: () => Promise<void>;
  createPost: (title: string, content: string, published?: boolean) => Promise<void>;
  updatePost: (id: number, title?: string, content?: string, published?: boolean) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  clearError: () => void;
}

// Create context
const PostsContext = createContext<PostsContextValue | undefined>(undefined);

// Provider component
interface PostsProviderProps {
  children: ReactNode;
  initialPosts?: Post[];
}

export function PostsProvider({ children, initialPosts = [] }: PostsProviderProps) {
  const [state, dispatch] = useReducer(reducer, { ...initialState, posts: initialPosts });

  const isAuthenticated = Boolean(state.user);

  // Initialize user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        dispatch({ type: 'SET_USER', payload: JSON.parse(userData) });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Auto-fetch posts when authenticated
  const fetchPosts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const posts = await apiClient.getAllPosts();
      dispatch({ type: 'SET_POSTS', payload: posts });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch posts' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchPosts();
  }, [isAuthenticated, fetchPosts]);

  // Auth actions
  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response: AuthResponse = await apiClient.login({ email, password });
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response: AuthResponse = await apiClient.signup({ email, password, firstName, lastName });
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_POSTS', payload: [] });
  }, []);

  // Post actions
  const fetchMyPosts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const posts = await apiClient.getMyPosts();
      dispatch({ type: 'SET_POSTS', payload: posts });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch your posts' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createPost = useCallback(async (title: string, content: string, published = true) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await apiClient.createPost({ title, content, published });
      await fetchPosts(); // Refresh all posts
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create post';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [fetchPosts]);

  const updatePost = useCallback(async (id: number, title?: string, content?: string, published?: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (published !== undefined) updateData.published = published;
      
      const post = await apiClient.updatePost(id, updateData);
      dispatch({ type: 'UPDATE_POST', payload: post });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update post';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deletePost = useCallback(async (id: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await apiClient.deletePost(id);
      dispatch({ type: 'DELETE_POST', payload: id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete post';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const value: PostsContextValue = {
    ...state,
    isAuthenticated,
    login,
    signup,
    logout,
    fetchPosts,
    fetchMyPosts,
    createPost,
    updatePost,
    deletePost,
    clearError,
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}

// Hook to use the context
export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
}
