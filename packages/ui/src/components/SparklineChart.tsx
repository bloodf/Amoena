export interface SparklineChartProps {
	/** Array of numeric data points to render. */
	data: number[];
	/** SVG width in pixels. Defaults to 80. */
	width?: number;
	/** SVG height in pixels. Defaults to 24. */
	height?: number;
	/** Stroke color. Defaults to currentColor. */
	color?: string;
}

/**
 * Inline mini SVG sparkline for table cells and compact dashboards.
 * Renders a simple polyline — no external chart library required.
 */
export function SparklineChart({
	data,
	width = 80,
	height = 24,
	color = "currentColor",
}: SparklineChartProps) {
	if (data.length === 0) {
		return <svg width={width} height={height} aria-hidden="true" />;
	}

	const min = Math.min(...data);
	const max = Math.max(...data);
	const range = max - min || 1;

	const padding = 2;
	const innerWidth = width - padding * 2;
	const innerHeight = height - padding * 2;

	const points = data
		.map((value, index) => {
			const x = padding + (index / Math.max(data.length - 1, 1)) * innerWidth;
			const y = padding + (1 - (value - min) / range) * innerHeight;
			return `${x.toFixed(2)},${y.toFixed(2)}`;
		})
		.join(" ");

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			aria-hidden="true"
			className="overflow-visible"
		>
			<polyline
				points={points}
				fill="none"
				stroke={color}
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
