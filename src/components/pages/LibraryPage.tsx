'use client'
import { useState } from 'react'
import { useResourceStore } from '@/lib/store'
import ResourceCard from '@/components/ResourceCard'

const TYPES = ['All', 'Exam', 'Notes', 'Textbook', 'Assignment', 'Summary']

export function LibraryPage() {
  const { resources } = useResourceStore()
  const [active, setActive] = useState('All')
  const filtered = active === 'All' ? resources : resources.filter(r => r.type === active)

  return (
    <div>
      <div className="tabs">
        {TYPES.map(t => (
          <div key={t} className={`tab${active === t ? ' active' : ''}`} onClick={() => setActive(t)}>{t}</div>
        ))}
      </div>
      {filtered.length === 0
        ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>No resources found. Be the first to upload!</div>
        : <div className="grid3">{filtered.map(r => <ResourceCard key={r.id} resource={r} />)}</div>
      }
    </div>
  )
}
export default LibraryPage