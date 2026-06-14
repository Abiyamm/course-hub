'use client'
import { useResourceStore } from '@/lib/store'
import ResourceCard from '@/components/ResourceCard'

const FILTERS = ['All', 'Exam', 'Notes', 'Textbook', 'Summary']

export function SearchPage() {
  const { filteredResources, searchQuery, activeFilter, setSearchQuery, setActiveFilter } = useResourceStore()

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search exams, notes, textbooks…"
        style={{
          width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '12px 16px', fontSize: 15,
          color: 'var(--text)', outline: 'none', marginBottom: 20,
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--purple)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        autoFocus
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {FILTERS.map(f => (
          <div key={f}
            className={`filter-btn${activeFilter === (f === 'All' ? '' : f) ? ' active' : ''}`}
            onClick={() => setActiveFilter(f === 'All' ? '' : f)}
          >{f}</div>
        ))}
      </div>
      {filteredResources.length === 0
        ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>No results found for "{searchQuery}"</div>
        : <div className="grid3">{filteredResources.map(r => <ResourceCard key={r.id} resource={r} />)}</div>
      }
    </div>
  )
}
export default SearchPage
