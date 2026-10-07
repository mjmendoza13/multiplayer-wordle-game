import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GameClient } from '@/components/game/game-client'
import { Lobby } from '@/components/lobby'
import { buildGameState, getPlayerIdForGame, loadGame } from '@/lib/game-server'

export default async function GamePage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params
  const code = rawCode.toUpperCase()

  const loaded = await loadGame(code)
  if (!loaded) notFound()

  const playerId = await getPlayerIdForGame(code)
  const initialState = playerId ? await buildGameState(code, playerId) : null

  if (!initialState) {
    const full = loaded.roster.length >= 2
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">WorDuel</h1>
          {full ? (
            <>
              <p className="text-muted-foreground">This game already has two players.</p>
              <Link href="/" className="text-primary underline-offset-4 hover:underline">
                Start your own game
              </Link>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                {`${loaded.roster[0]?.name ?? 'Someone'} challenged you to a duel.`}
              </p>
              <Lobby defaultCode={code} />
            </>
          )}
        </div>
      </main>
    )
  }

  return <GameClient code={code} initialState={initialState} />
}
