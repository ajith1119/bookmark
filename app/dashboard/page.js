'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import BookmarkForm from '@/components/BookmarkForm'
import BookmarkList from '@/components/BookmarkList'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const fetchBookmarks = useCallback(async () => {
    if (!user) return
    
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
  }, [user, supabase])

  useEffect(() => {
    if (!user) return

    let isSubscribed = true

    // Fetch initial bookmarks
    fetchBookmarks()

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`bookmarks-${user.id}`, {
        config: {
          broadcast: { self: false },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (!isSubscribed) return
          
          console.log('🔔 Realtime event:', payload.eventType, payload)
          
          if (payload.eventType === 'INSERT') {
            setBookmarks((current) => {
              // Avoid duplicates
              if (current.some(b => b.id === payload.new.id)) return current
              return [payload.new, ...current]
            })
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ DELETE event received, removing bookmark:', payload.old)
            setBookmarks((current) =>
              current.filter((bookmark) => bookmark.id !== payload.old.id)
            )
          } else if (payload.eventType === 'UPDATE') {
            console.log('✏️ UPDATE event received:', payload.new)
            setBookmarks((current) =>
              current.map((bookmark) =>
                bookmark.id === payload.new.id ? payload.new : bookmark
              )
            )
          }
        }
      )
      .subscribe((status) => {
        if (!isSubscribed) return
        
        console.log('Realtime subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connected successfully')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime connection error')
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Realtime connection timed out')
        }
      })

    return () => {
      isSubscribed = false
      channel.unsubscribe()
    }
  }, [user, supabase, fetchBookmarks])

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

  const handleUpdateBookmark = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating bookmark:', error)
      throw error
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
            <BookmarkList 
              bookmarks={bookmarks} 
              onDelete={handleDeleteBookmark}
              onUpdate={handleUpdateBookmark}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </main>
    </div>
  )
}
