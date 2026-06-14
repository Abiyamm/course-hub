'use client'
import { useState } from 'react'

const POSTS = [
  { av:'TH', name:'Tigist Haile', role:'3rd Year · CS', time:'10 min ago', text:'Just uploaded complete lecture notes for Data Structures chapter 7 with graph algorithms and worked examples! 📊', likes:24, comments:8, bg:'linear-gradient(135deg,var(--teal),var(--green))' },
  { av:'YT', name:'Yonas Tekle', role:'4th Year · Engineering', time:'1 hour ago', text:'Does anyone have Thermodynamics past papers from 2020–2021? Need practice problems before the midterm next week 🙏', likes:12, comments:15, bg:'linear-gradient(135deg,var(--amber),var(--red))' },
  { av:'MA', name:'Mekdes Abebe', role:'2nd Year · Chemistry', time:'2 hours ago', text:'The AI-generated flashcards from Organic Chemistry notes are incredible. Saved me so many hours of manual work!', likes:41, comments:6, bg:'linear-gradient(135deg,var(--purple),var(--blue))' },
]

const NOTIFS = [
  { text: <><strong>Dr. Bekele</strong> uploaded new exam papers</>, time: '2 min ago', unread: true },
  { text: <><strong>Tigist</strong> commented on your note</>, time: '1 hour ago', unread: true },
  { text: <>Your flashcard set got <strong>12 upvotes</strong></>, time: '3 hours ago', unread: false },
  { text: <>New materials available: Chemistry 201</>, time: 'Yesterday', unread: false },
]

export function SocialPage() {
  const [likes, setLikes] = useState(POSTS.map(p => p.likes))

  return (
    <div className="grid2">
      <div>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Community Feed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {POSTS.map((p, i) => (
              <div key={i} style={{ padding: 14, background: 'var(--bg3)', borderRadius: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{p.av}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.role} · {p.time}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text2)' }}>{p.text}</p>
                <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)', cursor: 'pointer' }}
                    onClick={() => setLikes(l => l.map((v, j) => j === i ? v + 1 : v))}>
                    👍 {likes[i]}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text3)', cursor: 'pointer' }}>💬 {p.comments}</span>
                  <span style={{ fontSize: 12, color: 'var(--purple)', cursor: 'pointer' }}>↗ Share</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 14 }}>🔔 Notifications</div>
          {NOTIFS.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '11px 0', borderBottom: i < NOTIFS.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.unread ? 'var(--purple)' : 'var(--bg4)', flexShrink: 0, marginTop: 5 }} />
              <div>
                <div style={{ fontSize: 13, color: n.unread ? 'var(--text)' : 'var(--text2)' }}>{n.text}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>Top Contributors</div>
          {[
            { av:'DK', name:'Dr. Kebede', uploads:142, badge:'badge-amber', bg:'linear-gradient(135deg,var(--purple),var(--teal))' },
            { av:'TH', name:'Tigist Haile', uploads:89, badge:'badge-teal', bg:'linear-gradient(135deg,var(--teal),var(--green))' },
            { av:'YT', name:'Yonas Tekle', uploads:67, badge:'badge-purple', bg:'linear-gradient(135deg,var(--amber),var(--red))' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
              <div style={{ fontSize: 14, color: i === 0 ? 'var(--amber)' : 'var(--text3)', fontWeight: 700, width: 20 }}>{i + 1}</div>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{c.av}</div>
              <div style={{ flex: 1, fontSize: 13 }}>{c.name}</div>
              <span className={`badge ${c.badge}`}>{c.uploads}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default SocialPage