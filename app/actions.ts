"use server";

import { saveDrawnNumber } from "@/utils/bingoUtils";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { games } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function handleSubmitNumber(
	{ gameId, slug }: { gameId: number; slug: string },
	formData: FormData,
) {
	const number = Number(formData.get("number"));

	if (number >= 1 && number <= 75) {
		const result = await saveDrawnNumber(number, gameId);

		revalidatePath(`/${slug}/track`);

		return result;
	}
}

export async function revalidateGame(slug: string) {
	revalidatePath(`/${slug}`);
}

export async function updateGameName(
	gameId: number,
	newName: string,
	slug: string,
) {
	await db.update(games).set({ name: newName }).where(eq(games.id, gameId));
	revalidatePath(`/${slug}/track`);
}
