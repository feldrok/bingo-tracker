import { SaveDrawnNumbers } from "@/components/save-drawn-numbers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { bingoEvents, drawnNumbers, games } from "@/db/schema";
import {
	getActiveEvent,
	getEventGames,
	getGameDrawnNumbers,
	createNewGame,
	switchActiveGame,
	deactivateActiveGame,
	getActiveGame,
	deleteGame,
	deleteDrawnNumber,
} from "@/utils/bingoUtils";
import { revalidatePath } from "next/cache";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { EditGameName } from "@/components/edit-game-name";
import { PasswordProtection } from "@/components/password-protection";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { setAuthCookie, isAuthenticated, verifyPassword } from "@/utils/auth";

async function handleCreateNewGame(formData: FormData) {
	"use server";
	const slug = formData.get("slug") as string;
	if (!(await isAuthenticated(slug))) {
		redirect(`/${slug}/track`);
	}
	const name = formData.get("name") as string;
	await createNewGame(Number.parseInt(formData.get("eventId") as string), name);
	revalidatePath(`/${slug}/track`);
}

async function handleSwitchGame(formData: FormData) {
	"use server";
	const slug = formData.get("slug") as string;
	if (!(await isAuthenticated(slug))) {
		redirect(`/${slug}/track`);
	}
	const gameId = Number.parseInt(formData.get("gameId") as string);
	await switchActiveGame(
		Number.parseInt(formData.get("eventId") as string),
		gameId,
	);
	revalidatePath(`/${slug}/track`);
}

async function handleDeactivateGame(formData: FormData) {
	"use server";
	const slug = formData.get("slug") as string;
	if (!(await isAuthenticated(slug))) {
		redirect(`/${slug}/track`);
	}
	await deactivateActiveGame(
		Number.parseInt(formData.get("eventId") as string),
	);
	revalidatePath(`/${slug}/track`);
}

async function handleDeleteGame(formData: FormData) {
	"use server";
	const slug = formData.get("slug") as string;
	if (!(await isAuthenticated(slug))) {
		redirect(`/${slug}/track`);
	}
	const gameId = Number.parseInt(formData.get("gameId") as string);
	const eventId = Number.parseInt(formData.get("eventId") as string);
	await deleteGame(eventId, gameId);
	revalidatePath(`/${slug}/track`);
}

async function handleDeleteDrawnNumber(formData: FormData) {
	"use server";
	const slug = formData.get("slug") as string;
	if (!(await isAuthenticated(slug))) {
		redirect(`/${slug}/track`);
	}
	const gameId = Number.parseInt(formData.get("gameId") as string);
	const numberId = Number.parseInt(formData.get("numberId") as string);
	try {
		await deleteDrawnNumber(gameId, numberId);
		revalidatePath(`/${slug}/track`);
	} catch (error) {
		console.error("Error deleting drawn number:", error);
		throw new Error("Failed to delete drawn number");
	}
}

async function handlePasswordSubmit(formData: FormData) {
	"use server";
	const password = formData.get("password") as string;
	const slug = formData.get("slug") as string;

	const event = await getActiveEvent({ slug });
	if (!event) {
		return;
	}

	const isValid = await verifyPassword(password, slug);
	if (isValid) {
		await setAuthCookie(event.id);
		redirect(`/${slug}/track`);
	}
	// If password is invalid, we'll just re-render the page with the form
}

export default async function Page({ params }: { params: { slug: string } }) {
	const authenticated = await isAuthenticated(params.slug);

	if (!authenticated) {
		return (
			<form action={handlePasswordSubmit}>
				<input type="hidden" name="slug" value={params.slug} />
				<PasswordProtection />
			</form>
		);
	}

	const activeEvent = await getActiveEvent({ slug: params.slug });

	if (!activeEvent) {
		return <div>No active event found.</div>;
	}

	const eventGames = await getEventGames(activeEvent.id);
	const activeGame = await getActiveGame(activeEvent.id);

	const drawnNumbers = activeGame
		? await getGameDrawnNumbers(activeGame.id)
		: [];

	if (!Array.isArray(drawnNumbers)) {
		return <div className="text-center">Error al obtener los números.</div>;
	}

	return (
		<div className="max-w-4xl mx-auto">
			{activeGame ? (
				<ActiveGameSection
					activeGame={activeGame}
					drawnNumbers={drawnNumbers}
				/>
			) : (
				<div className="text-center text-2xl font-bold mb-8">
					No hay un juego activo. Por favor, crea o activa un juego para empezar
					a jugar.
				</div>
			)}

			<GameManagementSection
				activeEvent={activeEvent}
				eventGames={eventGames}
				activeGame={activeGame}
			/>
		</div>
	);
}

type Event = typeof bingoEvents.$inferSelect;
type DrawnNumber = typeof drawnNumbers.$inferSelect;

type Game = typeof games.$inferSelect & {
	event: Event;
};

function ActiveGameSection({
	activeGame,
	drawnNumbers,
}: {
	activeGame: Game;
	drawnNumbers: DrawnNumber[];
}) {
	const drawnNumbersSet = new Set(drawnNumbers.map((dn) => dn.number));

	return (
		<>
			<SaveDrawnNumbers gameId={activeGame.id} slug={activeGame.event.slug} />

			{drawnNumbers.length > 0 && drawnNumbers[0] && (
				<div className="text-center mb-8">
					<div className="text-6xl md:text-9xl font-bold mb-4">
						{drawnNumbers[0].letter}-{drawnNumbers[0].number}
					</div>
					<div className="text-2xl md:text-4xl">Último número</div>
				</div>
			)}

			<div className="bg-white bg-opacity-20 rounded-lg p-4">
				<h2 className="text-2xl md:text-3xl font-bold mb-4">
					Números sorteados
				</h2>
				<div className="grid grid-cols-5 md:grid-cols-10 gap-2">
					{drawnNumbers.map(
						(item) =>
							item && (
								<div
									key={item.id}
									className="bg-primary text-primary-foreground rounded-lg p-2 text-center font-bold relative"
								>
									{item.letter}-{item.number}
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button variant="destructive">X</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Eliminar número</AlertDialogTitle>
												<AlertDialogDescription>
													¿Estás seguro de que quieres eliminar el número{" "}
													{item.letter}-{item.number}?
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancelar</AlertDialogCancel>
												<form action={handleDeleteDrawnNumber}>
													<input
														type="hidden"
														name="gameId"
														value={activeGame.id}
													/>
													<input
														type="hidden"
														name="numberId"
														value={item.id}
													/>
													<input
														type="hidden"
														name="slug"
														value={activeGame.event.slug}
													/>
													<Button type="submit" variant="destructive">
														Eliminar
													</Button>
												</form>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							),
					)}
				</div>
			</div>

			<div className="grid grid-cols-5 gap-2 my-8">
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
									className={`rounded-lg p-2 text-center font-bold ${
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
		</>
	);
}

type EventGame = typeof games.$inferSelect;

function GameManagementSection({
	activeEvent,
	eventGames,
	activeGame,
}: {
	activeEvent: Event;
	eventGames: EventGame[];
	activeGame: Game | null;
}) {
	return (
		<div className="mb-8">
			<h2 className="text-2xl font-bold mb-4">Game Management</h2>
			<div className="flex gap-2 mb-4">
				<form action={handleCreateNewGame}>
					<input type="hidden" name="eventId" value={activeEvent.id} />
					<input type="hidden" name="slug" value={activeEvent.slug} />
					<Input name="name" placeholder="Nombre del juego" />
					<Button type="submit">Crear nuevo juego</Button>
				</form>
				<form action={handleDeactivateGame}>
					<input type="hidden" name="eventId" value={activeEvent.id} />
					<input type="hidden" name="slug" value={activeEvent.slug} />
					<Button type="submit" variant="destructive">
						Desactivar juego activo
					</Button>
				</form>
			</div>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{eventGames.length > 0 &&
					eventGames.map((game) => (
						<div
							key={game.id}
							className="flex flex-col gap-2 p-4 border rounded-lg"
						>
							<div className="font-bold">{game.name}</div>
							<EditGameName
								gameId={game.id}
								currentName={game.name}
								slug={activeEvent.slug}
							/>
							<form action={handleSwitchGame}>
								<input type="hidden" name="eventId" value={activeEvent.id} />
								<input type="hidden" name="gameId" value={game.id} />
								<input type="hidden" name="slug" value={activeEvent.slug} />
								<Button
									type="submit"
									variant={game.isActive ? "default" : "secondary"}
									className="w-full"
								>
									{game.isActive ? "Active" : "Activate"}
								</Button>
							</form>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="destructive">Delete</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Delete game</AlertDialogTitle>
										<AlertDialogDescription>
											Are you sure you want to delete the game {game.name}?
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<form action={handleDeleteGame}>
											<input
												type="hidden"
												name="eventId"
												value={activeEvent.id}
											/>
											<input type="hidden" name="gameId" value={game.id} />
											<input
												type="hidden"
												name="slug"
												value={activeEvent.slug}
											/>
											<Button type="submit" variant="destructive">
												Delete
											</Button>
										</form>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					))}
			</div>
		</div>
	);
}
