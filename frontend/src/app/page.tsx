'use client';

import { useState } from 'react';
import { usePosts } from '@/contexts/PostsContext';
import AuthForm from '@/components/AuthForm';
import CreatePostForm from '@/components/CreatePostForm';
import PostsList from '@/components/PostsList';
import UserProfile from '@/components/UserProfile';

export default function Home() {
  const { isAuthenticated, user, posts, loading, error, clearError } = usePosts();
  const [activeTab, setActiveTab] = useState<'all' | 'my-posts'>('all');

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Posts App</h1>
              <p className="text-sm text-gray-600">Share your thoughts with the world</p>
            </div>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Post Form */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Post</h2>
                <CreatePostForm />
              </div>
            </div>

            {/* Posts List */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'all'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      All Posts
                    </button>
                    <button
                      onClick={() => setActiveTab('my-posts')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'my-posts'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      My Posts
                    </button>
                  </nav>
                </div>

                {/* Posts Content */}
                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading posts...</span>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error loading posts</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{error}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={clearError}
                          className="text-red-400 hover:text-red-600"
                        >
                          <span className="sr-only">Dismiss</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <PostsList 
                      posts={posts} 
                      showOnlyUserPosts={activeTab === 'my-posts'}
                      currentUserId={user?.id}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
