import { db } from "@/db";
import { bingoEvents, games, drawnNumbers } from "@/db/schema";
import { and, desc, eq, not, sql } from "drizzle-orm";
import { boolean } from "drizzle-orm/pg-core";

export function getBingoLetter(number: number): string {
	if (number >= 1 && number <= 15) return "B";
	if (number >= 16 && number <= 30) return "I";
	if (number >= 31 && number <= 45) return "N";
	if (number >= 46 && number <= 60) return "G";
	if (number >= 61 && number <= 75) return "O";
	throw new Error("Invalid bingo number");
}

export async function getActiveEvent({
	slug,
}: {
	slug: string;
}) {
	const activeEvents = await db
		.select()
		.from(bingoEvents)
		.where(and(eq(bingoEvents.isActive, true), eq(bingoEvents.slug, slug)))
		.limit(1);
	return activeEvents[0] || null;
}

export async function getEventGames(eventId: number | undefined) {
	if (!eventId) return [];
	return db
		.select()
		.from(games)
		.where(eq(games.eventId, eventId))
		.orderBy(games.createdAt);
}

export async function getGameDrawnNumbers(gameId: number) {
	return db
		.select()
		.from(drawnNumbers)
		.where(eq(drawnNumbers.gameId, gameId))
		.orderBy(desc(drawnNumbers.drawnAt));
}

export async function saveDrawnNumber(number: number, gameId: number) {
	// Check if the number has already been drawn
	const existingNumber = await db
		.select()
		.from(drawnNumbers)
		.where(
			and(eq(drawnNumbers.number, number), eq(drawnNumbers.gameId, gameId)),
		);

	if (existingNumber.length > 0) {
		return {
			message: "El número ya ha sido llamado.",
		};
	}

	await db.insert(drawnNumbers).values({
		number,
		gameId,
		letter: getBingoLetter(number),
	});
}

export async function getActiveEvents() {
	const activeEvents = await db
		.select()
		.from(bingoEvents)
		.where(eq(bingoEvents.isActive, true));

	return activeEvents;
}

export async function createNewGame(eventId: number | undefined, name: string) {
	if (!eventId) return null;
	const [newGame] = await db
		.insert(games)
		.values({
			eventId,
			isActive: true,
			name,
		})
		.returning();

	// Deactivate other games for this event
	await db
		.update(games)
		.set({ isActive: false })
		.where(and(eq(games.eventId, eventId), sql`id != ${newGame.id}`));

	return newGame;
}

export async function switchActiveGame(
	eventId: number | undefined,
	gameId: number,
) {
	if (!eventId) return;
	await db.transaction(async (tx) => {
		await tx
			.update(games)
			.set({ isActive: false })
			.where(
				and(
					eq(games.eventId, eventId),
					eq(games.isActive, true),
					not(eq(games.id, gameId)),
				),
			);

		// Activate the selected game
		await tx
			.update(games)
			.set({ isActive: true })
			.where(and(eq(games.eventId, eventId), eq(games.id, gameId)));
	});
}

export async function deactivateActiveGame(eventId: number | undefined) {
	if (!eventId) return;
	await db
		.update(games)
		.set({ isActive: false })
		.where(and(eq(games.eventId, eventId), eq(games.isActive, true)));
}

export async function getActiveGame(eventId: number | undefined) {
	if (!eventId) return null;
	const activeGames = await db
		.select({
			id: games.id,
			name: games.name,
			createdAt: games.createdAt,
			eventId: games.eventId,
			isActive: games.isActive,
			event: bingoEvents,
		})
		.from(games)
		.innerJoin(bingoEvents, eq(games.eventId, bingoEvents.id))
		.where(and(eq(games.eventId, eventId), eq(games.isActive, true)))
		.limit(1);
	return activeGames[0] || null;
}

export async function deleteDrawnNumber(gameId: number, numberId: number) {
	await db
		.delete(drawnNumbers)
		.where(and(eq(drawnNumbers.gameId, gameId), eq(drawnNumbers.id, numberId)));
}

export async function deleteGame(eventId: number, gameId: number) {
	await db.transaction(async (tx) => {
		// Optionally, you may want to delete all drawn numbers associated with this game as well
		await tx.delete(drawnNumbers).where(eq(drawnNumbers.gameId, gameId));
		await tx
			.delete(games)
			.where(and(eq(games.eventId, eventId), eq(games.id, gameId)));
	});
}
