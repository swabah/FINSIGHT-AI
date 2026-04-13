import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	BarElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface MonthlyTrend {
	month: string;
	income: number;
	expenses: number;
}

interface CashFlowBarChartProps {
	data: MonthlyTrend[];
}

const CashFlowBarChart: React.FC<CashFlowBarChartProps> = ({ data }) => {
	if (!data || data.length === 0) {
		return (
			<div className="flex items-center justify-center h-64 text-slate-500">
				No trend data available
			</div>
		);
	}

	const formatMonth = (monthStr: string) => {
		const [year, month] = monthStr.split("-");
		const date = new Date(parseInt(year), parseInt(month) - 1);
		return date.toLocaleDateString("en-US", {
			month: "short",
			year: "numeric",
		});
	};

	const chartData = {
		labels: data.map((item) => formatMonth(item.month)),
		datasets: [
			{
				label: "Income",
				data: data.map((item) => item.income),
				backgroundColor: "rgba(16, 185, 129, 0.8)",
				borderColor: "#10b981",
				borderWidth: 2,
				borderRadius: 6,
				hoverBackgroundColor: "#34d399",
			},
			{
				label: "Expenses",
				data: data.map((item) => item.expenses),
				backgroundColor: "rgba(239, 68, 68, 0.8)",
				borderColor: "#ef4444",
				borderWidth: 2,
				borderRadius: 6,
				hoverBackgroundColor: "#f87171",
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				stacked: false,
				grid: {
					display: false,
				},
				ticks: {
					color: "#94a3b8",
					font: {
						size: 11,
						weight: 500 as const,
					},
				},
			},
			y: {
				beginAtZero: true,
				grid: {
					color: "rgba(148, 163, 184, 0.1)",
				},
				ticks: {
					color: "#94a3b8",
					font: {
						size: 11,
						weight: 500 as const,
					},
					callback: function (value: any) {
						return "₹" + value.toLocaleString();
					},
				},
			},
		},
		plugins: {
			legend: {
				position: "top" as const,
				labels: {
					padding: 20,
					usePointStyle: true,
					pointStyle: "rectRounded",
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
						const label = context.dataset.label || "";
						const value = context.parsed.y || 0;
						return ` ${label}: ₹${value.toLocaleString()}`;
					},
				},
			},
		},
	};

	return <Bar data={chartData} options={options} />;
};

export default CashFlowBarChart;
