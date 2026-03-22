export interface SecurityDimension {
	name: string;
	/** Score from 0 to 100. */
	score: number;
}

export interface SecurityRadarChartProps {
	/** Exactly 6 security dimensions with scores 0–100. */
	dimensions: SecurityDimension[];
}

const SIZE = 220;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RADIUS = 80;
const LEVELS = 4;

function polarToCartesian(
	cx: number,
	cy: number,
	r: number,
	angleRad: number,
): [number, number] {
	return [cx + r * Math.cos(angleRad), cy + r * Math.sin(angleRad)];
}

function axisAngle(index: number, total: number): number {
	// Start at top (-π/2) and go clockwise
	return (Math.PI * 2 * index) / total - Math.PI / 2;
}

/**
 * Pure-SVG radar chart for 6 security dimensions.
 * No external dependencies; uses a dark-theme colour palette.
 */
export function SecurityRadarChart({ dimensions }: SecurityRadarChartProps) {
	const count = dimensions.length;

	// Grid polygon points for each level
	const gridPolygons = Array.from({ length: LEVELS }, (_, level) => {
		const r = (RADIUS * (level + 1)) / LEVELS;
		const pts = Array.from({ length: count }, (__, i) => {
			const [x, y] = polarToCartesian(CX, CY, r, axisAngle(i, count));
			return `${x.toFixed(2)},${y.toFixed(2)}`;
		});
		return pts.join(" ");
	});

	// Data polygon
	const dataPoints = dimensions.map((dim, i) => {
		const r = (Math.min(100, Math.max(0, dim.score)) / 100) * RADIUS;
		const [x, y] = polarToCartesian(CX, CY, r, axisAngle(i, count));
		return `${x.toFixed(2)},${y.toFixed(2)}`;
	});

	// Axis endpoints + label positions
	const axes = dimensions.map((dim, i) => {
		const angle = axisAngle(i, count);
		const [x2, y2] = polarToCartesian(CX, CY, RADIUS, angle);
		const [lx, ly] = polarToCartesian(CX, CY, RADIUS + 18, angle);
		return { dim, x2, y2, lx, ly };
	});

	return (
		<svg
			width={SIZE}
			height={SIZE}
			viewBox={`0 0 ${SIZE} ${SIZE}`}
			aria-label="Security radar chart"
			className="select-none"
		>
			{/* Grid polygons */}
			{gridPolygons.map((pts, level) => (
				<polygon
					key={`grid-${level}`}
					points={pts}
					fill="none"
					stroke="rgba(255,255,255,0.08)"
					strokeWidth={1}
				/>
			))}

			{/* Axis lines */}
			{axes.map(({ x2, y2, dim }, i) => (
				<line
					key={dim?.name ?? `axis-${i}`}
					x1={CX}
					y1={CY}
					x2={x2}
					y2={y2}
					stroke="rgba(255,255,255,0.12)"
					strokeWidth={1}
				/>
			))}

			{/* Data area */}
			<polygon
				points={dataPoints.join(" ")}
				fill="rgba(99,102,241,0.25)"
				stroke="#6366f1"
				strokeWidth={1.5}
				strokeLinejoin="round"
			/>

			{/* Data point dots */}
			{dimensions.map((dim, i) => {
				const r = (Math.min(100, Math.max(0, dim.score)) / 100) * RADIUS;
				const [x, y] = polarToCartesian(CX, CY, r, axisAngle(i, count));
				return (
					<circle
						key={dim?.name ?? `axis-${i}`}
						cx={x}
						cy={y}
						r={3}
						fill="#6366f1"
						stroke="#18181b"
						strokeWidth={1}
					/>
				);
			})}

			{/* Labels */}
			{axes.map(({ dim, lx, ly }, i) => (
				<text
					key={dim?.name ?? `axis-${i}`}
					x={lx}
					y={ly}
					textAnchor="middle"
					dominantBaseline="middle"
					fontSize={10}
					fill="#a1a1aa"
				>
					{dim.name}
				</text>
			))}
		</svg>
	);
}
