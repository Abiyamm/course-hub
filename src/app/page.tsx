'use client'

import { useEffect } from 'react'
import { useUIStore, useAuthStore, useResourceStore } from '@/lib/store'
import { getResources } from '@/lib/supabase'

// Pages
import DashboardPage from '@/components/pages/DashboardPage'
import LibraryPage   from '@/components/pages/LibraryPage'
import SearchPage    from '@/components/pages/SearchPage'
import AIPage        from '@/components/pages/AIPage'
import SocialPage    from '@/components/pages/SocialPage'
import UploadPage    from '@/components/pages/UploadPage'
import AnalyticsPage from '@/components/pages/AnalyticsPage'
import PricingPage   from '@/components/pages/PricingPage'

const PAGES: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  library:   LibraryPage,
  search:    SearchPage,
  ai:        AIPage,
  social:    SocialPage,
  upload:    UploadPage,
  analytics: AnalyticsPage,
  pricing:   PricingPage,
}

// Seed data shown when DB is empty
const SEED_RESOURCES = [
  { id:'s1', title:'Engineering Math II — Final Exam 2023', course:'Mathematics', type:'Exam' as const,      uploader_name:'Dr. Bekele',  downloads:2340, rating:4.9, user_id:'', created_at:'' },
  { id:'s2', title:'Data Structures & Algorithms — Notes',  course:'CS Dept.',    type:'Notes' as const,     uploader_name:'Prof. Girma', downloads:1890, rating:4.8, user_id:'', created_at:'' },
  { id:'s3', title:'Organic Chemistry Lab Manual',          course:'Chemistry',   type:'Textbook' as const,  uploader_name:'Dr. Sara',    downloads:1450, rating:4.7, user_id:'', created_at:'' },
  { id:'s4', title:'Thermodynamics Midterm 2022',           course:'Engineering', type:'Exam' as const,      uploader_name:'Dr. Haile',   downloads:1200, rating:4.6, user_id:'', created_at:'' },
  { id:'s5', title:'Computer Networks Lecture Slides',      course:'CS Dept.',    type:'Notes' as const,     uploader_name:'Prof. Alemu', downloads:980,  rating:4.5, user_id:'', created_at:'' },
  { id:'s6', title:'Statistics & Probability — Summary',    course:'Mathematics', type:'Summary' as const,   uploader_name:'Tigist H.',   downloads:870,  rating:4.4, user_id:'', created_at:'' },
]

export default function HomePage() {
  const { activePage } = useUIStore()
  const { user } = useAuthStore()
  const { setResources } = useResourceStore()

  useEffect(() => {
    if (!user) return
    getResources({ limit: 50 }).then(data => {
      setResources(data.length > 0 ? data : SEED_RESOURCES as any)
    })
  }, [user])

  const Page = PAGES[activePage] || DashboardPage

  return <Page />
}