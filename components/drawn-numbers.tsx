"use client";

import { useEffect, useState, useMemo } from "react";
import type { getGameDrawnNumbers } from "@/utils/bingoUtils";
import { supabase } from "@/utils/supabase/client";

export type DrawnNumber = Awaited<
  ReturnType<typeof getGameDrawnNumbers>
>[number];

export function DrawnNumbers({
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
      .channel("realtime numbers")
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
              prevNumbers.filter((num) => num.id !== payload.old.id)
            );
          } else if (payload.eventType === "INSERT") {
            setNumbers((prevNumbers) => [
              payload.new as DrawnNumber,
              ...prevNumbers,
            ]);
          }
        }
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
    <div className="bg-white bg-opacity-20 rounded-lg p-4 w-full">
      <h2 className="text-2xl md:text-3xl font-bold mb-1">Números sorteados</h2>
      <p className="text-muted-foreground mb-4">{drawnNumbers.length} de 75</p>
      {numbers.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {numbers.map((item) => (
            <div
              key={item.id}
              className="bg-primary text-primary-foreground rounded-lg p-2 text-center font-bold whitespace-nowrap w-fit"
            >
              {item.letter}-{item.number}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">No hay números sorteados aún.</div>
      )}
    </div>
  );
}
