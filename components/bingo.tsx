"use client";

import { useEffect, useState, useMemo } from "react";
import type { getGameDrawnNumbers } from "@/utils/bingoUtils";
import { supabase } from "@/utils/supabase/client";

export type DrawnNumber = Awaited<
	ReturnType<typeof getGameDrawnNumbers>
>[number];

export function RealtimeNumbers({
	drawnNumbers,
	gameName,
}: {
	drawnNumbers: DrawnNumber[];
	gameName: string;
}) {
	const [numbers, setNumbers] = useState<DrawnNumber[]>(drawnNumbers);

	const drawnNumbersSet = useMemo(() => {
		return new Set(numbers.map((item) => item.number));
	}, [numbers]);

	useEffect(() => {
		const channel = supabase
			.channel("realtime bingo numbers")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "drawn_numbers",
				},
				(payload) => {
					if (payload.eventType === "DELETE") {
						setNumbers((prevNumbers) =>
							prevNumbers.filter((num) => num.id !== payload.old.id),
						);
					} else if (payload.eventType === "INSERT") {
						setNumbers((prevNumbers) => [
							payload.new as DrawnNumber,
							...prevNumbers,
						]);
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	useEffect(() => {
		setNumbers(drawnNumbers);
	}, [drawnNumbers]);

	return (
		<div className="grid grid-cols-5 gap-2 w-full">
			{["B", "I", "N", "G", "O"].map((letter, columnIndex) => (
				<div key={letter} className="grid gap-2">
					<div className="text-primary rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold mb-2">
						{letter}
					</div>
					{Array.from({ length: 15 }, (_, i) => {
						const number = columnIndex * 15 + i + 1;
						const isDrawn = drawnNumbersSet.has(number);
						return (
							<div
								key={number}
								className={`rounded-lg px-2 py-0.5 text-xl text-center font-bold ${
									isDrawn
										? "opacity-100 bg-primary text-primary-foreground rounded-md"
										: "opacity-30 text-purple-600"
								}`}
							>
								{number}
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
}
