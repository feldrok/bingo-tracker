import { getActiveEvent } from "@/utils/bingoUtils";
import Image from "next/image";

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
        <div className="flex flex-col md:flex-row items-center justify-center gap-1 pb-4">
          {activeEvent.logoUrl && (
            <Image
              src={activeEvent.logoUrl}
              alt={activeEvent.name}
              width={100}
              height={100}
            />
          )}
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
            Bingo {activeEvent.name}
          </h1>
        </div>

        {children}
      </div>
    </>
  );
}
