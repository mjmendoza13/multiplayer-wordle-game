import { Lobby } from '@/components/lobby'
import { BrandTiles } from '@/components/brand-tiles'

export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <header className="flex flex-col items-center gap-4 text-center">
          <BrandTiles />
          <h1 className="text-balance text-3xl font-semibold tracking-tight">Wordle Duel</h1>
          <p className="text-pretty text-muted-foreground">
            Same secret word. Six tries each. Whoever solves it in fewer guesses wins.
          </p>
        </header>
        <Lobby />
      </div>
    </main>
  )
}
