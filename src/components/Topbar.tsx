'use client'

import { useUIStore, useResourceStore } from '@/lib/store'

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  library:   'Library',
  search:    'Search',
  ai:        'AI Studio',
  social:    'Social',
  upload:    'Upload',
  analytics: 'Analytics',
  pricing:   'Upgrade to Premium',
}

export default function Topbar() {
  const { activePage, setActivePage } = useUIStore()
  const { setSearchQuery } = useResourceStore()

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setSearchQuery(q)
    if (q.length > 0) setActivePage('search')
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(15,17,23,.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {/* Page title */}
      <h1 style={{ fontSize: 18, fontWeight: 600, flex: 1, whiteSpace: 'nowrap' }}>
        {PAGE_TITLES[activePage] || activePage}
      </h1>

      {/* Search bar */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
        <span style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text3)', fontSize: 14, pointerEvents: 'none',
        }}>🔍</span>
        <input
          type="text"
          placeholder="Search courses, exams, notes…"
          onChange={handleSearch}
          style={{
            width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 12px 8px 34px', fontSize: 13,
            color: 'var(--text)', outline: 'none',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--purple)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* Notifications */}
      <div
        onClick={() => setActivePage('social')}
        style={{
          width: 36, height: 36, borderRadius: 8, background: 'var(--bg3)',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', position: 'relative', fontSize: 15,
        }}
        title="Notifications"
      >
        🔔
        <span style={{
          width: 8, height: 8, background: 'var(--red)', borderRadius: '50%',
          position: 'absolute', top: 5, right: 5, border: '2px solid var(--bg)',
        }} />
      </div>

      {/* Upload button */}
      <button
        className="btn btn-primary"
        onClick={() => setActivePage('upload')}
      >
        + Upload
      </button>
    </header>
  )
}