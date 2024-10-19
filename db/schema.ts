import {
	pgTable,
	serial,
	varchar,
	timestamp,
	integer,
	boolean,
	text,
} from "drizzle-orm/pg-core";

export const bingoEvents = pgTable("bingo_events", {
	id: serial("id").primaryKey(),
	slug: varchar("slug", { length: 255 }).notNull().unique(),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description"),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date"),
	adminPassword: varchar("admin_password", { length: 255 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
	id: serial("id").primaryKey(),
	eventId: integer("event_id")
		.references(() => bingoEvents.id)
		.notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
});

export const drawnNumbers = pgTable("drawn_numbers", {
	id: serial("id").primaryKey(),
	gameId: integer("game_id")
		.references(() => games.id)
		.notNull(),
	number: integer("number").notNull(),
	letter: varchar("letter", { length: 1 }).notNull(),
	drawnAt: timestamp("drawn_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	username: varchar("username", { length: 255 }).notNull().unique(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	isAdmin: boolean("is_admin").default(false).notNull(),
});
