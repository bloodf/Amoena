"use client";

import { useEffect } from "react";

export function useGlobalKeyboard(onToggle: () => void): void {
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			const isMac = navigator.platform.toUpperCase().includes("MAC");
			const modifierHeld = isMac ? e.metaKey : e.ctrlKey;
			if (modifierHeld && e.key === "k") {
				e.preventDefault();
				onToggle();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onToggle]);
}
