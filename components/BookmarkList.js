'use client'

import { useState } from 'react'

export default function BookmarkList({ bookmarks, onDelete }) {
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return
    
    setDeletingId(id)
    try {
      await onDelete(id)
    } catch (error) {
      console.error('Error deleting bookmark:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDomain = (url) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
        <p className="text-gray-600">Add your first bookmark using the form above</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Your Bookmarks ({bookmarks.length})
      </h2>
      <div className="grid gap-4">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1 truncate">
                    {bookmark.title}
                  </h3>
                  <p className="text-sm text-gray-500 truncate group-hover:text-indigo-500 transition-colors">
                    🔗 {getDomain(bookmark.url)}
                  </p>
                </a>
                <p className="text-xs text-gray-400 mt-2">
                  Added {formatDate(bookmark.created_at)}
                </p>
              </div>

              <button
                onClick={() => handleDelete(bookmark.id)}
                disabled={deletingId === bookmark.id}
                className="flex-shrink-0 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete bookmark"
              >
                {deletingId === bookmark.id ? 'Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
