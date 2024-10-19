"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordProtection() {
	const [password, setPassword] = useState("");

	return (
		<div className="max-w-md mx-auto mt-8">
			<div className="space-y-4">
				<h2 className="text-2xl font-bold text-center">Enter Admin Password</h2>
				<Input
					type="password"
					name="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Enter password"
				/>
				<Button type="submit" className="w-full">
					Submit
				</Button>
			</div>
		</div>
	);
}
