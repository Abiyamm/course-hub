'use client'

import { useEffect, useState } from 'react'
import { supabase, getProfile } from '@/lib/supabase'
import { useAuthStore, useUIStore, useSubStore } from '@/lib/store'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import Notification from '@/components/Notification'
import AuthPage from '@/components/AuthPage'
import PDFViewer from '@/components/PDFViewer'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser, setProfile, setLoading, loading } = useAuthStore()
  const { notification } = useUIStore()
  const { setPlan } = useSubStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        const profile = await getProfile(session.user.id)
        if (profile) {
          setProfile(profile)
          setPlan(profile.subscription || 'free')
        }
      }
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          const profile = await getProfile(session.user.id)
          if (profile) {
            setProfile(profile)
            setPlan(profile.subscription || 'free')
          }
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Prevent hydration mismatch — don't render until mounted on client
  if (!mounted) return null

  // Show loading spinner
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--purple)', fontFamily: 'system-ui' }}>
            Loading Course Hub…
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
            <div className="dot-pulse"><span /><span /><span /></div>
          </div>
        </div>
      </div>
    )
  }

  // Not logged in — show auth page
  if (!user) {
    return <AuthPage />
  }

  // Logged in — show full app
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-w)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Topbar />
        <main style={{ flex: 1, padding: 24, animation: 'fadeIn .2s ease' }}>
          {children}
        </main>
      </div>
      <PDFViewer />
      {notification && <Notification />}
    </div>
  )
}