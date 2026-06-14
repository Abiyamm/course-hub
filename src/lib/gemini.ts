import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Flashcard } from './supabase'

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!
const genAI = new GoogleGenerativeAI(apiKey)

function getModel() {
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
}

// ── Generic prompt helper ──────────────────────────────
export async function prompt(text: string): Promise<string> {
  try {
    const model = getModel()
    const result = await model.generateContent(text)
    return result.response.text()
  } catch (e: any) {
    console.error('Gemini error:', e)
    throw new Error(e?.message || 'Gemini request failed')
  }
}

// ── Generate structured study notes ───────────────────
export async function generateNotes(
  title: string,
  extractedText?: string
): Promise<string> {
  const context = extractedText
    ? `Document content:\n${extractedText.slice(0, 4000)}`
    : `Topic: ${title}`

  const p = `You are an expert academic tutor for Ethiopian university students.
${context}

Generate comprehensive, well-structured study notes in Markdown format.
Include:
1. A brief overview
2. Key concepts with clear explanations
3. Important formulas or definitions (if applicable)
4. Summary bullet points
5. 3 likely exam questions

Keep the language clear and accessible. Format with ## headings, **bold** for key terms, and bullet points.`

  return prompt(p)
}

// ── Generate flashcards ────────────────────────────────
export async function generateFlashcards(
  title: string,
  extractedText?: string
): Promise<Flashcard[]> {
  const context = extractedText
    ? `Document content:\n${extractedText.slice(0, 3000)}`
    : `Topic: ${title}`

  const p = `You are an expert academic tutor for Ethiopian university students.
${context}

Generate exactly 8 study flashcards as a JSON array.
Each flashcard must have:
- "q": a clear, specific question
- "a": a concise but complete answer (2-4 sentences max)

Return ONLY the JSON array, no other text, no markdown code blocks.
Example format:
[{"q":"What is X?","a":"X is..."},{"q":"Define Y","a":"Y refers to..."}]`

  const raw = await prompt(p)
  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    if (Array.isArray(parsed)) return parsed as Flashcard[]
    return fallbackFlashcards(title)
  } catch {
    return fallbackFlashcards(title)
  }
}

// ── Summarize a document ───────────────────────────────
export async function summarizeDocument(
  title: string,
  extractedText?: string
): Promise<string> {
  const context = extractedText
    ? `Document: "${title}"\nContent:\n${extractedText.slice(0, 4000)}`
    : `Document title: "${title}"`

  const p = `You are an expert academic summarizer for Ethiopian university students.
${context}

Provide a structured summary including:
- **Main Topic:** one sentence overview
- **Key Points:** 5-7 bullet points of the most important content
- **Critical Formulas/Definitions:** (if any)
- **Exam Tips:** 3 tips for answering exam questions on this topic

Use clear Markdown formatting.`

  return prompt(p)
}

// ── Answer a question about a document ────────────────
export async function answerQuestion(
  question: string,
  documentTitle?: string,
  context?: string
): Promise<string> {
  const ctx = context
    ? `Document: "${documentTitle}"\nContext:\n${context.slice(0, 3000)}`
    : documentTitle
    ? `The student is studying: "${documentTitle}"`
    : ''

  const p = `You are a helpful academic tutor for Ethiopian university students.
${ctx}

Student question: ${question}

Provide a clear, accurate, and educational answer. 
- Use simple language suitable for university level
- Include examples where helpful
- If relevant, mention how this might appear in an exam
- Keep the answer focused and concise (under 300 words)`

  return prompt(p)
}

// ── Extract key points from a document ────────────────
export async function extractKeyPoints(title: string): Promise<string> {
  const p = `For the university subject "${title}", list the 6 most important key points a student must know for their exam. Format as a numbered list with a bold heading and 1-2 sentence explanation for each point.`
  return prompt(p)
}

// ── Generate quiz questions ────────────────────────────
export async function generateQuiz(title: string): Promise<QuizQuestion[]> {
  const p = `Generate 5 multiple choice quiz questions for Ethiopian university students studying "${title}".
Return ONLY a JSON array with this format:
[{
  "question": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct": 0,
  "explanation": "..."
}]
The "correct" field is the index (0-3) of the correct option.
Return ONLY valid JSON, no markdown, no extra text.`

  const raw = await prompt(p)
  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean) as QuizQuestion[]
  } catch {
    return []
  }
}

export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

// ── Adaptive recommendation ────────────────────────────
export async function getStudyRecommendation(
  userName: string,
  recentActivity: string[],
  upcomingExams: string[]
): Promise<string> {
  const p = `You are an adaptive learning AI for Ethiopian university student "${userName}".
Recent study activity: ${recentActivity.join(', ') || 'None recorded'}
Upcoming exams: ${upcomingExams.join(', ') || 'None scheduled'}

Give a brief, motivating personalized study recommendation (3-4 sentences max).
Be specific, practical, and encouraging. Mention what to study today and why.`

  return prompt(p)
}

// ── Fallback flashcards if JSON parse fails ────────────
function fallbackFlashcards(title: string): Flashcard[] {
  return [
    { q: `What is the main topic of ${title}?`, a: 'This covers core concepts and principles fundamental to the subject area.' },
    { q: 'What is the first step in problem solving for this subject?', a: 'Identify the given information, list the unknowns, and select the appropriate method.' },
    { q: 'Why is this subject important in engineering/science?', a: 'It provides the mathematical and theoretical foundation for real-world applications.' },
    { q: 'What are common mistakes students make in this topic?', a: 'Not understanding definitions deeply, skipping derivation steps, and not checking units.' },
    { q: 'How should you prepare for an exam on this topic?', a: 'Review definitions, practice problems from past exams, and test yourself with flashcards.' },
    { q: 'What resources are most helpful for mastering this topic?', a: 'Lecture notes, past exam papers, textbook worked examples, and peer study groups.' },
  ]
}