import { NextResponse } from 'next/server'
import { buildGameState, getPlayerIdForGame } from '@/lib/game-server'

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params
  const playerId = await getPlayerIdForGame(code)
  if (!playerId) return NextResponse.json({ error: 'Not a player' }, { status: 403 })

  const state = await buildGameState(code, playerId)
  if (!state) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(state, { headers: { 'Cache-Control': 'no-store' } })
}
