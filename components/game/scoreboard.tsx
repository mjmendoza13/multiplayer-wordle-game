import { cn } from '@/lib/utils'
import type { GameState, PublicPlayer } from '@/lib/wordle'

function Cell({ result }: { result?: PublicPlayer['results'][number] }) {
  if (!result) return <td className="px-2 py-1.5 text-center text-muted-foreground">{'–'}</td>
  return (
    <td
      className={cn(
        'px-2 py-1.5 text-center font-mono font-semibold',
        result.solved ? 'text-correct' : 'text-destructive',
      )}
    >
      {result.solved ? result.tries : 'X'}
    </td>
  )
}

export function Scoreboard({ state }: { state: GameState }) {
  const { me, opponent, rounds, words } = state
  const rows = Array.from({ length: rounds }, (_, i) => i)

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">Round-by-round results</caption>
        <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-medium">
              Round
            </th>
            <th scope="col" className="px-2 py-2 text-center font-medium">
              You
            </th>
            <th scope="col" className="max-w-20 truncate px-2 py-2 text-center font-medium">
              {opponent?.name ?? 'Opp.'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((i) => (
            <tr key={i} className={cn(i === me.round && !me.matchDone && 'bg-accent/40')}>
              <th scope="row" className="px-3 py-1.5 text-left font-normal text-muted-foreground">
                {i + 1}
                {words?.[i] && (
                  <span className="ml-2 font-mono text-xs font-semibold uppercase text-foreground">{words[i]}</span>
                )}
              </th>
              <Cell result={me.results[i]} />
              <Cell result={opponent?.results[i]} />
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t bg-muted/50 font-semibold">
          <tr>
            <th scope="row" className="px-3 py-2 text-left">
              Total
            </th>
            <td className="px-2 py-2 text-center font-mono">{me.totalScore}</td>
            <td className="px-2 py-2 text-center font-mono">{opponent?.totalScore ?? '–'}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
