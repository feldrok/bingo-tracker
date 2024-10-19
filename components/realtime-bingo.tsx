"use client";

import type { getActiveGame } from "@/utils/bingoUtils";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { LastNumber } from "./last-number";
import { type DrawnNumber, RealtimeNumbers } from "./ui/realtime-numbers";

type ActiveGame = Awaited<ReturnType<typeof getActiveGame>>;

export function RealtimeBingo({
	serverActiveGame,
	drawnNumbers: initialDrawnNumbers,
	gameName,
}: {
	serverActiveGame: ActiveGame;
	drawnNumbers: DrawnNumber[];
	gameName: string;
}) {
	const [activeGame, setActiveGame] = useState<ActiveGame>(serverActiveGame);
	const [drawnNumbers, setDrawnNumbers] =
		useState<DrawnNumber[]>(initialDrawnNumbers);

	useEffect(() => {
		const channel = supabase
			.channel("realtime game")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "games",
				},
				async (payload) => {
					const event = payload.new as {
						created_at: Date;
						event_id: number;
						id: number;
						is_active: boolean;
						name: string;
					};

					const newActiveGame = {
						createdAt: event.created_at,
						eventId: event.event_id,
						id: event.id,
						isActive: event.is_active,
						name: event.name,
					};

					if (newActiveGame.isActive) {
						setActiveGame(newActiveGame as ActiveGame);
						// Fetch new drawn numbers for the new active game
						const { data: newDrawnNumbers } = await supabase
							.from("drawn_numbers")
							.select("*")
							.eq("game_id", newActiveGame.id);

						console.log("newDrawnNumbers", newDrawnNumbers);
						setDrawnNumbers(newDrawnNumbers as DrawnNumber[]);
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	if (!activeGame) return null;

	const lastNumber = drawnNumbers[0];

	return (
		<div className="max-w-4xl mx-auto">
			<LastNumber lastNumber={lastNumber} />
			<RealtimeNumbers drawnNumbers={drawnNumbers} gameName={activeGame.name} />
		</div>
	);
}
