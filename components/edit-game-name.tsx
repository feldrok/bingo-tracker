"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateGameName } from "@/app/actions";

interface EditGameNameProps {
	gameId: number;
	currentName: string;
	slug: string;
}

export function EditGameName({ gameId, currentName, slug }: EditGameNameProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [newName, setNewName] = useState(currentName);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await updateGameName(gameId, newName, slug);
		setIsEditing(false);
	};

	if (!isEditing) {
		return (
			<Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
				Edit Name
			</Button>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex items-center space-x-2">
			<Input
				value={newName}
				onChange={(e) => setNewName(e.target.value)}
				className="w-full"
			/>
			<Button type="submit" size="sm">
				Save
			</Button>
			<Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
				Cancel
			</Button>
		</form>
	);
}
