import { getActiveEvent } from "@/utils/bingoUtils";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const activeEvent = await getActiveEvent({ slug: params.slug });

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
          Bingo {activeEvent.name}
        </h1>

        {children}
      </div>
    </>
  );
}
