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

export const ROUND_OPTIONS = [1, 5, 10] as const
export const MISS_SCORE = MAX_GUESSES + 1

export type RoundResult = { guesses: string[]; solved: boolean }

export function isDone(player: RoundResult) {
  return player.solved || player.guesses.length >= MAX_GUESSES
}

/** Lower is better; failing to solve counts as one more than the max. */
export function score(player: RoundResult) {
  return player.solved ? player.guesses.length : MISS_SCORE
}

type MatchPlayer = RoundResult & { round: number; history: RoundResult[] }

export function completedRounds(p: MatchPlayer): RoundResult[] {
  return isDone(p) ? [...p.history, { guesses: p.guesses, solved: p.solved }] : p.history
}

export function isMatchDone(p: MatchPlayer, rounds: number) {
  return p.round >= rounds - 1 && isDone(p)
}

export function totalScore(p: MatchPlayer) {
  return completedRounds(p).reduce((sum, r) => sum + score(r), 0)
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
  round: number
  matchDone: boolean
  totalScore: number
  results: { tries: number; solved: boolean }[]
}

export type GameState = {
  code: string
  status: 'waiting' | 'playing' | 'finished'
  rounds: number
  me: PublicPlayer
  opponent: PublicPlayer | null
  winnerSeat: number | null
  isTie: boolean
  /** The answer for my current round, once I've finished it. */
  word: string | null
  /** Every round's answer, only once the match is finished. */
  words: string[] | null
}
