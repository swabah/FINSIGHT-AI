import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "../services/transactionService";
import { getAuthData } from "../services/authService";
import { FiActivity, FiPieChart, FiBarChart2, FiArrowUpRight } from "react-icons/fi";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import CategoryPieChart from "../components/charts/CategoryPieChart";
import { getMonthlyData, getCategoryData } from "../utils/chartHelpers";

const Analytics = () => {
    const auth = getAuthData();

    const { data: txData, isPending: txLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => fetchTransactions(auth?.token || ""),
        enabled: !!auth?.token,
    });

    if (txLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 opacity-80 animate-fade-up">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse mb-6">
                    <FiActivity size={32} />
                </div>
                <p className="text-sm font-medium tracking-wide text-muted-foreground">Analyzing financial data...</p>
            </div>
        );
    }

    const transactions = txData?.data || [];
    
    // Process Data
    const monthlyData = getMonthlyData(transactions);
    const categoryData = getCategoryData(transactions, "expense");

    // Compute basic summary metrics
    const totalExpenses = categoryData.data.reduce((acc: number, val: number) => acc + val, 0);
    const topCategoryIndex = categoryData.data.length > 0 ? 0 : -1;
    const topCategoryName = topCategoryIndex >= 0 ? categoryData.labels[topCategoryIndex] : "N/A";
    const topCategoryAmount = topCategoryIndex >= 0 ? categoryData.data[topCategoryIndex] : 0;
    const averageMonthlyExpense = totalExpenses / 6;

    return (
        <div className="space-y-10 pb-20 relative">
            <div className="relative z-10 space-y-10">
                {/* ── Header ── */}
                <div className="animate-fade-up">
                    <h1 className="text-4xl font-normal tracking-tight text-foreground">
                        Financial <span className="font-semibold">Analytics</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Deep dive into your spending and income trends.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
                    <div className="p-8 modern-card flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold text-foreground mb-1">Top Expense Category</p>
                                <p className="text-xs text-muted-foreground">Highest area of spending</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                                <FiPieChart size={18} />
                            </div>
                        </div>
                        
                        <div className="flex items-end justify-between">
                            <div>
                                <h4 className="text-3xl font-bold tracking-tighter text-foreground mb-1">{topCategoryName}</h4>
                                <p className="text-sm font-bold text-rose-500">
                                    ₹{topCategoryAmount.toLocaleString()} spent
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-muted-foreground">
                                <FiArrowUpRight size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 modern-card flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold text-foreground mb-1">6-Month Average</p>
                                <p className="text-xs text-muted-foreground">Monthly expense velocity</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <FiBarChart2 size={18} />
                            </div>
                        </div>
                        
                        <div className="flex items-end justify-between">
                            <div>
                                <h4 className="text-3xl font-bold tracking-tighter text-foreground mb-1">₹{Math.round(averageMonthlyExpense).toLocaleString()}</h4>
                                <p className="text-sm font-bold text-blue-500">
                                    Average monthly cost
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-muted-foreground">
                                <FiArrowUpRight size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* ── Monthly Comparison ── */}
                    <div className="lg:col-span-8 modern-card p-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">
                                    <FiBarChart2 size={18} />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">Income vs Expense</h3>
                            </div>
                            <div className="flex bg-secondary p-1 rounded-full">
                                <button className="px-4 py-1.5 text-xs font-semibold rounded-full bg-white shadow-sm">6 Months</button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <MonthlyBarChart 
                                labels={monthlyData.labels}
                                incomeData={monthlyData.incomeData}
                                expenseData={monthlyData.expenseData}
                            />
                        </div>
                    </div>

                    {/* ── Category Breakdown ── */}
                    <div className="lg:col-span-4 modern-card p-8 animate-fade-up" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">
                                    <FiPieChart size={18} />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">Breakdown</h3>
                            </div>
                        </div>
                        <div className="mt-4">
                            <CategoryPieChart 
                                labels={categoryData.labels}
                                data={categoryData.data}
                                colors={categoryData.colors}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
