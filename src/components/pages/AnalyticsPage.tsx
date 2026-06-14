'use client'
import { useResourceStore } from '@/lib/store'

const DAYS = [['Mon',60,'3.2h'],['Tue',80,'4.8h'],['Wed',45,'2.5h'],['Thu',90,'5.5h'],['Fri',70,'4.2h'],['Sat',100,'6.0h'],['Sun',55,'3.0h']]

export function AnalyticsPage() {
  const { resources } = useResourceStore()
  const top = [...resources].sort((a, b) => b.downloads - a.downloads).slice(0, 5)

  return (
    <div>
      <div className="grid4" style={{ marginBottom: 24 }}>
        {[
          { label:'Total Uploads',  value: resources.length || 1284, color:'var(--purple)', change:'↑ 23 this week' },
          { label:'Active Students',value: 4720,                     color:'var(--teal)',   change:'↑ 180 this month' },
          { label:'AI Generations', value: 9340,                     color:'var(--amber)',  change:'↑ 540 this week' },
          { label:'Downloads',      value:'52,190',                  color:'var(--green)',  change:'↑ 1,200 today' },
        ].map(s => (
          <div key={s.label} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-change text-up">{s.change}</div>
          </div>
        ))}
      </div>
      <div className="grid2">
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Top Resources</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Resource</th><th>Downloads</th><th>⭐</th></tr></thead>
              <tbody>
                {top.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontSize: 13 }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{r.course}</div>
                    </td>
                    <td><span className="badge badge-purple">{r.downloads.toLocaleString()}</span></td>
                    <td>{r.rating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Study Activity — This Week</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DAYS.map(([d, w, h]) => (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, fontSize: 12, color: 'var(--text3)' }}>{d}</div>
                <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${w}%`, background: 'linear-gradient(90deg,var(--purple),var(--teal))', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', width: 36, textAlign: 'right' }}>{h}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
export default AnalyticsPage
