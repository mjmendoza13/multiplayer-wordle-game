import { sql } from 'drizzle-orm'
import { boolean, integer, jsonb, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import type { RoundResult } from '@/lib/wordle'

export const games = pgTable('games', {
  code: text('code').primaryKey(),
  word: text('word').notNull(),
  rounds: integer('rounds').notNull().default(1),
  words: text('words').array().notNull().default(sql`'{}'`),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
})

export const players = pgTable(
  'players',
  {
    id: text('id').primaryKey(),
    gameCode: text('gameCode').notNull(),
    seat: integer('seat').notNull(),
    name: text('name').notNull(),
    guesses: text('guesses').array().notNull().default(sql`'{}'`),
    solved: boolean('solved').notNull().default(false),
    round: integer('round').notNull().default(0),
    history: jsonb('history').$type<RoundResult[]>().notNull().default(sql`'[]'::jsonb`),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.gameCode, t.seat)],
)

export type Player = typeof players.$inferSelect
export type Game = typeof games.$inferSelect
