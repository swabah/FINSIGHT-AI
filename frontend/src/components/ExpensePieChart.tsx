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
				borderColor: "rgba(15, 23, 42, 0.8)",
				borderWidth: 3,
				hoverOffset: 15,
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
					color: "#94a3b8",
					font: {
						size: 12,
						weight: 500 as const,
					},
				},
			},
			tooltip: {
				backgroundColor: "rgba(30, 41, 59, 0.95)",
				titleColor: "#f8fafc",
				bodyColor: "#94a3b8",
				borderColor: "rgba(148, 163, 184, 0.2)",
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

	return <Pie data={chartData} options={options} />;
};

export default ExpensePieChart;
