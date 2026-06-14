'use client'

import { useAuthStore, useResourceStore, useUIStore } from '@/lib/store'
import ResourceCard from '@/components/ResourceCard'

const EXAMS = [
  { title: 'Calculus Final',         dept: 'Mathematics', badge: 'badge-red',   label: 'Tomorrow', bg: 'rgba(248,113,113,.06)', border: 'rgba(248,113,113,.2)' },
  { title: 'Thermodynamics Mid',     dept: 'Engineering', badge: 'badge-amber', label: '3 days',   bg: 'rgba(245,158,11,.06)',  border: 'rgba(245,158,11,.2)'  },
  { title: 'Computer Networks Quiz', dept: 'CS Dept.',    badge: 'badge-blue',  label: '5 days',   bg: 'rgba(96,165,250,.06)',  border: 'rgba(96,165,250,.2)'  },
]

const PROGRESS = [
  { icon: '📐', label: 'Engineering Mathematics II', sub: 'Chapter 4 — Differential Equations', pct: 68,  color: 'var(--purple)', bg: 'rgba(124,110,245,.15)' },
  { icon: '⚗️', label: 'Organic Chemistry I',        sub: 'Lecture 9 — Alkenes & Reactions',    pct: 42,  color: 'var(--teal)',   bg: 'rgba(45,212,191,.12)'  },
  { icon: '💻', label: 'Data Structures & Algo',    sub: 'Module 6 — Graph Algorithms',         pct: 85,  color: 'var(--amber)',  bg: 'rgba(245,158,11,.1)'   },
]

export default function DashboardPage() {
  const { profile } = useAuthStore()
  const { resources } = useResourceStore()
  const { setActivePage } = useUIStore()
  const firstName = profile?.full_name?.split(' ')[0] || 'Student'

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22 }}>Good morning, {firstName} 👋</h1>
        <p style={{ fontSize: 14, color: 'var(--text3)', marginTop: 4 }}>
          Your adaptive learning hub is ready. Keep up the great work!
        </p>
      </div>

      {/* Stats */}
      <div className="grid4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Resources',  value: resources.length || 247, color: 'var(--purple)', change: '↑ 12 this week' },
          { label: 'Study Hours',value: '38.5',                  color: 'var(--teal)',   change: '↑ 4.2 today'    },
          { label: 'Courses',    value: 6,                       color: 'var(--amber)',  change: '2 active'        },
          { label: 'AI Notes',   value: 54,                      color: 'var(--green)',  change: '↑ 8 this week'  },
        ].map(s => (
          <div key={s.label} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-change text-up">{s.change}</div>
          </div>
        ))}
      </div>

      <div className="grid2" style={{ marginBottom: 24 }}>
        {/* Study progress */}
        <div className="card">
          <div className="section-head">
            <div><div className="section-title">Continue Studying</div></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PROGRESS.map(p => (
              <div key={p.label} style={{
                display: 'flex', gap: 12, alignItems: 'center', padding: 12,
                background: 'var(--bg3)', borderRadius: 8, cursor: 'pointer',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{p.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0' }}>{p.sub}</div>
                  <div className="progress"><div className="progress-fill" style={{ width: `${p.pct}%` }} /></div>
                </div>
                <div style={{ fontSize: 12, color: p.color, flexShrink: 0 }}>{p.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming exams */}
        <div className="card">
          <div className="section-head">
            <div><div className="section-title">Upcoming Exams</div></div>
            <span className="badge badge-red">3 upcoming</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EXAMS.map(ex => (
              <div key={ex.title} style={{ padding: 12, background: ex.bg, border: `1px solid ${ex.border}`, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{ex.title}</div>
                  <span className={`badge ${ex.badge}`}>{ex.label}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>AAU · {ex.dept}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent resources */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-head">
          <div><div className="section-title">Recently Added</div></div>
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setActivePage('library')}>View all →</button>
        </div>
        <div className="grid3">
          {resources.slice(0, 3).map(r => <ResourceCard key={r.id} resource={r} />)}
        </div>
      </div>

      {/* AI recommendation */}
      <div className="ai-card">
        <div className="ai-glow" />
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 28 }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>AI Study Recommendation</div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
              Based on your exam schedule, focus on <strong>Differential Equations</strong> today.
              AI-generated flashcards and notes are ready for you in AI Studio.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button className="btn btn-primary" onClick={() => setActivePage('ai')}>Open AI Studio</button>
              <button className="btn btn-ghost">Dismiss</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}