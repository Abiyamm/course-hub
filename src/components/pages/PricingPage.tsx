'use client'
import { useState } from 'react'
import { useAuthStore, useSubStore, useUIStore } from '@/lib/store'
import { upsertSubscription } from '@/lib/supabase'

type Plan = 'free' | 'premium' | 'institutional'

export function PricingPage() {
  const { user } = useAuthStore()
  const { plan: currentPlan, setPlan } = useSubStore()
  const { showNotification, setActivePage } = useUIStore()

  const [selected, setSelected]   = useState<Plan | null>(null)
  const [cardNum, setCardNum]     = useState('')
  const [expiry, setExpiry]       = useState('')
  const [cvc, setCvc]             = useState('')
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [paid, setPaid]           = useState(false)

  function formatCard(v: string) { return v.replace(/\D/g,'').slice(0,16).replace(/(\d{4})(?=\d)/g,'$1 ') }
  function formatExp(v: string)  { const d=v.replace(/\D/g,'').slice(0,4); return d.length>=2?d.slice(0,2)+' / '+d.slice(2):d }

  async function handlePay() {
    if (!cardNum || !expiry || !cvc || !name || !email) { showNotification('Please fill all payment fields.','error'); return }
    if (cardNum.replace(/\s/g,'').length < 16) { showNotification('Enter a valid 16-digit card number.','error'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000)) // Stripe call would go here
    if (user && selected) {
      await upsertSubscription({ user_id: user.id, plan: selected, status: 'active' })
      setPlan(selected)
    }
    setLoading(false)
    setPaid(true)
    showNotification(`🎉 Welcome to Course Hub ${selected}!`, 'success')
  }

  const PLANS = [
    {
      id: 'free' as Plan, name:'FREE', price:'0', period:'Forever free', color:'var(--text3)',
      features:['Browse all public materials','5 AI generations/month','Basic search & filter'],
      disabled:['Unlimited AI notes','Offline downloads','Priority support'],
    },
    {
      id: 'premium' as Plan, name:'PREMIUM', price:'299', period:'per month', color:'var(--purple)', featured: true,
      features:['Everything in Free','Unlimited AI generations','AI flashcards & notes','Offline PDF downloads','Priority support'],
      disabled:[],
    },
    {
      id: 'institutional' as Plan, name:'INSTITUTIONAL', price:'4,999', period:'per month · up to 500 students', color:'var(--amber)',
      features:['Everything in Premium','Admin dashboard','Bulk upload tools','Custom branding','Dedicated support'],
      disabled:[],
    },
  ]

  if (paid) return (
    <div className="card" style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center', padding: 48 }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <h2 style={{ marginBottom: 8 }}>Payment Successful!</h2>
      <p style={{ color: 'var(--text3)', marginBottom: 24 }}>Welcome to Course Hub {selected}. Your account has been upgraded.</p>
      <button className="btn btn-primary" style={{ margin: '0 auto' }} onClick={() => setActivePage('dashboard')}>Go to Dashboard</button>
    </div>
  )

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>Choose Your Plan</h1>
        <p style={{ color: 'var(--text3)' }}>Unlock AI-powered features and unlimited access</p>
      </div>

      <div className="grid3" style={{ marginBottom: selected ? 32 : 0 }}>
        {PLANS.map(p => (
          <div key={p.id}
            className="card"
            onClick={() => p.id !== 'free' && setSelected(p.id)}
            style={{
              cursor: p.id !== 'free' ? 'pointer' : 'default',
              border: selected === p.id ? `1px solid ${p.color}` : currentPlan === p.id ? '1px solid var(--border2)' : '1px solid var(--border)',
              background: p.featured ? 'rgba(124,110,245,.04)' : 'var(--bg2)',
              transition: 'all .2s',
            }}
          >
            {p.featured && <div style={{ textAlign:'center', marginBottom:8 }}><span className="badge badge-purple">Most Popular</span></div>}
            <div style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{p.name}</div>
            <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, margin: '10px 0 2px', color: p.color }}>{p.price} <span style={{ fontSize: 14, color: 'var(--text3)' }}>ETB</span></div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>{p.period}</div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {p.features.map(f => <div key={f} style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', gap: 8 }}><span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span>{f}</div>)}
              {p.disabled.map(f => <div key={f} style={{ fontSize: 13, color: 'var(--text3)', display: 'flex', gap: 8, opacity: .5 }}><span>✗</span>{f}</div>)}
            </div>
            <div style={{ marginTop: 16 }}>
              {p.id === 'free'
                ? <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} disabled>Current Plan</button>
                : <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSelected(p.id)}>
                    {selected === p.id ? '✓ Selected' : `Choose ${p.name}`}
                  </button>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Payment form */}
      {selected && (
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 20 }}>💳</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Secure Payment</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {selected === 'premium' ? 'Premium — 299 ETB/month' : 'Institutional — 4,999 ETB/month'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text3)', marginBottom: 16 }}>
              🔒 Secured by Stripe · 256-bit SSL
            </div>
            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input className="form-input" placeholder="1234 5678 9012 3456" value={cardNum}
                onChange={e => setCardNum(formatCard(e.target.value))} maxLength={19} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Expiry</label>
                <input className="form-input" placeholder="MM / YY" value={expiry}
                  onChange={e => setExpiry(formatExp(e.target.value))} maxLength={7} />
              </div>
              <div className="form-group">
                <label className="form-label">CVC</label>
                <input className="form-input" placeholder="123" value={cvc}
                  onChange={e => setCvc(e.target.value.replace(/\D/g,'').slice(0,3))} maxLength={3} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Cardholder Name</label>
              <input className="form-input" placeholder="Abebe Tadesse" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-full" onClick={handlePay} disabled={loading} style={{ marginTop: 8 }}>
              {loading ? '🔒 Processing…' : `Pay ${selected === 'premium' ? '299' : '4,999'} ETB →`}
            </button>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => setSelected(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
export default PricingPage