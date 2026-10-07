import { Board } from '@/components/game/board'
import { cn } from '@/lib/utils'
import type { PublicPlayer } from '@/lib/wordle'
import { MAX_GUESSES } from '@/lib/wordle'

function statusText(p: PublicPlayer) {
  if (p.solved) return `Solved in ${p.tries}`
  if (p.done) return 'Out of tries'
  if (p.tries === 0) return 'Thinking…'
  return `${p.tries} / ${MAX_GUESSES} tries`
}

export function PlayerPanel({
  player,
  isYou,
  rounds = 1,
}: {
  player: PublicPlayer
  isYou?: boolean
  rounds?: number
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
      <Board
        evaluations={player.evaluations}
        guesses={isYou ? null : player.guesses}
        size="sm"
        label={`${player.name}'s board`}
      />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {isYou ? 'You' : 'Opponent'}
        </span>
        <span className="truncate font-medium">{player.name}</span>
        <span
          className={cn(
            'text-sm',
            player.solved ? 'text-correct' : player.done ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {statusText(player)}
        </span>
        {rounds > 1 && (
          <span className="text-xs text-muted-foreground">
            {`Round ${player.round + 1} of ${rounds}`}
          </span>
        )}
      </div>
    </div>
  )
}
