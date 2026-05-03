import { useState, useEffect, useCallback } from 'react'
import type { Student, Comment, VoteData } from '../data'
import { FALLBACK_STUDENTS } from '../data'
import { StudentCard } from '../components/StudentCard'
import {
  fetchStudents,
  fetchVoteCounts,
  fetchVotedStudentIds,
  addVote,
  removeVote,
  fetchComments,
  addComment,
} from '../lib/api'

export function HomePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [votes, setVotes] = useState<VoteData>({})
  const [votedStudents, setVotedStudents] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 初始化加载数据
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [studentsData, voteCounts, votedIds] = await Promise.all([
          fetchStudents(),
          fetchVoteCounts(),
          fetchVotedStudentIds(),
        ])
        setStudents(studentsData.length > 0 ? studentsData : FALLBACK_STUDENTS)
        setVotes(voteCounts)
        setVotedStudents(votedIds)
        setError(null)
      } catch (err) {
        console.error('Failed to load data from Supabase, using fallback:', err)
        setStudents(FALLBACK_STUDENTS)
        setError('数据库连接失败，当前显示离线数据')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 懒加载留言（展开留言区时才请求）
  const loadComments = useCallback(async (studentId: string) => {
    if (comments[studentId]) return // 已加载
    try {
      const data = await fetchComments(studentId)
      setComments(prev => ({ ...prev, [studentId]: data }))
    } catch (err) {
      console.error('Failed to load comments:', err)
    }
  }, [comments])

  const handleVote = useCallback(async (studentId: string) => {
    const isVoted = votedStudents.has(studentId)

    if (isVoted) {
      setVotes(prev => ({ ...prev, [studentId]: Math.max((prev[studentId] || 1) - 1, 0) }))
      setVotedStudents(prev => { const next = new Set(prev); next.delete(studentId); return next })
      try { await removeVote(studentId) } catch (err) {
        console.error('Failed to remove vote:', err)
        setVotes(prev => ({ ...prev, [studentId]: (prev[studentId] || 0) + 1 }))
        setVotedStudents(prev => new Set([...prev, studentId]))
      }
    } else {
      setVotes(prev => ({ ...prev, [studentId]: (prev[studentId] || 0) + 1 }))
      setVotedStudents(prev => new Set([...prev, studentId]))
      try { await addVote(studentId) } catch (err) {
        console.error('Failed to add vote:', err)
        setVotes(prev => ({ ...prev, [studentId]: Math.max((prev[studentId] || 1) - 1, 0) }))
        setVotedStudents(prev => { const next = new Set(prev); next.delete(studentId); return next })
      }
    }
  }, [votedStudents])

  const handleAddComment = useCallback(
    async (studentId: string, author: string, content: string) => {
      try {
        const newComment = await addComment(studentId, author, content)
        // 格式化以匹配前端类型
        const formatted: Comment = {
          ...newComment,
          studentId: newComment.student_id || studentId,
          createdAt: newComment.created_at || newComment.createdAt,
        }
        setComments(prev => ({
          ...prev,
          [studentId]: [formatted, ...(prev[studentId] || [])],
        }))
      } catch (err) {
        console.error('Failed to add comment:', err)
        alert('留言发送失败，请重试')
      }
    },
    []
  )

  if (loading) {
    return (
      <section className="home-page">
        <div className="loading-spinner">
          <div className="spinner" />
          <p>加载中...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="home-page">
      <div className="hero-section">
        <h2 className="hero-title">VibeCraft 五一集训 · 作品展示</h2>
        <p className="hero-subtitle">
          4 位创始成员 · 3 天 AI 编程集训 · 从零到公网发布
        </p>
        <p className="hero-desc">
          Day 1 体验 Vibe Coding 做个人主页 · Day 2 学习设计先行做产品 V1
          · 点击链接查看每位同学的作品，留下你的点赞和留言吧！
        </p>
        {error && <p className="hero-error">{error}</p>}
      </div>

      <div className="student-grid">
        {students.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            voteCount={votes[student.id] || 0}
            comments={comments[student.id] || []}
            onVote={() => handleVote(student.id)}
            voted={votedStudents.has(student.id)}
            onToggleComments={() => loadComments(student.id)}
            onAddComment={(author, content) =>
              handleAddComment(student.id, author, content)
            }
          />
        ))}
      </div>
    </section>
  )
}
