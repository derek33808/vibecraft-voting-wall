export interface Student {
  id: string
  name: string
  day1Url: string
  day2Url: string
  day2Status: 'published' | 'working'
  day2Label: string
}

export interface Comment {
  id: number | string
  student_id?: string
  studentId: string
  author: string
  content: string
  created_at?: string
  createdAt: number | string
}

export interface VoteData {
  [studentId: string]: number
}

// 离线兜底数据（Supabase 不可用时使用）
export const FALLBACK_STUDENTS: Student[] = [
  {
    id: 'corum',
    name: 'Corum',
    day1Url: 'https://corum-website.netlify.app/',
    day2Url: '',
    day2Status: 'working',
    day2Label: '大游戏 · 努力中',
  },
  {
    id: 'isaac',
    name: 'Isaac',
    day1Url: 'https://shiny-buttercream-a762db.netlify.app/',
    day2Url: 'https://escape-from-max-game.netlify.app/',
    day2Status: 'published',
    day2Label: '小游戏 · 已发布',
  },
  {
    id: 'langer',
    name: 'Langer',
    day1Url: 'https://langer-homepage.netlify.app/',
    day2Url: 'https://langer-f1-game.netlify.app/',
    day2Status: 'published',
    day2Label: '小游戏 · 已发布',
  },
  {
    id: 'max',
    name: 'Max',
    day1Url: 'https://max-website-nine.vercel.app/',
    day2Url: '',
    day2Status: 'working',
    day2Label: '大游戏 · 努力中',
  },
]
