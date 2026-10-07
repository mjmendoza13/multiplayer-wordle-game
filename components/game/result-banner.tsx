import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GameState } from '@/lib/wordle'

export function ResultBanner({ state }: { state: GameState }) {
  const { me, opponent, word } = state

  if (state.status !== 'finished') {
    if (!me.done) return null
    return (
      <div role="status" className="flex flex-col items-center gap-1 rounded-xl border bg-card px-5 py-4 text-center">
        <p className="font-medium">
          {me.solved ? `Nice — solved in ${me.tries}!` : 'Out of tries.'}
          {word && (
            <>
              {' The word was '}
              <span className="font-mono font-bold uppercase text-correct">{word}</span>.
            </>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          {opponent ? `Waiting for ${opponent.name} to finish…` : 'Waiting for an opponent to join and play…'}
        </p>
      </div>
    )
  }

  const won = state.winnerSeat === me.seat
  const headline = state.isTie ? "It's a tie!" : won ? 'You win!' : `${opponent?.name} wins`

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
        {'The word was '}
        <span className="font-mono font-bold uppercase text-foreground">{word}</span>
        {' · '}
        {`You: ${me.solved ? me.tries : 'X'} · ${opponent?.name}: ${opponent?.solved ? opponent.tries : 'X'}`}
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
