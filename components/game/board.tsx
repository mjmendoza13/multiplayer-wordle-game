import { cn } from '@/lib/utils'
import { MAX_GUESSES, WORD_LENGTH, type LetterState } from '@/lib/wordle'

const STATE_CLASS: Record<LetterState, string> = {
  correct: 'border-correct bg-correct text-white',
  present: 'border-present bg-present text-black',
  absent: 'border-absent bg-absent text-white',
}

const STATE_LABEL: Record<LetterState, string> = {
  correct: 'correct',
  present: 'in the word',
  absent: 'not in the word',
}

type BoardProps = {
  evaluations: LetterState[][]
  guesses: string[] | null
  currentInput?: string
  showCurrentRow?: boolean
  shake?: boolean
  size?: 'lg' | 'sm'
  label: string
}

export function Board({
  evaluations,
  guesses,
  currentInput = '',
  showCurrentRow = false,
  shake = false,
  size = 'lg',
  label,
}: BoardProps) {
  const rows = Array.from({ length: MAX_GUESSES }, (_, rowIndex) => rowIndex)
  const tile =
    size === 'lg'
      ? 'size-14 text-3xl sm:size-16 border-2 rounded-md'
      : 'size-7 text-xs border rounded-sm'

  return (
    <div role="grid" aria-label={label} className={cn('flex flex-col', size === 'lg' ? 'gap-1.5' : 'gap-1')}>
      {rows.map((rowIndex) => {
        const evaluation = evaluations[rowIndex]
        const submitted = guesses?.[rowIndex]
        const isCurrent = showCurrentRow && rowIndex === evaluations.length
        const letters = submitted ?? (isCurrent ? currentInput : '')

        return (
          <div
            key={rowIndex}
            role="row"
            className={cn('flex', size === 'lg' ? 'gap-1.5' : 'gap-1', isCurrent && shake && 'animate-row-shake')}
          >
            {Array.from({ length: WORD_LENGTH }, (_, i) => {
              const letter = letters[i] ?? ''
              const state = evaluation?.[i]
              return (
                <div
                  key={i}
                  role="gridcell"
                  aria-label={
                    state
                      ? `${letter ? letter.toUpperCase() + ', ' : ''}${STATE_LABEL[state]}`
                      : letter
                        ? letter.toUpperCase()
                        : 'empty'
                  }
                  className={cn(
                    'flex items-center justify-center font-mono font-bold uppercase transition-colors duration-300',
                    tile,
                    state
                      ? STATE_CLASS[state]
                      : letter
                        ? 'animate-tile-pop border-muted-foreground text-foreground'
                        : 'border-border',
                  )}
                >
                  {letter}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
