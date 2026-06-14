'use client'

import { useUIStore } from '@/lib/store'

export default function Notification() {
  const { notification, clearNotification } = useUIStore()
  if (!notification) return null

  const colors = {
    success: { bg: 'rgba(52,211,153,.12)',  border: 'rgba(52,211,153,.4)',  color: 'var(--green)',  icon: '✅' },
    error:   { bg: 'rgba(248,113,113,.12)', border: 'rgba(248,113,113,.4)', color: 'var(--red)',    icon: '❌' },
    info:    { bg: 'rgba(124,110,245,.12)', border: 'rgba(124,110,245,.4)', color: 'var(--purple)', icon: 'ℹ️' },
  }
  const c = colors[notification.type]

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12,
      padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
      maxWidth: 360, boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      animation: 'fadeIn .3s ease',
    }}>
      <span>{c.icon}</span>
      <span style={{ fontSize: 13, color: c.color, flex: 1 }}>{notification.message}</span>
      <button
        onClick={clearNotification}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, fontSize: 16, padding: 0 }}
      >×</button>
    </div>
  )
}