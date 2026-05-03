import { useState, useEffect, useCallback } from 'react'
import { STUDENTS, type Comment, type VoteData } from '../data'
import { StudentCard } from '../components/StudentCard'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable
  }
}

export function HomePage() {
  const [votes, setVotes] = useState<VoteData>(() =>
    loadFromStorage<VoteData>('vibecraft_votes', {})
  )
  const [comments, setComments] = useState<Comment[]>(() =>
    loadFromStorage<Comment[]>('vibecraft_comments', [])
  )

  useEffect(() => {
    saveToStorage('vibecraft_votes', votes)
  }, [votes])

  useEffect(() => {
    saveToStorage('vibecraft_comments', comments)
  }, [comments])

  const handleVote = useCallback((studentId: string) => {
    setVotes(prev => ({
      ...prev,
      [studentId]: (prev[studentId] || 0) + 1,
    }))
  }, [])

  const handleAddComment = useCallback(
    (studentId: string, author: string, content: string) => {
      const newComment: Comment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        studentId,
        author: author.trim(),
        content: content.trim(),
        createdAt: Date.now(),
      }
      setComments(prev => [newComment, ...prev])
    },
    []
  )

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
      </div>

      <div className="student-grid">
        {STUDENTS.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            voteCount={votes[student.id] || 0}
            comments={comments.filter(c => c.studentId === student.id)}
            onVote={() => handleVote(student.id)}
            onAddComment={(author, content) =>
              handleAddComment(student.id, author, content)
            }
          />
        ))}
      </div>
    </section>
  )
}
