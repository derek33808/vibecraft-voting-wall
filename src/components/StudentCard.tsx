import { useState } from 'react'
import type { Student, Comment } from '../data'
import { CommentSection } from './CommentSection'
import { VoteButton } from './VoteButton'

interface StudentCardProps {
  student: Student
  voteCount: number
  comments: Comment[]
  onVote: () => void
  onAddComment: (author: string, content: string) => void
}

export function StudentCard({
  student,
  voteCount,
  comments,
  onVote,
  onAddComment,
}: StudentCardProps) {
  const [showComments, setShowComments] = useState(false)

  return (
    <div className="student-card">
      <div className="card-header">
        <div className="student-avatar">{student.name[0]}</div>
        <h3 className="student-name">{student.name}</h3>
        <VoteButton count={voteCount} onVote={onVote} />
      </div>

      <div className="card-links">
        <a
          href={student.day1Url}
          target="_blank"
          rel="noopener noreferrer"
          className="card-link card-link--day1"
        >
          <span className="link-day">Day 1</span>
          <span className="link-label">个人主页</span>
          <span className="link-arrow">↗</span>
        </a>

        {student.day2Status === 'published' ? (
          <a
            href={student.day2Url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-link card-link--day2"
          >
            <span className="link-day">Day 2</span>
            <span className="link-label">{student.day2Label}</span>
            <span className="link-arrow">↗</span>
          </a>
        ) : (
          <div className="card-link card-link--wip">
            <span className="link-day">Day 2</span>
            <span className="link-label">{student.day2Label}</span>
            <span className="link-status">🚧</span>
          </div>
        )}
      </div>

      <button
        className="comment-toggle"
        onClick={() => setShowComments(!showComments)}
      >
        💬 留言 ({comments.length})
      </button>

      {showComments && (
        <CommentSection comments={comments} onAddComment={onAddComment} />
      )}
    </div>
  )
}
