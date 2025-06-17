'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { Post, User, AuthResponse } from '@/types/api';
import { authService, postsService } from '@/services';

interface State {
  posts: Post[];
  user: User | null;
  loading: boolean;
  error: string | null;
}

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

const initialState: State = {
  posts: [],
  user: null,
  loading: false,
  error: null,
};

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

const PostsContext = createContext<PostsContextValue | undefined>(undefined);

interface PostsProviderProps {
  children: ReactNode;
  initialPosts?: Post[];
}

export function PostsProvider({ children, initialPosts = [] }: PostsProviderProps) {
  const [state, dispatch] = useReducer(reducer, { ...initialState, posts: initialPosts });

  const isAuthenticated = Boolean(state.user);

  const withAsyncHandler = useCallback(async (
    action: () => Promise<void>,
    errorMessage: string
  ) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await action();
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage;
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const handleAuthSuccess = useCallback((response: AuthResponse) => {
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    dispatch({ type: 'SET_USER', payload: response.user });
  }, []);

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

    const fetchPosts = useCallback(() => withAsyncHandler(
    async () => {
      const posts = await postsService.getAll();
      dispatch({ type: 'SET_POSTS', payload: posts });
    },
    'Failed to fetch posts'
  ), [withAsyncHandler]);

  const fetchMyPosts = useCallback(() => withAsyncHandler(
    async () => {
      const posts = await postsService.getMy();
      dispatch({ type: 'SET_POSTS', payload: posts });
    },
    'Failed to fetch your posts'
  ), [withAsyncHandler]);

  const login = useCallback((email: string, password: string) => withAsyncHandler(
    async () => {
      const response = await authService.login({ email, password });
      handleAuthSuccess(response);
    },
    'Login failed'
  ), [withAsyncHandler, handleAuthSuccess]);

  const signup = useCallback((email: string, password: string, firstName: string, lastName: string) => withAsyncHandler(
    async () => {
      const response = await authService.signup({ email, password, firstName, lastName });
      handleAuthSuccess(response);
    },
    'Signup failed'
  ), [withAsyncHandler, handleAuthSuccess]);

  const createPost = useCallback((title: string, content: string, published = true) => withAsyncHandler(
    async () => {
      await postsService.create({ title, content, published });
      await fetchPosts();
    },
    'Failed to create post'
  ), [withAsyncHandler, fetchPosts]);

  const updatePost = useCallback((id: number, title?: string, content?: string, published?: boolean) => withAsyncHandler(
    async () => {
      const updateData: Record<string, any> = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (published !== undefined) updateData.published = published;
      const post = await postsService.update(id, updateData);
      dispatch({ type: 'UPDATE_POST', payload: post });
    },
    'Failed to update post'
  ), [withAsyncHandler]);

  const deletePost = useCallback((id: number) => withAsyncHandler(
    async () => {
      await postsService.delete(id);
      dispatch({ type: 'DELETE_POST', payload: id });
    },
    'Failed to delete post'
  ), [withAsyncHandler]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_POSTS', payload: [] });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchPosts();
  }, [isAuthenticated, fetchPosts]);

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

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
}
