'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import BookmarkForm from '@/components/BookmarkForm'
import BookmarkList from '@/components/BookmarkList'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchBookmarks()
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    // Poll for changes every 2 seconds (fallback when realtime fails)
    const pollInterval = setInterval(() => {
      fetchBookmarks()
    }, 1500)

    // Subscribe to real-time changes
    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime event:', payload.eventType, payload)
          if (payload.eventType === 'INSERT') {
            setBookmarks((current) => [payload.new, ...current])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((current) =>
              current.filter((bookmark) => bookmark.id !== payload.old.id)
            )
          } else if (payload.eventType === 'UPDATE') {
            setBookmarks((current) =>
              current.map((bookmark) =>
                bookmark.id === payload.new.id ? payload.new : bookmark
              )
            )
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime connected - stopping polling')
          clearInterval(pollInterval)
        }
      })

    return () => {
      clearInterval(pollInterval)
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookmarks(data || [])
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/auth/logout'
    document.body.appendChild(form)
    form.submit()
  }

  const handleDeleteBookmark = async (id) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting bookmark:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">📚 My Bookmarks</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.full_name || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-600">
                {user.user_metadata?.full_name || user.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <BookmarkForm />
        </div>

        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookmarks...</p>
            </div>
          ) : (
            <BookmarkList bookmarks={bookmarks} onDelete={handleDeleteBookmark} />
          )}
        </div>
      </main>
    </div>
  )
}
