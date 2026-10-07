'use server'

import { and, eq, lt, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { games, players } from '@/lib/db/schema'
import { getPlayerIdForGame, loadGame, roundWords, setPlayerCookie } from '@/lib/game-server'
import { MAX_GUESSES, ROUND_OPTIONS, isDone, isValidShape, normalizeGuess } from '@/lib/wordle'
import { randomAnswers } from '@/lib/words'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

function cleanName(raw: FormDataEntryValue | null) {
  const name = String(raw ?? '').trim().slice(0, 20)
  return name.length > 0 ? name : null
}

function cleanCode(raw: FormDataEntryValue | null) {
  return String(raw ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
}

export type FormState = { error?: string } | undefined

export async function createGame(_: FormState, formData: FormData): Promise<FormState> {
  const name = cleanName(formData.get('name'))
  if (!name) return { error: 'Enter your name to start a game.' }

  const requestedRounds = Number(formData.get('rounds'))
  const rounds = (ROUND_OPTIONS as readonly number[]).includes(requestedRounds) ? requestedRounds : 1
  const words = randomAnswers(rounds)

  const code = generateCode()
  const playerId = crypto.randomUUID()
  await db.insert(games).values({ code, word: words[0], words, rounds })
  await db.insert(players).values({ id: playerId, gameCode: code, seat: 1, name })
  await setPlayerCookie(code, playerId)
  redirect(`/game/${code}`)
}

export async function joinGame(_: FormState, formData: FormData): Promise<FormState> {
  const name = cleanName(formData.get('name'))
  const code = cleanCode(formData.get('code'))
  if (!name) return { error: 'Enter your name to join.' }
  if (code.length !== 6) return { error: 'Game codes are 6 characters.' }

  const loaded = await loadGame(code)
  if (!loaded) return { error: 'No game found with that code.' }

  const existingId = await getPlayerIdForGame(code)
  if (existingId && loaded.roster.some((p) => p.id === existingId)) {
    redirect(`/game/${code}`)
  }
  if (loaded.roster.length >= 2) return { error: 'That game already has two players.' }

  const playerId = crypto.randomUUID()
  try {
    await db.insert(players).values({ id: playerId, gameCode: code, seat: 2, name })
  } catch {
    return { error: 'That game already has two players.' }
  }
  await setPlayerCookie(code, playerId)
  redirect(`/game/${code}`)
}

export async function submitGuess(code: string, rawGuess: string): Promise<{ error?: string }> {
  const guess = normalizeGuess(rawGuess)
  if (!isValidShape(guess)) return { error: 'Guesses must be 5 letters.' }

  const playerId = await getPlayerIdForGame(code)
  if (!playerId) return { error: 'You are not in this game.' }

  const loaded = await loadGame(code)
  if (!loaded) return { error: 'Game not found.' }
  const me = loaded.roster.find((p) => p.id === playerId)
  if (!me) return { error: 'You are not in this game.' }
  if (me.solved || me.guesses.length >= MAX_GUESSES) return { error: 'You are out of guesses.' }

  const solved = guess === roundWords(loaded.game)[me.round]
  const updated = await db
    .update(players)
    .set({
      guesses: sql`array_append(${players.guesses}, ${guess})`,
      solved,
    })
    .where(
      and(
        eq(players.id, playerId),
        eq(players.round, me.round),
        eq(players.solved, false),
        lt(sql`cardinality(${players.guesses})`, MAX_GUESSES),
      ),
    )
    .returning({ id: players.id })

  if (updated.length === 0) return { error: 'You are out of guesses.' }
  return {}
}

export async function nextRound(code: string): Promise<{ error?: string }> {
  const playerId = await getPlayerIdForGame(code)
  if (!playerId) return { error: 'You are not in this game.' }

  const loaded = await loadGame(code)
  if (!loaded) return { error: 'Game not found.' }
  const me = loaded.roster.find((p) => p.id === playerId)
  if (!me) return { error: 'You are not in this game.' }
  if (!isDone(me)) return { error: 'Finish this round first.' }
  if (me.round >= loaded.game.rounds - 1) return { error: 'That was the final round.' }

  await db
    .update(players)
    .set({
      history: sql`${players.history} || jsonb_build_array(jsonb_build_object('guesses', to_jsonb(${players.guesses}), 'solved', ${players.solved}))`,
      guesses: sql`'{}'`,
      solved: false,
      round: sql`${players.round} + 1`,
    })
    .where(and(eq(players.id, playerId), eq(players.round, me.round)))
  return {}
}
