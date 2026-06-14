'use client'

import { useEffect, useRef, useState } from 'react'
import { useUIStore, useSubStore } from '@/lib/store'
import { summarizeDocument, generateFlashcards, extractKeyPoints, answerQuestion } from '@/lib/gemini'
import type { Flashcard } from '@/lib/supabase'

export default function PDFViewer() {
  const { pdfOpen, pdfTitle, pdfUrl, closePDF } = useUIStore()
  const { canUseAI, incrementAIUsage } = useSubStore()

  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [pdfDoc, setPdfDoc]       = useState<any>(null)
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(1)
  const [zoom, setZoom]           = useState(1.0)
  const [aiPanel, setAiPanel]     = useState(false)
  const [aiResult, setAiResult]   = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiQ, setAiQ]             = useState('')
  const [cards, setCards]         = useState<Flashcard[]>([])
  const [cardIdx, setCardIdx]     = useState(0)
  const [flipped, setFlipped]     = useState(false)

  // Load PDF.js from CDN
  useEffect(() => {
    if (!pdfOpen) return
    if ((window as any).pdfjsLib) { loadPDF(); return }
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    s.onload = () => {
      ;(window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      loadPDF()
    }
    document.head.appendChild(s)
  }, [pdfOpen, pdfUrl])

  async function loadPDF() {
    if (!pdfUrl) { renderPlaceholder(); return }
    try {
      const lib = (window as any).pdfjsLib
      const doc = await lib.getDocument(pdfUrl).promise
      setPdfDoc(doc)
      setTotal(doc.numPages)
      setPage(1)
      await renderPage(doc, 1, zoom)
    } catch {
      renderPlaceholder()
    }
  }

  async function renderPage(doc: any, pageNum: number, scale: number) {
    if (!canvasRef.current) return
    const pg   = await doc.getPage(pageNum)
    const vp   = pg.getViewport({ scale: scale * 1.5 })
    const canvas = canvasRef.current
    const ctx  = canvas.getContext('2d')!
    canvas.width  = vp.width
    canvas.height = vp.height
    await pg.render({ canvasContext: ctx, viewport: vp }).promise
  }

  function renderPlaceholder() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = 680
    canvas.height = 960
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 680, 960)
    ctx.fillStyle = '#1a1a2e'
    ctx.font = 'bold 20px Segoe UI'
    ctx.textAlign = 'center'
    ctx.fillText(pdfTitle, 340, 70)
    ctx.fillStyle = '#666'
    ctx.font = '13px Segoe UI'
    ctx.fillText('Addis Ababa University', 340, 96)
    ctx.fillStyle = '#ddd'
    ctx.fillRect(60, 116, 560, 1)
    const lines = [
      '1. Introduction',
      'This document covers core concepts required for the examination.',
      'Mastery of the following material is essential for success.',
      '',
      '2. Key Concepts',
      '• Fundamental principles and theoretical foundations',
      '• Step-by-step problem solving methodology',
      '• Application of standard formulas and theorems',
      '• Verification through dimensional analysis',
      '',
      '3. Important Formulas',
      'All formulas listed here are derivable from first principles.',
      'Understanding derivations aids flexible application.',
      '',
      '4. Practice Problems',
      'See attached exercise sheets for graded practice questions.',
      'Solutions will be reviewed in tutorial sessions.',
      '',
      '5. Examination Strategy',
      '• Read each question carefully and identify unknowns',
      '• Show all working steps clearly for partial credit',
      '• Check units and reasonableness of every answer',
      '',
      'This material is part of Course Hub — Ethiopian Universities.',
    ]
    ctx.fillStyle = '#333'
    ctx.textAlign = 'left'
    let y = 140
    lines.forEach(l => {
      if (/^\d\./.test(l)) { ctx.font = 'bold 14px Segoe UI'; ctx.fillStyle = '#111' }
      else { ctx.font = '13px Segoe UI'; ctx.fillStyle = '#444' }
      ctx.fillText(l, 60, y)
      y += 22
    })
    ctx.fillStyle = '#eee'
    ctx.fillRect(60, 900, 560, 1)
    ctx.font = '11px Segoe UI'
    ctx.fillStyle = '#999'
    ctx.textAlign = 'center'
    ctx.fillText('Course Hub — Ethiopian Universities · Page 1 of 8', 340, 926)
    setTotal(8)
  }

  async function changePage(n: number) {
    const next = Math.min(Math.max(1, n), total)
    setPage(next)
    if (pdfDoc) await renderPage(pdfDoc, next, zoom)
  }

  async function changeZoom(delta: number) {
    const next = Math.min(3, Math.max(0.5, zoom + delta))
    setZoom(next)
    if (pdfDoc) await renderPage(pdfDoc, page, next)
  }

  // ── AI helpers ────────────────────────────────────
  async function aiSummarize() {
    if (!canUseAI()) return
    setAiLoading(true); setAiResult(''); incrementAIUsage(); setCards([])
    try { setAiResult(await summarizeDocument(pdfTitle)) }
    catch (e: any) { setAiResult('Error: ' + e.message) }
    setAiLoading(false)
  }

  async function aiCards() {
    if (!canUseAI()) return
    setAiLoading(true); setAiResult(''); incrementAIUsage()
    try {
      const fc = await generateFlashcards(pdfTitle)
      setCards(fc); setCardIdx(0); setFlipped(false)
      setAiResult('__flashcards__')
    } catch (e: any) { setAiResult('Error: ' + e.message) }
    setAiLoading(false)
  }

  async function aiPoints() {
    if (!canUseAI()) return
    setAiLoading(true); setAiResult(''); incrementAIUsage(); setCards([])
    try { setAiResult(await extractKeyPoints(pdfTitle)) }
    catch (e: any) { setAiResult('Error: ' + e.message) }
    setAiLoading(false)
  }

  async function handleAsk() {
    if (!aiQ.trim() || !canUseAI()) return
    setAiLoading(true); setAiResult(''); incrementAIUsage(); setCards([])
    try { setAiResult(await answerQuestion(aiQ, pdfTitle)) }
    catch (e: any) { setAiResult('Error: ' + e.message) }
    setAiLoading(false)
    setAiQ('')
  }

  function renderAIResult() {
    if (aiResult === '__flashcards__') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>🃏 Flashcards ({cards.length})</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }}
                onClick={() => { setCardIdx(i => (i - 1 + cards.length) % cards.length); setFlipped(false) }}>←</button>
              <span style={{ fontSize: 12, color: 'var(--text3)', padding: '4px 0' }}>{cardIdx + 1}/{cards.length}</span>
              <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }}
                onClick={() => { setCardIdx(i => (i + 1) % cards.length); setFlipped(false) }}>→</button>
            </div>
          </div>
          <div className={`flashcard${flipped ? ' flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
            <div className="flashcard-inner" style={{ height: 120 }}>
              <div className="flashcard-front" style={{ fontSize: 13 }}>{cards[cardIdx]?.q}</div>
              <div className="flashcard-back"  style={{ fontSize: 13 }}>{cards[cardIdx]?.a}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 6 }}>Tap to flip</div>
        </div>
      )
    }
    const html = aiResult
      .replace(/## (.*)/g, '<h2>$1</h2>')
      .replace(/### (.*)/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.*)/gm, '<li>$1</li>')
      .replace(/\n/g, '<br/>')
    return <div className="md-content" dangerouslySetInnerHTML={{ __html: html }} />
  }

  if (!pdfOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)',
      zIndex: 500, display: 'flex', flexDirection: 'column',
    }}>
      {/* Toolbar */}
      <div style={{
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <button className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => { closePDF(); setPdfDoc(null) }}>
          ✕ Close
        </button>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {pdfTitle}
        </div>
        {/* Page nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => changePage(page - 1)}>‹</button>
          <span style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
            Page <strong>{page}</strong> / <strong>{total}</strong>
          </span>
          <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => changePage(page + 1)}>›</button>
        </div>
        {/* Zoom */}
        <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => changeZoom(-0.25)}>−</button>
        <span style={{ fontSize: 12, color: 'var(--text3)', minWidth: 44, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => changeZoom(0.25)}>+</button>
        {/* AI toggle */}
        <button className="btn btn-primary" style={{ padding: '6px 14px' }} onClick={() => setAiPanel(p => !p)}>
          🤖 AI {aiPanel ? '✕' : 'Analyze'}
        </button>
        {/* Download */}
        {pdfUrl && (
          <a href={pdfUrl} download target="_blank" rel="noreferrer">
            <button className="btn btn-ghost" style={{ padding: '6px 12px' }}>⬇ Download</button>
          </a>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* PDF canvas */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: 20 }}>
          <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,.5)' }} />
        </div>

        {/* AI side panel */}
        {aiPanel && (
          <div style={{
            width: 360, background: 'var(--bg2)', borderLeft: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
          }}>
            {/* Panel header */}
            <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🤖 AI Document Analysis</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-primary btn-full" onClick={aiSummarize} disabled={aiLoading}>📝 Generate Summary</button>
                <button className="btn btn-ghost"  style={{ width:'100%', justifyContent:'center' }} onClick={aiCards}   disabled={aiLoading}>🃏 Create Flashcards</button>
                <button className="btn btn-ghost"  style={{ width:'100%', justifyContent:'center' }} onClick={aiPoints}  disabled={aiLoading}>🎯 Key Points</button>
              </div>
            </div>

            {/* Result area */}
            <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
              {aiLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--purple)', fontSize: 13 }}>
                  <div className="dot-pulse"><span /><span /><span /></div>
                  Gemini is analyzing…
                </div>
              )}
              {!aiLoading && aiResult && renderAIResult()}
              {!aiLoading && !aiResult && (
                <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', marginTop: 40 }}>
                  Choose an action above to analyze this document with Gemini AI.
                </div>
              )}
            </div>

            {/* Ask question */}
            <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input" style={{ flex: 1, fontSize: 12 }}
                  placeholder="Ask about this document…"
                  value={aiQ} onChange={e => setAiQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAsk()}
                />
                <button className="btn btn-primary" style={{ padding: '8px 12px' }} onClick={handleAsk} disabled={aiLoading}>→</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}