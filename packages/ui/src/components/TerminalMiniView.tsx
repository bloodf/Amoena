import { motion } from "framer-motion";
import { GripHorizontal, X } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export type TerminalMiniViewPosition =
	| "bottom-right"
	| "bottom-left"
	| "top-right"
	| "top-left";

export interface TerminalMiniViewProps {
	/** Title shown in the title bar. */
	title: string;
	/** Called when the user clicks the close button. */
	onClose: () => void;
	/** Initial screen corner anchor. Defaults to "bottom-right". */
	position?: TerminalMiniViewPosition;
	/** Terminal content rendered inside the container. */
	children: React.ReactNode;
}

const anchorClasses: Record<TerminalMiniViewPosition, string> = {
	"bottom-right": "bottom-4 right-4",
	"bottom-left": "bottom-4 left-4",
	"top-right": "top-4 right-4",
	"top-left": "top-4 left-4",
};

/**
 * Floating picture-in-picture terminal container.
 * Draggable via framer-motion; minimum 320×200, default 400×250.
 */
export function TerminalMiniView({
	title,
	onClose,
	position = "bottom-right",
	children,
}: TerminalMiniViewProps) {
	const constraintsRef = useRef<HTMLDivElement>(null);

	return (
		<>
			{/* Full-viewport drag constraint layer */}
			<div
				ref={constraintsRef}
				className="pointer-events-none fixed inset-0 z-40"
			/>

			<motion.div
				drag
				dragConstraints={constraintsRef}
				dragElastic={0.05}
				dragMomentum={false}
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				transition={{ duration: 0.15 }}
				style={{ width: 400, minWidth: 320, minHeight: 200, height: 250 }}
				className={cn(
					"fixed z-50 flex flex-col rounded-lg border border-border bg-surface-0 shadow-2xl overflow-hidden",
					anchorClasses[position],
				)}
			>
				{/* Title bar */}
				<div className="flex h-8 flex-shrink-0 cursor-grab items-center gap-2 border-b border-border bg-surface-1 px-3 active:cursor-grabbing select-none">
					<GripHorizontal size={12} className="text-muted-foreground" />
					<span className="flex-1 truncate font-mono text-[11px] text-foreground">
						{title}
					</span>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close terminal"
						className="flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
					>
						<X size={10} />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-hidden font-mono text-[12px]">
					{children}
				</div>
			</motion.div>
		</>
	);
}
