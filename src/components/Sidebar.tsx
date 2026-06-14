'use client'

import { useAuthStore, useUIStore, useSubStore } from '@/lib/store'
import { signOut } from '@/lib/supabase'

const NAV = [
  { section: 'Main' },
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'library',   label: 'Library',   icon: '📚' },
  { id: 'search',    label: 'Search',    icon: '🔍' },
  { section: 'AI Tools' },
  { id: 'ai',        label: 'AI Studio', icon: '🤖', badge: 'AI' },
  { section: 'Community' },
  { id: 'social',    label: 'Social',    icon: '💬', badge: '3' },
  { section: 'Manage' },
  { id: 'upload',    label: 'Upload',    icon: '⬆' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { section: 'Account' },
  { id: 'pricing',   label: 'Upgrade',   icon: '⭐', badgeColor: 'var(--amber)', badge: 'PRO' },
]

export default function Sidebar() {
  const { profile } = useAuthStore()
  const { activePage, setActivePage } = useUIStore()
  const { plan } = useSubStore()

  async function handleLogout() {
    await signOut()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, width: 'var(--sidebar-w)', height: '100vh',
      background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', zIndex: 100, overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, fontSize: 18, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--purple), var(--teal))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>📚</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Course Hub</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase' }}>Ethiopian Universities</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {NAV.map((item, i) => {
          if ('section' in item) {
            return (
              <div key={i} style={{
                fontSize: 10, color: 'var(--text3)', letterSpacing: 1,
                textTransform: 'uppercase', padding: '10px 10px 4px', marginTop: i > 0 ? 4 : 0,
              }}>{item.section}</div>
            )
          }
          const active = activePage === item.id
          return (
            <div key={item.id} onClick={() => setActivePage(item.id!)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 8, cursor: 'pointer', fontSize: 14, margin: '1px 0',
              transition: 'all .15s',
              background: active ? 'rgba(124,110,245,.15)' : 'transparent',
              color: active ? 'var(--purple)' : 'var(--text2)',
              fontWeight: active ? 500 : 400,
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg3)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: item.badgeColor || 'var(--purple)', color: '#fff',
                  fontSize: 10, padding: '1px 6px', borderRadius: 10, fontWeight: 600,
                }}>{item.badge}</span>
              )}
            </div>
          )
        })}
      </nav>

      {/* Plan badge */}
      {plan !== 'free' && (
        <div style={{ margin: '0 14px 10px', padding: '8px 12px', borderRadius: 8, background: 'rgba(124,110,245,.1)', border: '1px solid rgba(124,110,245,.2)', fontSize: 12, color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>⭐</span>
          <span style={{ fontWeight: 600 }}>{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</span>
        </div>
      )}

      {/* User card */}
      <div style={{ padding: 14, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div
          onClick={handleLogout}
          title="Click to sign out"
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: 8,
            borderRadius: 8, cursor: 'pointer', transition: 'background .15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--purple), var(--teal))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: '#fff',
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.full_name || 'User'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>
              {profile?.role || 'student'} · {(profile?.university || '').replace(' University', '')}
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>→</span>
        </div>
      </div>
    </aside>
  )
}