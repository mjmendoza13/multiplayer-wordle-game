import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LetterState } from '@/lib/wordle'

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

const KEY_CLASS: Record<LetterState, string> = {
  correct: 'bg-correct text-white',
  present: 'bg-present text-black',
  absent: 'bg-absent/60 text-muted-foreground',
}

type KeyboardProps = {
  letterStates: Record<string, LetterState>
  onKey: (key: string) => void
  disabled?: boolean
}

export function Keyboard({ letterStates, onKey, disabled }: KeyboardProps) {
  const base =
    'flex h-14 flex-1 items-center justify-center rounded-md font-semibold uppercase transition-colors select-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <div className="flex w-full max-w-lg flex-col gap-2" aria-label="On-screen keyboard">
      {ROWS.map((row, rowIndex) => (
        <div key={row} className="flex gap-1.5">
          {rowIndex === 1 && <div className="flex-[0.5]" aria-hidden="true" />}
          {rowIndex === 2 && (
            <button
              type="button"
              onClick={() => onKey('enter')}
              disabled={disabled}
              className={cn(base, 'flex-[1.5] bg-secondary text-xs hover:bg-accent')}
            >
              Enter
            </button>
          )}
          {row.split('').map((letter) => {
            const state = letterStates[letter]
            return (
              <button
                key={letter}
                type="button"
                onClick={() => onKey(letter)}
                disabled={disabled}
                className={cn(base, state ? KEY_CLASS[state] : 'bg-secondary hover:bg-accent')}
              >
                {letter}
              </button>
            )
          })}
          {rowIndex === 2 && (
            <button
              type="button"
              onClick={() => onKey('backspace')}
              disabled={disabled}
              aria-label="Backspace"
              className={cn(base, 'flex-[1.5] bg-secondary hover:bg-accent')}
            >
              <Delete className="size-5" aria-hidden="true" />
            </button>
          )}
          {rowIndex === 1 && <div className="flex-[0.5]" aria-hidden="true" />}
        </div>
      ))}
    </div>
  )
}
