import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsStats } from "../services/analyticsService";
import { getAuthData } from "../services/authService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	FiArrowUpRight,
	FiArrowDownLeft,
	FiPieChart,
	FiActivity,
	FiRefreshCw,
	FiAlertTriangle,
    FiTrendingUp,
    FiPocket
} from "react-icons/fi";
import ExpensePieChart from "../components/ExpensePieChart";
import CashFlowBarChart from "../components/CashFlowBarChart";

const Dashboard: React.FC = () => {
	const auth = getAuthData();
	const { data: responseData, isPending, error, refetch } = useQuery({
		queryKey: ["analyticsStats"],
		queryFn: () => fetchAnalyticsStats(auth?.token || ""),
		enabled: !!auth?.token,
	});

	const data = responseData?.data;

	if (isPending) {
		return (
			<div className="flex items-center justify-center h-64">
				<LoadingSpinner text="Analyzing..." />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-4 text-center animate-in fade-in duration-500">
				<div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500">
					<FiAlertTriangle size={20} />
				</div>
				<div>
                    <p className="text-base font-bold text-slate-900">Analysis Interrupted</p>
                    <p className="text-slate-500 text-xs font-medium">Failed to retrieve data.</p>
                </div>
				<Button onClick={() => refetch()} className="h-9 px-4 rounded-md font-bold text-xs" variant="outline">
					<FiRefreshCw className="mr-2" /> Retry
				</Button>
			</div>
		);
	}

	if (!data) return null;

	const { income, expenses, balance } = data.currentMonth;
	const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

	return (
		<div className="max-w-6xl mx-auto space-y-4 pb-8">
			{/* KPI Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Savings Hero Card */}
				<Card className="md:col-span-2 lg:col-span-2 rounded-xl bg-slate-900 text-white p-6 relative overflow-hidden border-none group">
					<div className="relative z-10 flex flex-col h-full justify-between">
						<div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-primary">
                                    <FiTrendingUp size={12} />
                                </div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Monthly Efficiency</p>
                            </div>
							<h2 className="text-4xl font-heading font-extrabold tracking-tight mb-2">
								{savingsRate.toFixed(0)}<span className="text-primary text-2xl">%</span>
							</h2>
						</div>
						<div className="space-y-4">
							<div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
								<div 
									className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
									style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
								/>
							</div>
							<p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
								You've retained <span className="text-white font-bold">₹{balance.toLocaleString()}</span>. 
								{savingsRate > 20 ? " Excellent velocity." : " Room for growth."}
							</p>
						</div>
					</div>
				</Card>

				{/* Individual KPI Mini Cards */}
				<div className="grid grid-cols-1 gap-4 md:col-span-1 lg:col-span-2">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
						<KPICard
							label="Income"
							value={`₹${income.toLocaleString()}`}
							color="indigo"
                            icon={<FiArrowUpRight size={14} />}
						/>
						<KPICard
							label="Spent"
							value={`₹${expenses.toLocaleString()}`}
							color="rose"
                            icon={<FiArrowDownLeft size={14} />}
						/>
                        <div className="sm:col-span-2 bg-white rounded-xl p-5 flex items-center justify-between border border-slate-100">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <FiPocket className="text-slate-400" size={12} />
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Balance</p>
                                </div>
                                <p className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">₹{balance.toLocaleString()}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${balance >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                {balance >= 0 ? <FiArrowUpRight size={18} /> : <FiArrowDownLeft size={18} />}
                            </div>
                        </div>
					</div>
				</div>
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<Card className="rounded-xl border border-slate-100 bg-white overflow-hidden">
					<CardHeader className="p-5 pb-0">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-sm font-extrabold text-slate-900">Capital Flow</CardTitle>
								<CardDescription className="text-[10px] font-medium">6-month trends</CardDescription>
							</div>
							<FiActivity className="text-slate-300" size={14} />
						</div>
					</CardHeader>
					<CardContent className="h-64 p-5 pt-2">
						<CashFlowBarChart data={data.monthlyTrend} />
					</CardContent>
				</Card>

				<Card className="rounded-xl border border-slate-100 bg-white overflow-hidden">
					<CardHeader className="p-5 pb-0">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-sm font-extrabold text-slate-900">Spending Portfolio</CardTitle>
								<CardDescription className="text-[10px] font-medium">Categorical view</CardDescription>
							</div>
							<FiPieChart className="text-slate-300" size={14} />
						</div>
					</CardHeader>
					<CardContent className="h-64 p-5 pt-2 flex items-center justify-center">
						<ExpensePieChart data={data.categoryBreakdown} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

const KPICard = ({
	label,
	value,
    color,
    icon
}: {
	label: string;
	value: string;
    color: "indigo" | "rose" | "emerald";
    icon: React.ReactNode;
}) => {
    const isIndigo = color === 'indigo';
    const bgColor = isIndigo ? 'bg-indigo-50/50' : color === 'rose' ? 'bg-rose-50/50' : 'bg-emerald-50/50';
    const accentBg = isIndigo ? 'bg-indigo-100' : color === 'rose' ? 'bg-rose-100' : 'bg-emerald-100';
    const textColor = isIndigo ? 'text-indigo-600' : color === 'rose' ? 'text-rose-600' : 'text-emerald-600';

    return (
        <div className={`bg-white rounded-xl p-5 border border-slate-100 transition-colors hover:bg-slate-50 group ${bgColor}`}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
            <div className="flex items-center justify-between">
                <p className="text-lg font-heading font-extrabold text-slate-900 tracking-tight">{value}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentBg} ${textColor}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};


export default Dashboard;

