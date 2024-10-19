"use client";

import { AlertDialogAction } from "./ui/alert-dialog";

export function AlertDialogActionButton({
	action,
	text,
}: {
	action: () => void;
	text: string;
}) {
	return <AlertDialogAction onClick={action}>{text}</AlertDialogAction>;
}
