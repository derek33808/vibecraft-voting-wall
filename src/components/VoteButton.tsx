import { useState } from 'react'

interface VoteButtonProps {
  count: number
  voted: boolean
  onVote: () => void
}

export function VoteButton({ count, voted, onVote }: VoteButtonProps) {
  const [animating, setAnimating] = useState(false)

  const handleClick = () => {
    setAnimating(true)
    onVote()
    setTimeout(() => setAnimating(false), 400)
  }

  return (
    <button
      className={`vote-button ${voted ? 'vote-button--voted' : ''} ${animating ? 'vote-button--animate' : ''}`}
      onClick={handleClick}
      title={voted ? '取消点赞' : '点赞'}
    >
      <span className="vote-icon">{voted ? '❤️' : '♥'}</span>
      <span className="vote-count">{count}</span>
    </button>
  )
}
