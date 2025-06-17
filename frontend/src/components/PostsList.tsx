'use client';

import React, { useState } from 'react';
import { Post } from '@/types/api';
import { usePosts } from '@/contexts/PostsContext';

interface PostsListProps {
  posts: Post[];
  showOnlyUserPosts: boolean;
  currentUserId?: number;
}

interface EditingPost {
  id: number;
  title: string;
  content: string;
  published: boolean;
}

export default function PostsList({ posts, showOnlyUserPosts, currentUserId }: PostsListProps) {
  const { updatePost, deletePost, loading, clearError } = usePosts();
  const [editingPost, setEditingPost] = useState<EditingPost | null>(null);

  // Filter posts based on the current tab
  const filteredPosts = showOnlyUserPosts 
    ? posts.filter(post => post.authorId === currentUserId)
    : posts;

  const handleEdit = (post: Post) => {
    setEditingPost({
      id: post.id,
      title: post.title,
      content: post.content,
      published: post.published,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    clearError(); // Clear any previous errors
    try {
      await updatePost(
        editingPost.id,
        editingPost.title,
        editingPost.content,
        editingPost.published
      );
      setEditingPost(null);
    } catch (error) {
      // Error handled by context
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      clearError(); // Clear any previous errors
      try {
        await deletePost(id);
      } catch (error) {
        // Error handled by context
      }
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingPost) return;

    const { name, value, type } = e.target;
    setEditingPost(prev => ({
      ...prev!,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showOnlyUserPosts ? 'No posts from you yet' : 'No posts available'}
          </h3>
          <p className="text-gray-500">
            {showOnlyUserPosts 
              ? 'Create your first post to get started.' 
              : 'Be the first to create a post!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredPosts.map((post) => (
        <div key={post.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          {editingPost && editingPost.id === post.id ? (
            // Edit Mode
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={editingPost.title}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  name="content"
                  value={editingPost.content}
                  onChange={handleEditInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="published"
                  checked={editingPost.published}
                  onChange={handleEditInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Published
                </label>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      by {post.author.firstName} {post.author.lastName}
                    </span>
                    <span>•</span>
                    <span>{formatDate(post.createdAt)}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      post.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                {currentUserId === post.authorId && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                    >
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
              </div>
              
              {post.updatedAt !== post.createdAt && (
                <div className="mt-3 text-xs text-gray-400">
                  Updated {formatDate(post.updatedAt)}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
