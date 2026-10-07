import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GameState } from '@/lib/wordle'

type Props = {
  state: GameState
  onNextRound: () => void
  advancing: boolean
}

export function ResultBanner({ state, onNextRound, advancing }: Props) {
  const { me, opponent, word, rounds } = state
  const multi = rounds > 1

  if (state.status !== 'finished') {
    if (!me.done) return null
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-xl border bg-card px-5 py-4 text-center">
        <p className="font-medium">
          {me.solved ? `Nice — solved in ${me.tries}!` : 'Out of tries.'}
          {word && (
            <>
              {' The word was '}
              <span className="font-mono font-bold uppercase text-correct">{word}</span>.
            </>
          )}
        </p>
        {me.matchDone ? (
          <p className="text-sm text-muted-foreground">
            {opponent ? `Waiting for ${opponent.name} to finish…` : 'Waiting for an opponent to join and play…'}
          </p>
        ) : (
          <Button onClick={onNextRound} disabled={advancing}>
            {advancing ? 'Loading…' : `Start round ${me.round + 2} of ${rounds}`}
          </Button>
        )}
      </div>
    )
  }

  const won = state.winnerSeat === me.seat
  const headline = state.isTie ? "It's a tie!" : won ? 'You win!' : `${opponent?.name} wins`
  const fmt = (p: typeof me) =>
    multi ? `${p.totalScore} total` : p.solved ? `${p.tries}` : 'X'

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border px-5 py-5 text-center',
        won ? 'border-correct/50 bg-correct/10' : 'bg-card',
      )}
    >
      <div className="flex items-center gap-2">
        {won && <Trophy className="size-5 text-present" aria-hidden="true" />}
        <p className="text-xl font-semibold">{headline}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        {!multi && (
          <>
            {'The word was '}
            <span className="font-mono font-bold uppercase text-foreground">{word}</span>
            {' · '}
          </>
        )}
        {`You: ${fmt(me)} · ${opponent?.name}: ${opponent ? fmt(opponent) : ''}`}
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        New game
      </Link>
    </div>
  )
}
