import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "../services/transactionService";
import { getAuthData } from "../services/authService";
import { FiActivity, FiPieChart, FiBarChart2 } from "react-icons/fi";
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
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary animate-pulse mb-4">
                    <FiActivity size={20} />
                </div>
                <p className="text-xs font-medium tracking-wide">Analyzing financial data...</p>
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
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight mb-1">Financial Analytics</h1>
                <p className="text-sm text-muted-foreground">Gain deeper insights into your spending patterns and trends over time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded bg-rose-500/10 text-rose-500 flex items-center justify-center">
                            <FiPieChart size={16} />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">Top Expense Category</h3>
                    </div>
                    <div className="mt-4">
                        <h4 className="text-2xl font-medium tracking-tight text-foreground">{topCategoryName}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            ₹{topCategoryAmount.toLocaleString()} spent total
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <FiBarChart2 size={16} />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">6-Month Average</h3>
                    </div>
                    <div className="mt-4">
                        <h4 className="text-2xl font-medium tracking-tight text-foreground">₹{Math.round(averageMonthlyExpense).toLocaleString()}</h4>
                        <p className="text-sm text-muted-foreground mt-1">Average monthly expenses</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ── Monthly Comparison ── */}
                <div className="lg:col-span-8 p-6 bg-card border border-border rounded-lg shadow-sm">
                    <h3 className="text-base font-medium mb-6">Income vs Expense (6 Months)</h3>
                    <MonthlyBarChart 
                        labels={monthlyData.labels}
                        incomeData={monthlyData.incomeData}
                        expenseData={monthlyData.expenseData}
                    />
                </div>

                {/* ── Category Breakdown ── */}
                <div className="lg:col-span-4 p-6 bg-card border border-border rounded-lg shadow-sm">
                    <h3 className="text-base font-medium mb-6">Expense Breakdown</h3>
                    <CategoryPieChart 
                        labels={categoryData.labels}
                        data={categoryData.data}
                        colors={categoryData.colors}
                    />
                </div>
            </div>
        </div>
    );
};

export default Analytics;
