'use client'

import { useEffect, useState } from 'react'
import './globals.css' // THIS WAS MISSING - Connects your variables and classes
import { supabase, getProfile } from '@/lib/supabase'
import { useAuthStore, useUIStore, useSubStore } from '@/lib/store'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import Notification from '@/components/Notification'
import AuthPage from '@/components/AuthPage'
import PDFViewer from '@/components/PDFViewer'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser, setProfile, setLoading, loading } = useAuthStore()
  const { notification } = useUIStore()
  const { setPlan } = useSubStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

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

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [setUser, setProfile, setPlan, setLoading])

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {!mounted ? null : loading ? (
          /* Loading State */
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', background: 'var(--bg)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--purple)', fontFamily: 'system-ui' }}>
                Loading Course Hub…
              </div>
            </div>
          </div>
        ) : !user ? (
          /* Login/Signup State */
          <AuthPage />
        ) : (
          /* Main App Dashboard State */
          <div className="app-shell"> 
            <Sidebar />
            <div className="main-area">
              <Topbar />
              <main className="page-content">
                {children}
              </main>
            </div>
            <PDFViewer />
            {notification && <Notification />}
          </div>
        )}
      </body>
    </html>
  )
}