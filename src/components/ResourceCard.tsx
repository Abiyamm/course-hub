'use client'

import { useUIStore } from '@/lib/store'
import { incrementDownloads } from '@/lib/supabase'
import type { Resource } from '@/lib/supabase'

const TYPE_META: Record<string, { icon: string; color: string; badge: string }> = {
  Exam:       { icon: '📝', color: 'rgba(124,110,245,.15)', badge: 'badge-purple' },
  Notes:      { icon: '📄', color: 'rgba(45,212,191,.12)',  badge: 'badge-teal'   },
  Textbook:   { icon: '📚', color: 'rgba(245,158,11,.1)',   badge: 'badge-amber'  },
  Assignment: { icon: '✏️', color: 'rgba(248,113,113,.1)',  badge: 'badge-red'    },
  Summary:    { icon: '📋', color: 'rgba(52,211,153,.12)',  badge: 'badge-green'  },
}

export default function ResourceCard({ resource }: { resource: Resource }) {
  const { openPDF } = useUIStore()
  const meta = TYPE_META[resource.type] || TYPE_META['Notes']

  function handleView() {
    if (resource.file_url) {
      openPDF(resource.title, resource.file_url)
      incrementDownloads(resource.id).catch(() => {})
    } else {
      openPDF(resource.title, '')
    }
  }

  return (
    <div className="resource-card" onClick={handleView}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: meta.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, marginBottom: 12,
      }}>{meta.icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{resource.title}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
        {resource.course} · by {resource.uploader_name}
      </div>
      <span className={`badge ${meta.badge}`}>{resource.type}</span>
      <div className="resource-footer">
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>⬇ {resource.downloads.toLocaleString()}</span>
        <span style={{ fontSize: 12, color: 'var(--amber)' }}>⭐ {resource.rating.toFixed(1)}</span>
        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}
          onClick={e => { e.stopPropagation(); handleView() }}>
          View PDF
        </button>
      </div>
    </div>
  )
}