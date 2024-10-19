"use client";

import type { getGameDrawnNumbers } from "@/utils/bingoUtils";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

type LastNumber = Awaited<ReturnType<typeof getGameDrawnNumbers>>[number];

export function LastNumber({
	lastNumber,
}: { lastNumber: LastNumber | undefined }) {
	const [number, setNumber] = useState<LastNumber | undefined>(lastNumber);

	useEffect(() => {
		const channel = supabase
			.channel("realtime number")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "drawn_numbers",
				},
				(payload) => {
					if (payload.eventType === "INSERT") {
						setNumber(payload.new as LastNumber);
					} else if (payload.eventType === "DELETE") {
						// If the deleted number is the current one, set to undefined
						if (number && payload.old.id === number.id) {
							setNumber(undefined);
						}
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [number]);

	useEffect(() => {
		setNumber(lastNumber);
	}, [lastNumber]);

	if (!number) {
		return (
			<div className="text-center mb-8 w-full">
				<div className="text-2xl md:text-4xl">Esperando números</div>
				<div className="text-6xl md:text-9xl font-bold mb-4 text-primary">
					-
				</div>
			</div>
		);
	}

	return (
		<div className="text-center mb-8 w-full">
			<p className="text-2xl md:text-4xl">Último número</p>
			<p className="text-6xl md:text-[14rem] font-bold mb-4 text-primary">
				{number.letter}-{number.number}
			</p>
		</div>
	);
}
