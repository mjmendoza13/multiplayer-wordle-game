export const MAX_GUESSES = 6
export const WORD_LENGTH = 5

export type LetterState = 'correct' | 'present' | 'absent'

export function evaluateGuess(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = Array(WORD_LENGTH).fill('absent')
  const remaining: Record<string, number> = {}

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct'
    } else {
      remaining[answer[i]] = (remaining[answer[i]] ?? 0) + 1
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'correct') continue
    const letter = guess[i]
    if (remaining[letter] > 0) {
      result[i] = 'present'
      remaining[letter]--
    }
  }
  return result
}

export function isDone(player: { guesses: string[]; solved: boolean }) {
  return player.solved || player.guesses.length >= MAX_GUESSES
}

/** Lower is better; failing to solve counts as one more than the max. */
export function score(player: { guesses: string[]; solved: boolean }) {
  return player.solved ? player.guesses.length : MAX_GUESSES + 1
}

export function normalizeGuess(raw: string) {
  return raw.trim().toLowerCase()
}

export function isValidShape(word: string) {
  return /^[a-z]{5}$/.test(word)
}

export type PublicPlayer = {
  name: string
  seat: number
  tries: number
  solved: boolean
  done: boolean
  evaluations: LetterState[][]
  guesses: string[] | null
}

export type GameState = {
  code: string
  status: 'waiting' | 'playing' | 'finished'
  me: PublicPlayer
  opponent: PublicPlayer | null
  winnerSeat: number | null
  isTie: boolean
  word: string | null
}
