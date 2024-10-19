"use client";

import { saveDrawnNumber } from "@/utils/bingoUtils";
import { revalidatePath } from "next/cache";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { handleSubmitNumber } from "@/app/actions";

export function SaveDrawnNumbers({
  gameId,
  slug,
}: {
  gameId: number;
  slug: string;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmitNumberBinded = handleSubmitNumber.bind(null, {
    gameId,
    slug,
  });

  return (
    <div className="mb-8">
      <form
        action={async (formData: FormData) => {
          setError(null);
          const result = await handleSubmitNumberBinded(formData);
          if (result?.message) {
            setError(result.message);
          }
          formData.set("number", "");
        }}
      >
        <div className="flex gap-2">
          <Input
            name="number"
            type="number"
            placeholder="Enter number (1-75)"
            min="1"
            max="75"
            className="text-black"
          />
          <Button type="submit">Agregar</Button>
        </div>
      </form>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
