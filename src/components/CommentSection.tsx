import { useState } from 'react'
import type { Comment } from '../data'

interface CommentSectionProps {
  comments: Comment[]
  onAddComment: (author: string, content: string) => void
}

export function CommentSection({ comments, onAddComment }: CommentSectionProps) {
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    if (!author.trim() || !content.trim()) return
    onAddComment(author, content)
    setAuthor('')
    setContent('')
  }

  return (
    <div className="comment-section">
      <div className="comment-form">
        <input
          className="comment-input comment-author"
          placeholder="你的昵称"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          maxLength={20}
        />
        <textarea
          className="comment-input comment-content"
          placeholder="留下你的评论..."
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={200}
          rows={2}
        />
        <button
          className="comment-submit"
          onClick={handleSubmit}
          disabled={!author.trim() || !content.trim()}
        >
          发送留言
        </button>
      </div>

      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="comment-empty">还没有留言，来抢沙发吧！</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-meta">
                <span className="comment-author-name">{comment.author}</span>
                <span className="comment-time">
                  {new Date(comment.createdAt).toLocaleString('zh-CN')}
                </span>
              </div>
              <p className="comment-body">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
