import { useQuery } from "@tanstack/react-query";
import { fetchTransactions, fetchCategories } from "../services/transactionService";
import { getAuthData } from "../services/authService";
import { FiArrowUpRight, FiArrowDownRight, FiActivity, FiTag, FiCreditCard, FiTrendingUp } from "react-icons/fi";

const Dashboard = () => {
    const auth = getAuthData();

    const { data: txData, isPending: txLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => fetchTransactions(auth?.token || ""),
        enabled: !!auth?.token,
    });

    const { data: catData, isPending: catLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => fetchCategories(auth?.token || ""),
        enabled: !!auth?.token,
    });

    if (txLoading || catLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary animate-pulse mb-4">
                    <FiActivity size={20} />
                </div>
                <p className="text-xs font-medium tracking-wide">Syncing account data...</p>
            </div>
        );
    }

    const transactions = txData?.data || [];
    const categories = catData?.data || [];
    
    const income = transactions.filter((t: any) => t.type === "income").reduce((acc: number, t: any) => acc + t.amount, 0);
    const expense = transactions.filter((t: any) => t.type === "expense").reduce((acc: number, t: any) => acc + t.amount, 0);
    const balance = income - expense;

    return (
        <div className="space-y-8 pb-20">
            {/* ── Metric Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard 
                    label="Current Balance" 
                    value={balance} 
                    icon={<FiActivity size={16} />} 
                    variant="neutral"
                />
                <MetricCard 
                    label="Total Income" 
                    value={income} 
                    icon={<FiArrowUpRight size={16} />} 
                    variant="success"
                />
                <MetricCard 
                    label="Total Expenses" 
                    value={expense} 
                    icon={<FiArrowDownRight size={16} />} 
                    variant="danger"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ── Recent Activity ── */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <FiTrendingUp className="text-primary" />
                            <h3 className="text-base font-medium">Recent Activity</h3>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        {transactions.length === 0 ? (
                            <div className="p-12 text-center bg-card border border-border rounded-lg">
                                <p className="text-xs font-medium text-muted-foreground">No recent transactions documented</p>
                            </div>
                        ) : (
                            transactions.slice(0, 10).map((t: any) => (
                                <ActivityRow key={t._id} t={t} />
                            ))
                        )}
                    </div>
                </div>

                {/* ── Categories ── */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <FiTag className="text-primary" />
                            <h3 className="text-base font-medium">Categories</h3>
                        </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-lg divide-y divide-border">
                        {categories.slice(0, 8).map((c: any) => (
                            <div key={c._id} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-default group">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color_code }} />
                                    <span className="text-xs font-medium">{c.name}</span>
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Active</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon, variant }: any) => {
    const isSuccess = variant === "success";
    const isDanger = variant === "danger";
    
    return (
        <div className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-all group">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 flex items-center justify-center rounded transition-all duration-300 ${
                    isSuccess ? "bg-emerald-500/10 text-emerald-500" : isDanger ? "bg-rose-500/10 text-rose-500" : "bg-card/50 shadow-sm border border-border text-foreground"
                }`}>
                    {icon}
                </div>
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
            </div>
            
            <h4 className={`text-2xl font-medium tracking-tight ${
                isSuccess ? "text-emerald-500" : isDanger ? "text-rose-500" : "text-foreground"
            }`}>
                ₹{value.toLocaleString()}
            </h4>
        </div>
    );
};

const ActivityRow = ({ t }: any) => (
    <div className="flex items-center justify-between p-3 px-4 bg-card border border-border/80 rounded-xl hover:border-primary/30 transition-all group cursor-default shadow-sm hover:shadow-md">
        <div className="flex items-center gap-4 min-w-0">
            <div className={`w-8 h-8 flex items-center justify-center text-xl shrink-0 border rounded-lg transition-all duration-300 shadow-sm ${
                t.type === "income" ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/20" : "text-muted-foreground bg-white border-border"
            }`}>
                <FiCreditCard size={14} />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-none mb-1.5 truncate">{t.description || "Uncategorized Transaction"}</p>
                <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-[10px] font-medium text-primary px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10 shrink-0">
                        {typeof t.category === "object" ? t.category.name : t.category}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
        <div className="ml-4 shrink-0">
            <span className={`text-sm font-medium tracking-tight ${t.type === "income" ? "text-emerald-500" : "text-foreground"}`}>
                {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
            </span>
        </div>
    </div>
);

export default Dashboard;
