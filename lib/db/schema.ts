import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pools (Bolões)
export const pools = pgTable("pools", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // Invite code
  ownerId: uuid("owner_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Many-to-many relationship between Users and Pools
export const usersToPools = pgTable("users_to_pools", {
  userId: uuid("user_id").references(() => users.id).notNull(),
  poolId: uuid("pool_id").references(() => pools.id).notNull(),
  totalPoints: integer("total_points").default(0).notNull(),
  totalCravadas: integer("total_cravadas").default(0).notNull(),
  totalAcertos: integer("total_acertos").default(0).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.poolId] }),
}));

// Matches (Partidas)
export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  apiId: integer("api_id").unique(), // ID from Football-Data.org
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  startTime: timestamp("start_time").notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  matchday: integer("matchday"),
  status: text("status").$type<"scheduled" | "live" | "finished">().default("scheduled").notNull(),
  group: text("group"), // e.g., "Group A"
  stage: text("stage").$type<"group" | "round_of_32" | "round_of_16" | "quarter_finals" | "semi_finals" | "third_place" | "final">().default("group").notNull(),
});

// Guesses (Palpites)
export const guesses = pgTable("guesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  poolId: uuid("pool_id").references(() => pools.id).notNull(),
  matchId: uuid("match_id").references(() => matches.id).notNull(),
  homeGuess: integer("home_guess"),
  awayGuess: integer("away_guess"),
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.userId, t.poolId, t.matchId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  pools: many(usersToPools),
  guesses: many(guesses),
}));

export const poolsRelations = relations(pools, ({ one, many }) => ({
  owner: one(users, { fields: [pools.ownerId], references: [users.id] }),
  members: many(usersToPools),
  guesses: many(guesses),
}));

export const usersToPoolsRelations = relations(usersToPools, ({ one }) => ({
  user: one(users, { fields: [usersToPools.userId], references: [users.id] }),
  pool: one(pools, { fields: [usersToPools.poolId], references: [pools.id] }),
}));

export const matchesRelations = relations(matches, ({ many }) => ({
  guesses: many(guesses),
}));

export const guessesRelations = relations(guesses, ({ one }) => ({
  user: one(users, { fields: [guesses.userId], references: [users.id] }),
  pool: one(pools, { fields: [guesses.poolId], references: [pools.id] }),
  match: one(matches, { fields: [guesses.matchId], references: [matches.id] }),
}));
