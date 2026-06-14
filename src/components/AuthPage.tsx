'use client'

import { useState } from 'react'
import { signIn, signUp, signInWithGoogle } from '@/lib/supabase'
import type { UserRole } from '@/lib/supabase'

type AuthMode = 'login' | 'signup'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null)

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  // Signup fields
  const [fname, setFname] = useState('')
  const [lname, setLname] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPass, setSuPass] = useState('')
  const [uni, setUni] = useState('Addis Ababa University')
  const [role, setRole] = useState<UserRole>('student')

  const showMsg = (text: string, type: 'error' | 'success' | 'info') => setMsg({ text, type })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!loginEmail || !loginPass) { showMsg('Please fill in all fields.', 'error'); return }
    setLoading(true); setMsg(null)
    const { error } = await signIn(loginEmail, loginPass)
    setLoading(false)
    if (error) showMsg(error.message, 'error')
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!fname || !suEmail || !suPass) { showMsg('Please fill in all required fields.', 'error'); return }
    if (suPass.length < 8) { showMsg('Password must be at least 8 characters.', 'error'); return }
    setLoading(true); setMsg(null)
    const { error, data } = await signUp(suEmail, suPass, {
      full_name: `${fname} ${lname}`.trim(),
      university: uni,
      role,
    })
    setLoading(false)
    if (error) { showMsg(error.message, 'error'); return }
    if (data.user && !data.session) {
      showMsg('Account created! Check your email to confirm your account.', 'success')
    }
  }

  async function handleGoogle() {
    setLoading(true)
    await signInWithGoogle()
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, zIndex: 999,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(124,110,245,.08), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 36, width: '100%', maxWidth: 420,
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, justifyContent: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, fontSize: 22,
            background: 'linear-gradient(135deg, var(--purple), var(--teal))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>📚</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Course Hub</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase' }}>Ethiopian Universities</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 8, padding: 4, marginBottom: 24 }}>
          {(['login', 'signup'] as AuthMode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setMsg(null) }} style={{
              flex: 1, padding: '8px 0', borderRadius: 6, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', border: 'none', transition: 'all .15s',
              background: mode === m ? 'var(--bg2)' : 'transparent',
              color: mode === m ? 'var(--text)' : 'var(--text2)',
              boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.3)' : 'none',
            }}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="your@email.com"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={loginPass} onChange={e => setLoginPass(e.target.value)} autoComplete="current-password" />
            </div>
            {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 14 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <button type="button" onClick={handleGoogle} disabled={loading} style={{
              width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 8, padding: 10, fontSize: 13, color: 'var(--text2)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>
        )}

        {/* SIGNUP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-input" placeholder="Abebe" value={fname} onChange={e => setFname(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" placeholder="Tadesse" value={lname} onChange={e => setLname(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="you@university.edu.et"
                value={suEmail} onChange={e => setSuEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password * (min 8 chars)</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={suPass} onChange={e => setSuPass(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">University *</label>
                <select className="form-select" value={uni} onChange={e => setUni(e.target.value)}>
                  {['Addis Ababa University','Bahir Dar University','Jimma University',
                    'Hawassa University','Mekelle University','Gondar University',
                    'Haramaya University','Arba Minch University'].map(u => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            </div>
            {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 14 }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
          By continuing you agree to Course Hub's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}