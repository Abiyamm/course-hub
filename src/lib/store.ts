import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Profile, Resource, SubscriptionPlan } from './supabase'

// ── Auth slice ─────────────────────────────────────────
interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (v: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  clearAuth: () => set({ user: null, profile: null }),
}))

// ── Resources slice ────────────────────────────────────
interface ResourceState {
  resources: Resource[]
  filteredResources: Resource[]
  selectedResource: Resource | null
  searchQuery: string
  activeFilter: string
  setResources: (r: Resource[]) => void
  setFilteredResources: (r: Resource[]) => void
  setSelectedResource: (r: Resource | null) => void
  setSearchQuery: (q: string) => void
  setActiveFilter: (f: string) => void
  addResource: (r: Resource) => void
}

export const useResourceStore = create<ResourceState>((set, get) => ({
  resources: [],
  filteredResources: [],
  selectedResource: null,
  searchQuery: '',
  activeFilter: '',
  setResources: (resources) => set({ resources, filteredResources: resources }),
  setFilteredResources: (filteredResources) => set({ filteredResources }),
  setSelectedResource: (selectedResource) => set({ selectedResource }),
  setSearchQuery: (searchQuery) => {
    set({ searchQuery })
    const { resources, activeFilter } = get()
    let filtered = resources
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.uploader_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (activeFilter) {
      filtered = filtered.filter((r) => r.type === activeFilter)
    }
    set({ filteredResources: filtered })
  },
  setActiveFilter: (activeFilter) => {
    set({ activeFilter })
    const { resources, searchQuery } = get()
    let filtered = resources
    if (activeFilter) filtered = filtered.filter((r) => r.type === activeFilter)
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.course.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    set({ filteredResources: filtered })
  },
  addResource: (r) =>
    set((state) => ({
      resources: [r, ...state.resources],
      filteredResources: [r, ...state.filteredResources],
    })),
}))

// ── UI slice ───────────────────────────────────────────
interface UIState {
  activePage: string
  pdfOpen: boolean
  pdfTitle: string
  pdfUrl: string
  sidebarOpen: boolean
  notification: { message: string; type: 'success' | 'error' | 'info' } | null
  setActivePage: (p: string) => void
  openPDF: (title: string, url: string) => void
  closePDF: () => void
  toggleSidebar: () => void
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void
  clearNotification: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activePage: 'dashboard',
  pdfOpen: false,
  pdfTitle: '',
  pdfUrl: '',
  sidebarOpen: true,
  notification: null,
  setActivePage: (activePage) => set({ activePage }),
  openPDF: (pdfTitle, pdfUrl) => set({ pdfOpen: true, pdfTitle, pdfUrl }),
  closePDF: () => set({ pdfOpen: false, pdfTitle: '', pdfUrl: '' }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  showNotification: (message, type = 'info') => {
    set({ notification: { message, type } })
    setTimeout(() => set({ notification: null }), 4000)
  },
  clearNotification: () => set({ notification: null }),
}))

// ── Subscription slice ─────────────────────────────────
interface SubState {
  plan: SubscriptionPlan
  aiUsage: number
  aiLimit: number
  setPlan: (p: SubscriptionPlan) => void
  incrementAIUsage: () => void
  canUseAI: () => boolean
}

export const useSubStore = create<SubState>((set, get) => ({
  plan: 'free',
  aiUsage: 0,
  aiLimit: 5,
  setPlan: (plan) =>
    set({ plan, aiLimit: plan === 'free' ? 5 : plan === 'premium' ? 9999 : 9999 }),
  incrementAIUsage: () => set((s) => ({ aiUsage: s.aiUsage + 1 })),
  canUseAI: () => {
    const { plan, aiUsage, aiLimit } = get()
    return plan !== 'free' || aiUsage < aiLimit
  },
}))