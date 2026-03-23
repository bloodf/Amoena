"use client";

interface DeltaBarProps {
	change: number | null;
	direction: "better" | "worse" | "neutral";
	label: string;
}

export function DeltaBar({ change, direction, label }: DeltaBarProps) {
	const abs = Math.abs(change ?? 0);
	const pct = Math.min(abs, 100);

	const color =
		direction === "better"
			? "bg-green-500"
			: direction === "worse"
				? "bg-red-500"
				: "bg-gray-500";

	const sign = direction === "better" ? "+" : direction === "worse" ? "-" : "";
	const ariaLabel = change != null
		? `${label}: ${sign}${abs.toFixed(1)}% ${direction}`
		: `${label}: no change`;

	return (
		<div
			className="flex items-center gap-3"
			aria-label={ariaLabel}
			role="meter"
			aria-valuenow={change ?? 0}
			aria-valuemin={-100}
			aria-valuemax={100}
		>
			<div className="relative h-2 w-32 overflow-hidden rounded-full bg-gray-700">
				{direction !== "neutral" && (
					<div
						className={`absolute top-0 h-full rounded-full transition-all ${color} ${
							direction === "better" ? "left-1/2" : "right-1/2"
						}`}
						style={{ width: `${pct / 2}%` }}
					/>
				)}
				{direction === "neutral" && (
					<div className="absolute left-1/2 top-0 h-full w-px bg-gray-500" />
				)}
			</div>
			<span
				className={`text-xs ${
					direction === "better"
						? "text-green-400"
						: direction === "worse"
							? "text-red-400"
							: "text-gray-400"
				}`}
			>
				{change != null ? `${sign}${abs.toFixed(1)}%` : "—"}
			</span>
		</div>
	);
}
