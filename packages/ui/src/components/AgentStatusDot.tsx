import { cn } from "@/lib/utils";

/** Agent lifecycle states. */
export type AgentStatus = "active" | "paused" | "failed" | "idle";

export interface AgentStatusDotProps {
	/** Current agent state. */
	status: AgentStatus;
	/** Visual size of the dot. Defaults to "md". */
	size?: "sm" | "md" | "lg";
	/** Optional accessible label override. */
	"aria-label"?: string;
}

const sizeClasses: Record<NonNullable<AgentStatusDotProps["size"]>, string> = {
	sm: "size-1.5",
	md: "size-2.5",
	lg: "size-3.5",
};

const colorClasses: Record<AgentStatus, string> = {
	active: "bg-green-500",
	paused: "bg-amber-400",
	failed: "bg-red-500",
	idle: "bg-zinc-500",
};

const pingColorClasses: Record<AgentStatus, string> = {
	active: "bg-green-500",
	paused: "bg-amber-400",
	failed: "bg-red-500",
	idle: "bg-zinc-500",
};

const labels: Record<AgentStatus, string> = {
	active: "Active",
	paused: "Paused",
	failed: "Failed",
	idle: "Idle",
};

/**
 * A small colored dot that communicates agent lifecycle state.
 * The "active" state includes a subtle pulse animation.
 */
export function AgentStatusDot({
	status,
	size = "md",
	"aria-label": ariaLabel,
}: AgentStatusDotProps) {
	return (
		<span
			role="status"
			aria-label={ariaLabel ?? labels[status]}
			className="relative inline-flex"
		>
			{status === "active" && (
				<span
					className={cn(
						"absolute inline-flex rounded-full opacity-75 animate-ping",
						sizeClasses[size],
						pingColorClasses[status],
					)}
				/>
			)}
			<span
				className={cn(
					"relative inline-flex rounded-full",
					sizeClasses[size],
					colorClasses[status],
				)}
			/>
		</span>
	);
}
