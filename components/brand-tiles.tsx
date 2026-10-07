import { cn } from '@/lib/utils'

const LETTERS: { letter: string; tone: string }[] = [
  { letter: 'D', tone: 'bg-correct' },
  { letter: 'U', tone: 'bg-absent' },
  { letter: 'E', tone: 'bg-present' },
  { letter: 'L', tone: 'bg-correct' },
]

export function BrandTiles() {
  return (
    <div className="flex gap-1.5" aria-hidden="true">
      {LETTERS.map(({ letter, tone }) => (
        <span
          key={letter}
          className={cn(
            'flex size-11 items-center justify-center rounded-md font-mono text-xl font-bold text-white',
            tone,
          )}
        >
          {letter}
        </span>
      ))}
    </div>
  )
}
