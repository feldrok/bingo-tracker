import { RealtimeBingo } from "@/components/realtime-bingo";
import ReloadButton from "@/components/ui/reaload-button";
import {
	getActiveEvent,
	getActiveGame,
	getGameDrawnNumbers,
} from "@/utils/bingoUtils";

export default async function Page({ params }: { params: { slug: string } }) {
	const activeEvent = await getActiveEvent({ slug: params.slug });

	if (!activeEvent) {
		return <div>No active event found.</div>;
	}

	const activeGame = await getActiveGame(activeEvent.id);

	if (!activeGame) {
		return (
			<div className="max-w-4xl mx-auto">
				<p className="text-center">
					No se encontraron juegos activos para este evento. Espera a que se
					inicie un juego.
				</p>
				<div className="flex justify-center pt-4">
					<ReloadButton />
				</div>
			</div>
		);
	}

	const drawnNumbers = await getGameDrawnNumbers(activeGame.id);

	if (!Array.isArray(drawnNumbers)) {
		return <div>Error al obtener los números.</div>;
	}

	return (
		<RealtimeBingo
			gameName={activeGame.name}
			serverActiveGame={activeGame}
			drawnNumbers={drawnNumbers}
		/>
	);
}
