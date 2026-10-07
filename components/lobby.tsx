'use client'

import { useActionState } from 'react'
import { createGame, joinGame } from '@/app/actions/game'
import { Button } from '@/components/ui/button'
import { ROUND_OPTIONS } from '@/lib/wordle'

const inputClass =
  'h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40'

export function Lobby({ defaultCode = '' }: { defaultCode?: string }) {
  const [createState, createAction, creating] = useActionState(createGame, undefined)
  const [joinState, joinAction, joining] = useActionState(joinGame, undefined)

  return (
    <div className="flex w-full flex-col gap-4">
      {!defaultCode && (
        <section
          aria-labelledby="create-heading"
          className="flex flex-col gap-4 rounded-xl border bg-card p-5"
        >
          <div className="flex flex-col gap-1">
            <h2 id="create-heading" className="font-medium">
              Start a new duel
            </h2>
            <p className="text-sm text-muted-foreground">
              {"You'll get a code to share with your opponent."}
            </p>
          </div>
          <form action={createAction} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted-foreground">Your name</span>
              <input name="name" required maxLength={20} autoComplete="nickname" className={inputClass} />
            </label>
            <fieldset className="flex flex-col gap-1.5 text-sm">
              <legend className="mb-1.5 text-muted-foreground">Rounds</legend>
              <div className="grid grid-cols-3 gap-2">
                {ROUND_OPTIONS.map((n) => (
                  <label key={n} className="cursor-pointer">
                    <input
                      type="radio"
                      name="rounds"
                      value={n}
                      defaultChecked={n === 1}
                      className="peer sr-only"
                    />
                    <span className="flex h-11 items-center justify-center rounded-md border border-input bg-background font-medium transition peer-checked:border-correct peer-checked:bg-correct peer-checked:text-white peer-focus-visible:ring-3 peer-focus-visible:ring-ring/40">
                      {n === 1 ? 'Single' : `${n} rounds`}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {createState?.error && (
              <p role="alert" className="text-sm text-destructive">
                {createState.error}
              </p>
            )}
            <Button type="submit" disabled={creating} className="h-11 text-base">
              {creating ? 'Creating…' : 'Create game'}
            </Button>
          </form>
        </section>
      )}

      <section
        aria-labelledby="join-heading"
        className="flex flex-col gap-4 rounded-xl border bg-card p-5"
      >
        <div className="flex flex-col gap-1">
          <h2 id="join-heading" className="font-medium">
            {defaultCode ? `Join game ${defaultCode}` : 'Join a friend'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {defaultCode ? 'Enter your name to take the second seat.' : 'Enter the 6-character code they sent you.'}
          </p>
        </div>
        <form action={joinAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Your name</span>
            <input name="name" required maxLength={20} autoComplete="nickname" className={inputClass} />
          </label>
          {defaultCode ? (
            <input type="hidden" name="code" value={defaultCode} />
          ) : (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted-foreground">Game code</span>
              <input
                name="code"
                required
                maxLength={6}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                placeholder="ABC123"
                className={`${inputClass} font-mono uppercase tracking-[0.3em]`}
              />
            </label>
          )}
          {joinState?.error && (
            <p role="alert" className="text-sm text-destructive">
              {joinState.error}
            </p>
          )}
          <Button
            type="submit"
            variant={defaultCode ? 'default' : 'secondary'}
            disabled={joining}
            className="h-11 text-base"
          >
            {joining ? 'Joining…' : 'Join game'}
          </Button>
        </form>
      </section>
    </div>
  )
}
