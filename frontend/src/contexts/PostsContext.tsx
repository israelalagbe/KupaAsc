'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Post, User, AuthResponse } from '@/types/api';
import { apiClient } from '@/lib/api';

// State interface
interface PostsContextState {
  posts: Post[];
  user: User | null;
  isAuthenticated: boolean;
  loading: {
    posts: boolean;
    auth: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: {
    posts: string | null;
    auth: string | null;
    create: string | null;
    update: string | null;
    delete: string | null;
  };
}

// Action types
type PostsAction =
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'UPDATE_POST'; payload: Post }
  | { type: 'DELETE_POST'; payload: number }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: { type: keyof PostsContextState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { type: keyof PostsContextState['error']; value: string | null } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'LOGOUT' };

// Initial state
const initialState: PostsContextState = {
  posts: [],
  user: null,
  isAuthenticated: false,
  loading: {
    posts: false,
    auth: false,
    create: false,
    update: false,
    delete: false,
  },
  error: {
    posts: null,
    auth: null,
    create: null,
    update: null,
    delete: null,
  },
};

// Reducer
function postsReducer(state: PostsContextState, action: PostsAction): PostsContextState {
  switch (action.type) {
    case 'SET_POSTS':
      return { ...state, posts: action.payload };
    
    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] };
    
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.id ? action.payload : post
        ),
      };
    
    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload),
      };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.type]: action.payload.value },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: { ...state.error, [action.payload.type]: action.payload.value },
      };
    
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: {
          posts: null,
          auth: null,
          create: null,
          update: null,
          delete: null,
        },
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
      };
    
    default:
      return state;
  }
}

// Context interface
interface PostsContextValue extends PostsContextState {
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  
  // Posts actions
  fetchPosts: () => Promise<void>;
  fetchMyPosts: () => Promise<void>;
  createPost: (title: string, content: string, published?: boolean) => Promise<void>;
  updatePost: (id: number, title?: string, content?: string, published?: boolean) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  
  // Utility actions
  clearErrors: () => void;
  setInitialPosts: (posts: Post[]) => void;
}

// Create context
const PostsContext = createContext<PostsContextValue | undefined>(undefined);

// Provider component
interface PostsProviderProps {
  children: ReactNode;
  initialPosts?: Post[];
}

export function PostsProvider({ children, initialPosts = [] }: PostsProviderProps) {
  const [state, dispatch] = useReducer(postsReducer, {
    ...initialState,
    posts: initialPosts,
  });

  // Initialize user from localStorage on mount
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Posts actions (defined first to avoid circular dependency)
  const fetchPosts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { type: 'posts', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { type: 'posts', value: null } });
    
    try {
      const posts = await apiClient.getAllPosts();
      dispatch({ type: 'SET_POSTS', payload: posts });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { type: 'posts', value: error instanceof Error ? error.message : 'Failed to fetch posts' } 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { type: 'posts', value: false } });
    }
  }, []);

  // Automatically fetch posts when user becomes authenticated
  React.useEffect(() => {
    if (state.isAuthenticated) {
      fetchPosts();
    }
  }, [state.isAuthenticated, fetchPosts]);

  // Auth actions
  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: { type: 'auth', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { type: 'auth', value: null } });
    
    try {
      const response: AuthResponse = await apiClient.login({ email, password });
      
      // Store token and user data
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({ type: 'SET_USER', payload: response.user });
      // Posts will be fetched automatically by the useEffect when isAuthenticated becomes true
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { type: 'auth', value: error instanceof Error ? error.message : 'Login failed' } 
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { type: 'auth', value: false } });
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    dispatch({ type: 'SET_LOADING', payload: { type: 'auth', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { type: 'auth', value: null } });
    
    try {
      const response: AuthResponse = await apiClient.signup({ email, password, firstName, lastName });
      
      // Store token and user data
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({ type: 'SET_USER', payload: response.user });
      // Posts will be fetched automatically by the useEffect when isAuthenticated becomes true
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { type: 'auth', value: error instanceof Error ? error.message : 'Signup failed' } 
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { type: 'auth', value: false } });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const fetchMyPosts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { type: 'posts', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { type: 'posts', value: null } });
    
    try {
      const posts = await apiClient.getMyPosts();
      dispatch({ type: 'SET_POSTS', payload: posts });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { type: 'posts', value: error instanceof Error ? error.message : 'Failed to fetch your posts' } 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { type: 'posts', value: false } });
    }
  }, []);

  const createPost = useCallback(async (title: string, content: string, published = true) => {
    dispatch({ type: 'SET_LOADING', payload: { type: 'create', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { type: 'create', value: null } });
    
    try {
      await apiClient.createPost({ title, content, published });
      // Refresh all posts to get complete data with author information
      await fetchPosts();
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { type: 'create', value: error instanceof Error ? error.message : 'Failed to create post' } 
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { type: 'create', value: false } });
    }
  }, [fetchPosts]);

  const updatePost = useCallback(async (id: number, title?: string, content?: string, published?: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { type: 'update', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { type: 'update', value: null } });
    
    try {
      const updateData: { title?: string; content?: string; published?: boolean } = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (published !== undefined) updateData.published = published;
      
      const post = await apiClient.updatePost(id, updateData);
      dispatch({ type: 'UPDATE_POST', payload: post });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { type: 'update', value: error instanceof Error ? error.message : 'Failed to update post' } 
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { type: 'update', value: false } });
    }
  }, []);

  const deletePost = useCallback(async (id: number) => {
    dispatch({ type: 'SET_LOADING', payload: { type: 'delete', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { type: 'delete', value: null } });
    
    try {
      await apiClient.deletePost(id);
      dispatch({ type: 'DELETE_POST', payload: id });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { type: 'delete', value: error instanceof Error ? error.message : 'Failed to delete post' } 
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { type: 'delete', value: false } });
    }
  }, []);

  // Utility actions
  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const setInitialPosts = useCallback((posts: Post[]) => {
    dispatch({ type: 'SET_POSTS', payload: posts });
  }, []);

  const value: PostsContextValue = {
    ...state,
    login,
    signup,
    logout,
    fetchPosts,
    fetchMyPosts,
    createPost,
    updatePost,
    deletePost,
    clearErrors,
    setInitialPosts,
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
