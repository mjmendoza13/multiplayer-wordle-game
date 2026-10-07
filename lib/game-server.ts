import { asc, eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { games, players, type Player } from '@/lib/db/schema'
import { evaluateGuess, isDone, score, type GameState, type PublicPlayer } from '@/lib/wordle'

export function playerCookieName(code: string) {
  return `wordle_player_${code}`
}

export async function getPlayerIdForGame(code: string) {
  const store = await cookies()
  return store.get(playerCookieName(code))?.value ?? null
}

export async function setPlayerCookie(code: string, playerId: string) {
  const store = await cookies()
  store.set(playerCookieName(code), playerId, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function loadGame(code: string) {
  const [game] = await db.select().from(games).where(eq(games.code, code)).limit(1)
  if (!game) return null
  const roster = await db
    .select()
    .from(players)
    .where(eq(players.gameCode, code))
    .orderBy(asc(players.seat))
  return { game, roster }
}

function toPublic(p: Player, word: string, revealLetters: boolean): PublicPlayer {
  return {
    name: p.name,
    seat: p.seat,
    tries: p.guesses.length,
    solved: p.solved,
    done: isDone(p),
    evaluations: p.guesses.map((g) => evaluateGuess(g, word)),
    guesses: revealLetters ? p.guesses : null,
  }
}

export async function buildGameState(code: string, playerId: string): Promise<GameState | null> {
  const loaded = await loadGame(code)
  if (!loaded) return null
  const { game, roster } = loaded
  const me = roster.find((p) => p.id === playerId)
  if (!me) return null
  const opponent = roster.find((p) => p.id !== playerId) ?? null

  const finished = !!opponent && isDone(me) && isDone(opponent)
  let winnerSeat: number | null = null
  let isTie = false
  if (finished && opponent) {
    const a = score(me)
    const b = score(opponent)
    if (a === b) isTie = true
    else winnerSeat = a < b ? me.seat : opponent.seat
  }

  return {
    code,
    status: !opponent ? 'waiting' : finished ? 'finished' : 'playing',
    me: toPublic(me, game.word, true),
    opponent: opponent ? toPublic(opponent, game.word, finished) : null,
    winnerSeat,
    isTie,
    word: finished || isDone(me) ? game.word : null,
  }
}
