import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export interface CostStreamGraphProps {
	/**
	 * Each entry is a date-keyed row. Additional keys are model names with
	 * their cost values for that date.
	 */
	data: Array<{ date: string; [model: string]: number | string }>;
	/** List of model names that appear in the data. */
	models: string[];
}

/** Dark-theme palette for stacked areas — cycles for additional models. */
const MODEL_COLORS = [
	"#6366f1", // indigo
	"#22d3ee", // cyan
	"#a78bfa", // violet
	"#34d399", // emerald
	"#fb923c", // orange
	"#f472b6", // pink
];

/**
 * Stacked area chart visualising cost per model over time.
 * Wraps Recharts AreaChart with a dark-theme colour palette.
 */
export function CostStreamGraph({ data, models }: CostStreamGraphProps) {
	return (
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
				<defs>
					{models.map((model, index) => (
						<linearGradient
							key={model}
							id={`grad-${index}`}
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="5%"
								stopColor={MODEL_COLORS[index % MODEL_COLORS.length]}
								stopOpacity={0.4}
							/>
							<stop
								offset="95%"
								stopColor={MODEL_COLORS[index % MODEL_COLORS.length]}
								stopOpacity={0.05}
							/>
						</linearGradient>
					))}
				</defs>

				<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

				<XAxis
					dataKey="date"
					tick={{ fill: "#71717a", fontSize: 11 }}
					tickLine={false}
					axisLine={false}
				/>

				<YAxis
					tick={{ fill: "#71717a", fontSize: 11 }}
					tickLine={false}
					axisLine={false}
					tickFormatter={(v: number) => `$${v.toFixed(2)}`}
				/>

				<Tooltip
					contentStyle={{
						background: "#18181b",
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: 6,
						fontSize: 12,
						color: "#e4e4e7",
					}}
					formatter={(value: number) => [`$${value.toFixed(4)}`, undefined]}
				/>

				<Legend
					wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }}
					iconType="circle"
				/>

				{models.map((model, index) => (
					<Area
						key={model}
						type="monotone"
						dataKey={model}
						stackId="cost"
						stroke={MODEL_COLORS[index % MODEL_COLORS.length]}
						fill={`url(#grad-${index})`}
						strokeWidth={1.5}
					/>
				))}
			</AreaChart>
		</ResponsiveContainer>
	);
}
