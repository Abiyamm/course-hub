import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Types ──────────────────────────────────────────────
export type UserRole = 'student' | 'teacher' | 'admin'
export type SubscriptionPlan = 'free' | 'premium' | 'institutional'
export type ResourceType = 'Exam' | 'Notes' | 'Textbook' | 'Assignment' | 'Summary'

export interface Profile {
  id: string
  full_name: string
  university: string
  role: UserRole
  avatar_url?: string
  subscription: SubscriptionPlan
  created_at: string
}

export interface Resource {
  id: string
  title: string
  course: string
  type: ResourceType
  file_url?: string
  file_path?: string
  uploader_name: string
  user_id: string
  downloads: number
  rating: number
  ai_notes?: string
  ai_flashcards?: Flashcard[]
  created_at: string
}

export interface Flashcard {
  q: string
  a: string
}

export interface Comment {
  id: string
  resource_id: string
  user_id: string
  user_name: string
  content: string
  upvotes: number
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  stripe_customer_id?: string
  stripe_subscription_id?: string
  status: string
  created_at: string
}

// ── Auth helpers ───────────────────────────────────────
export async function signUp(
  email: string,
  password: string,
  metadata: { full_name: string; university: string; role: UserRole }
) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  })
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ── Profile helpers ────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as Profile
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  return supabase.from('profiles').update(updates).eq('id', userId)
}

// ── Resource helpers ───────────────────────────────────
export async function getResources(filters?: {
  type?: string
  course?: string
  search?: string
  limit?: number
}): Promise<Resource[]> {
  let query = supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.course) query = query.ilike('course', `%${filters.course}%`)
  if (filters?.search) query = query.ilike('title', `%${filters.search}%`)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) return []
  return data as Resource[]
}

export async function getResourceById(id: string): Promise<Resource | null> {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Resource
}

export async function insertResource(resource: Omit<Resource, 'id' | 'created_at'>) {
  return supabase.from('resources').insert(resource).select().single()
}

export async function updateResource(id: string, updates: Partial<Resource>) {
  return supabase.from('resources').update(updates).eq('id', id)
}

export async function incrementDownloads(id: string) {
  return supabase.rpc('increment_downloads', { resource_id: id })
}

// ── Upload helpers ─────────────────────────────────────
export async function uploadFile(
  file: File,
  path: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('resources')
    .upload(path, file, { upsert: true })
  if (error) return null
  const { data: urlData } = supabase.storage
    .from('resources')
    .getPublicUrl(data.path)
  return urlData.publicUrl
}

// ── Comment helpers ────────────────────────────────────
export async function getComments(resourceId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: false })
  if (error) return []
  return data as Comment[]
}

export async function addComment(comment: Omit<Comment, 'id' | 'created_at' | 'upvotes'>) {
  return supabase.from('comments').insert(comment).select().single()
}

// ── Subscription helpers ───────────────────────────────
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data as Subscription
}

export async function upsertSubscription(sub: Partial<Subscription> & { user_id: string }) {
  return supabase.from('subscriptions').upsert(sub).select().single()
}