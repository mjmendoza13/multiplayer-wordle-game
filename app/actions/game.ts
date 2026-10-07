'use server'

import { and, eq, lt, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { games, players } from '@/lib/db/schema'
import { getPlayerIdForGame, loadGame, setPlayerCookie } from '@/lib/game-server'
import { MAX_GUESSES, isValidShape, normalizeGuess } from '@/lib/wordle'
import { randomAnswer } from '@/lib/words'

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

  const code = generateCode()
  const playerId = crypto.randomUUID()
  await db.insert(games).values({ code, word: randomAnswer() })
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

  const solved = guess === loaded.game.word
  const updated = await db
    .update(players)
    .set({
      guesses: sql`array_append(${players.guesses}, ${guess})`,
      solved,
    })
    .where(
      and(
        eq(players.id, playerId),
        eq(players.solved, false),
        lt(sql`cardinality(${players.guesses})`, MAX_GUESSES),
      ),
    )
    .returning({ id: players.id })

  if (updated.length === 0) return { error: 'You are out of guesses.' }
  return {}
}
