import { useState, useEffect, useCallback } from 'react'
import type { Student, Comment, VoteData } from '../data'
import { FALLBACK_STUDENTS } from '../data'
import { StudentCard } from '../components/StudentCard'
import {
  fetchStudents,
  fetchVoteCounts,
  addVote,
  fetchComments,
  addComment,
} from '../lib/api'

export function HomePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [votes, setVotes] = useState<VoteData>({})
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 初始化加载数据
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [studentsData, voteCounts] = await Promise.all([
          fetchStudents(),
          fetchVoteCounts(),
        ])
        setStudents(studentsData.length > 0 ? studentsData : FALLBACK_STUDENTS)
        setVotes(voteCounts)
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
    // 乐观更新
    setVotes(prev => ({
      ...prev,
      [studentId]: (prev[studentId] || 0) + 1,
    }))

    try {
      const result = await addVote(studentId)
      if (result.duplicate) {
        // 重复投票，回滚
        setVotes(prev => ({
          ...prev,
          [studentId]: Math.max((prev[studentId] || 1) - 1, 0),
        }))
        alert('你已经投过票了！')
      }
    } catch (err) {
      console.error('Failed to add vote:', err)
      // 回滚
      setVotes(prev => ({
        ...prev,
        [studentId]: Math.max((prev[studentId] || 1) - 1, 0),
      }))
    }
  }, [])

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
