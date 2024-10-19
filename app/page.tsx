import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getActiveEvents } from "@/utils/bingoUtils";

export default async function LandingPage() {
  const activeEvents = await getActiveEvents();

  return (
    <div className="min-h-screen bg-gradient-to-b bg-background text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
          Eventos de Bingo
        </h1>

        <p className="text-xl md:text-2xl text-center mb-12">
          ¡Entra al evento de bingo y juega!
        </p>

        {activeEvents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeEvents.map((event) => (
              <div
                key={event.id}
                className="bg-muted bg-opacity-20 rounded-lg p-6"
              >
                <h2 className="text-2xl font-bold mb-4">{event.name}</h2>
                <p className="mb-4">{event.description}</p>
                <Link href={`/${event.slug}`} passHref>
                  <Button className="w-full">Entrar al evento</Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xl mb-4">No se encontraron eventos activos.</p>
            <p>¡Vuelve más tarde para más eventos de bingo!</p>
          </div>
        )}
      </div>
    </div>
  );
}
