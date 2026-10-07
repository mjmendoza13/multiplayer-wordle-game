'use client'

import Link from 'next/link'
import { useEffect, useEffectEvent, useMemo, useState, useTransition } from 'react'
import useSWR from 'swr'
import { submitGuess } from '@/app/actions/game'
import { Board } from '@/components/game/board'
import { InviteCard } from '@/components/game/invite-card'
import { Keyboard } from '@/components/game/keyboard'
import { PlayerPanel } from '@/components/game/player-panel'
import { ResultBanner } from '@/components/game/result-banner'
import { WORD_LENGTH, type GameState, type LetterState } from '@/lib/wordle'

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load game')
  return res.json()
}

const PRIORITY: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 }

export function GameClient({ code, initialState }: { code: string; initialState: GameState }) {
  const { data, mutate } = useSWR<GameState>(`/api/game/${code}`, fetcher, {
    fallbackData: initialState,
    refreshInterval: (latest) => (latest?.status === 'finished' ? 0 : 1500),
  })
  const state = data ?? initialState
  const { me, opponent } = state

  const [input, setInput] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [pending, startTransition] = useTransition()

  const locked = me.done || pending

  const letterStates = useMemo(() => {
    const map: Record<string, LetterState> = {}
    me.guesses?.forEach((guess, row) => {
      guess.split('').forEach((letter, i) => {
        const s = me.evaluations[row][i]
        if (!map[letter] || PRIORITY[s] > PRIORITY[map[letter]]) map[letter] = s
      })
    })
    return map
  }, [me.guesses, me.evaluations])

  function flash(text: string) {
    setMessage(text)
    setShake(true)
    setTimeout(() => setShake(false), 400)
    setTimeout(() => setMessage(null), 1800)
  }

  function handleKey(key: string) {
    if (locked) return
    if (key === 'enter') {
      if (input.length !== WORD_LENGTH) {
        flash('Not enough letters')
        return
      }
      const guess = input
      startTransition(async () => {
        const result = await submitGuess(code, guess)
        if (result.error) {
          flash(result.error)
          return
        }
        await mutate()
        setInput('')
      })
      return
    }
    if (key === 'backspace') {
      setInput((v) => v.slice(0, -1))
      return
    }
    if (/^[a-z]$/.test(key)) {
      setInput((v) => (v.length < WORD_LENGTH ? v + key : v))
    }
  }

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const target = e.target as HTMLElement | null
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return
    const key = e.key.toLowerCase()
    if (key === 'enter' || key === 'backspace' || /^[a-z]$/.test(key)) {
      e.preventDefault()
      handleKey(key)
    }
  })

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKeyDown(e)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          WorDuel
        </Link>
        <span className="text-sm text-muted-foreground">
          {'Game '}
          <span className="font-mono font-semibold text-foreground">{code}</span>
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
        <section aria-label="Your game" className="flex flex-col items-center gap-5 lg:order-2">
          <div className="relative flex flex-col items-center">
            <div aria-live="polite" className="pointer-events-none absolute -top-2 z-10 h-0">
              {message && (
                <span className="-translate-y-full rounded-md bg-foreground px-3 py-1.5 text-sm font-semibold text-background">
                  {message}
                </span>
              )}
            </div>
            <Board
              evaluations={me.evaluations}
              guesses={me.guesses}
              currentInput={input}
              showCurrentRow={!me.done}
              shake={shake}
              label="Your board"
            />
          </div>
          <div className="w-full max-w-lg">
            <ResultBanner state={state} />
          </div>
          {!me.done && <Keyboard letterStates={letterStates} onKey={handleKey} disabled={pending} />}
        </section>

        <aside aria-label="Players" className="flex w-full flex-col gap-3 lg:order-1 lg:w-72">
          {opponent ? <PlayerPanel player={opponent} /> : <InviteCard code={code} />}
          <PlayerPanel player={me} isYou />
          <p className="px-1 text-xs leading-relaxed text-muted-foreground">
            {"Fewest guesses wins. You can see your opponent's colors, but not their letters until the game ends."}
          </p>
        </aside>
      </main>
    </div>
  )
}
