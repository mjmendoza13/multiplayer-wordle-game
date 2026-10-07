import { sql } from 'drizzle-orm'
import { boolean, integer, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const games = pgTable('games', {
  code: text('code').primaryKey(),
  word: text('word').notNull(),
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
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.gameCode, t.seat)],
)

export type Player = typeof players.$inferSelect
