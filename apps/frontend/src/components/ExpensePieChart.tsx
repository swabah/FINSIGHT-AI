import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryBreakdown {
	category: string;
	amount: number;
	color: string;
}

interface ExpensePieChartProps {
	data: CategoryBreakdown[];
}

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ data }) => {
	if (!data || data.length === 0) {
		return (
			<div className="flex items-center justify-center h-64 text-slate-500">
				No expense data available for this month
			</div>
		);
	}

	const chartData = {
		labels: data.map((item) => item.category),
		datasets: [
			{
				data: data.map((item) => item.amount),
				backgroundColor: data.map((item) => item.color),
				borderColor: "#ffffff",
				borderWidth: 3,
				hoverOffset: 10,
				hoverBorderWidth: 4,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "bottom" as const,
				labels: {
					padding: 20,
					usePointStyle: true,
					pointStyle: "circle",
					color: "#64748b",
					font: {
						size: 12,
						weight: 500 as const,
					},
				},
			},
			tooltip: {
				backgroundColor: "#ffffff",
				titleColor: "#0f172a",
				bodyColor: "#64748b",
				borderColor: "rgba(0,0,0,0.05)",
				borderWidth: 1,
				padding: 12,
				displayColors: true,
				callbacks: {
					label: function (context: any) {
						const label = context.label || "";
						const value = context.parsed || 0;
						return ` ${label}: ₹${value.toFixed(2)}`;
					},
				},
			},
		},
	};

	return (
		<div className="relative w-full h-[240px]">
			<Pie data={chartData} options={options} />
		</div>
	);
};

export default ExpensePieChart;
