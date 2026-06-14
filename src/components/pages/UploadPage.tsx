'use client'
import { useState, useRef } from 'react'
import { useAuthStore, useResourceStore, useUIStore } from '@/lib/store'
import { uploadFile, insertResource } from '@/lib/supabase'
import { generateNotes, generateFlashcards } from '@/lib/gemini'
import type { ResourceType } from '@/lib/supabase'

const COURSES = ['Engineering Mathematics II','Data Structures & Algorithms','Organic Chemistry I','Thermodynamics','Computer Networks','Linear Algebra','Physics II','Biology I']
const TYPES: ResourceType[] = ['Exam','Notes','Textbook','Assignment','Summary']

export function UploadPage() {
  const { user, profile } = useAuthStore()
  const { addResource } = useResourceStore()
  const { showNotification } = useUIStore()

  const [file, setFile]       = useState<File | null>(null)
  const [title, setTitle]     = useState('')
  const [course, setCourse]   = useState(COURSES[0])
  const [type, setType]       = useState<ResourceType>('Exam')
  const [year, setYear]       = useState('2024')
  const [aiOn, setAiOn]       = useState(true)
  const [status, setStatus]   = useState('')
  const [loading, setLoading] = useState(false)
  const [drag, setDrag]       = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function onFiles(files: FileList | null) {
    if (!files?.length) return
    const f = files[0]
    setFile(f)
    setTitle(f.name.replace(/\.[^.]+$/, ''))
  }

  async function handleUpload() {
    if (!file || !title) { showNotification('Please select a file and enter a title.', 'error'); return }
    if (!user) { showNotification('You must be signed in to upload.', 'error'); return }
    setLoading(true)

    setStatus('⬆️ Uploading file to Supabase Storage…')
    const path = `${user.id}/${Date.now()}_${file.name}`
    const url = await uploadFile(file, path)

    setStatus('💾 Saving metadata to database…')
    let ai_notes = '', ai_flashcards = undefined as any

    if (aiOn) {
      setStatus('🤖 Gemini AI is generating notes and flashcards…')
      try {
        [ai_notes, ai_flashcards] = await Promise.all([
          generateNotes(title),
          generateFlashcards(title),
        ])
      } catch {}
    }

    const { data, error } = await insertResource({
      title, course, type,
      file_url: url || '',
      file_path: path,
      uploader_name: profile?.full_name || 'Unknown',
      user_id: user.id,
      downloads: 0,
      rating: 4.0,
      ai_notes,
      ai_flashcards,
    })

    setLoading(false)
    if (error) { showNotification('Upload failed: ' + error.message, 'error'); setStatus(''); return }
    if (data) addResource(data as any)

    setStatus('')
    setFile(null); setTitle('')
    if (fileRef.current) fileRef.current.value = ''
    showNotification('✅ File uploaded and AI notes generated!', 'success')
  }

  return (
    <div className="grid2">
      <div>
        <div
          className={`upload-area card${drag ? ' drag' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files) }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Drop files or click to upload</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>PDF, DOCX, PPTX · Max 50MB</div>
          {file
            ? <span className="badge badge-green">✓ {file.name}</span>
            : <button className="btn btn-primary">Choose File</button>
          }
          <input ref={fileRef} type="file" style={{ display: 'none' }} accept=".pdf,.doc,.docx,.pptx"
            onChange={e => onFiles(e.target.files)} />
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>File Details</div>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Calculus Final Exam 2024" />
        </div>
        <div className="form-group">
          <label className="form-label">Course</label>
          <select className="form-select" value={course} onChange={e => setCourse(e.target.value)}>
            {COURSES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPES.map(t => (
              <div key={t} className={`filter-btn${type === t ? ' active' : ''}`} onClick={() => setType(t)}>{t}</div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Year</label>
          <input className="form-input" value={year} onChange={e => setYear(e.target.value)} placeholder="2024" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'rgba(124,110,245,.08)', borderRadius: 8, border: '1px solid rgba(124,110,245,.2)', marginBottom: 14 }}>
          <span>🤖</span>
          <div style={{ fontSize: 12, color: 'var(--text2)', flex: 1 }}>Auto-generate AI notes &amp; flashcards after upload</div>
          <input type="checkbox" checked={aiOn} onChange={e => setAiOn(e.target.checked)} />
        </div>
        {status && <div className="msg msg-info" style={{ marginBottom: 12 }}>{status}</div>}
        <button className="btn btn-primary btn-full" onClick={handleUpload} disabled={loading || !file}>
          {loading ? status || 'Processing…' : 'Upload & Process →'}
        </button>
      </div>
    </div>
  )
}
export default UploadPage