'use client'

import { useState } from 'react'

export default function BookmarkList({ bookmarks, onDelete, onUpdate, currentPage, itemsPerPage, onPageChange }) {
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', url: '' })

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

  const startEdit = (bookmark) => {
    setEditingId(bookmark.id)
    setEditForm({ title: bookmark.title, url: bookmark.url })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ title: '', url: '' })
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      await onUpdate(editingId, editForm)
      setEditingId(null)
      setEditForm({ title: '', url: '' })
    } catch (error) {
      alert('Failed to update bookmark')
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

  // Pagination calculations
  const totalPages = Math.ceil(bookmarks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBookmarks = bookmarks.slice(startIndex, endIndex)

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Your Bookmarks ({bookmarks.length})
        </h2>
        {totalPages > 1 && (
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>
      <div className="grid gap-4">
        {currentBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-4"
          >
            {editingId === bookmark.id ? (
              <form onSubmit={handleEdit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Title"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={editForm.url}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="URL"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
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

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(bookmark)}
                    className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit bookmark"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bookmark.id)}
                    disabled={deletingId === bookmark.id}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete bookmark"
                  >
                    {deletingId === bookmark.id ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
