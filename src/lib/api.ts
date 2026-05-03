import { supabase } from './supabase'
import type { Student, Comment, VoteData } from '../data'

// ============================================
// Students API
// ============================================
export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('id')

  if (error) throw error
  // 映射 snake_case → camelCase
  return (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: row.name as string,
    day1Url: row.day1_url as string,
    day2Url: row.day2_url as string,
    day2Status: row.day2_status as 'published' | 'working',
    day2Label: row.day2_label as string,
  }))
}

// ============================================
// Votes API
// ============================================
function getFingerprint(): string {
  // 简单的浏览器指纹：屏幕 + 语言 + 时区
  return `${window.screen.width}x${window.screen.height}-${navigator.language}-${Intl.DateTimeFormat().resolvedOptions().timeZone}`
}

export async function fetchVoteCounts(): Promise<VoteData> {
  const { data, error } = await supabase
    .from('votes')
    .select('student_id')

  if (error) throw error

  const counts: VoteData = {}
  for (const row of data) {
    counts[row.student_id] = (counts[row.student_id] || 0) + 1
  }
  return counts
}

export async function fetchVotedStudentIds(): Promise<Set<string>> {
  const fingerprint = getFingerprint()
  const { data, error } = await supabase
    .from('votes')
    .select('student_id')
    .eq('voter_fingerprint', fingerprint)

  if (error) throw error
  return new Set((data || []).map(row => row.student_id))
}

export async function addVote(studentId: string): Promise<{ success: boolean; duplicate: boolean }> {
  const fingerprint = getFingerprint()

  const { error } = await supabase
    .from('votes')
    .insert({
      student_id: studentId,
      voter_fingerprint: fingerprint,
    })

  if (error) {
    // 唯一约束冲突 = 已经投过票
    if (error.code === '23505') {
      return { success: false, duplicate: true }
    }
    throw error
  }

  return { success: true, duplicate: false }
}

export async function removeVote(studentId: string): Promise<void> {
  const fingerprint = getFingerprint()
  const { error } = await supabase
    .from('votes')
    .delete()
    .eq('student_id', studentId)
    .eq('voter_fingerprint', fingerprint)

  if (error) throw error
}

// ============================================
// Comments API
// ============================================
export async function fetchComments(studentId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Comment[]
}

export async function addComment(
  studentId: string,
  author: string,
  content: string
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      student_id: studentId,
      author: author.trim(),
      content: content.trim(),
    })
    .select()
    .single()

  if (error) throw error
  return data as Comment
}
