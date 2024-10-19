import { cookies } from "next/headers";
import { getActiveEvent } from "./bingoUtils";

export async function setAuthCookie(eventId: number) {
	cookies().set(`auth_${eventId}`, "true", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60 * 60 * 24, // 24 hours
	});
}

export async function isAuthenticated(slug: string) {
	const event = await getActiveEvent({ slug });
	if (!event) return false;
	return cookies().get(`auth_${event.id}`)?.value === "true";
}

export async function verifyPassword(password: string, slug: string) {
	const event = await getActiveEvent({ slug });
	return event?.adminPassword === password;
}
