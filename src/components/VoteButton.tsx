import { useState } from 'react'

interface VoteButtonProps {
  count: number
  onVote: () => void
}

export function VoteButton({ count, onVote }: VoteButtonProps) {
  const [animating, setAnimating] = useState(false)

  const handleClick = () => {
    setAnimating(true)
    onVote()
    setTimeout(() => setAnimating(false), 400)
  }

  return (
    <button
      className={`vote-button ${animating ? 'vote-button--animate' : ''}`}
      onClick={handleClick}
      title="点赞"
    >
      <span className="vote-icon">♥</span>
      <span className="vote-count">{count}</span>
    </button>
  )
}
