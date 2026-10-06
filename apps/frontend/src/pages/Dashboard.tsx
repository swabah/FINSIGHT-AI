import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchTransactions,
	fetchCategories,
	createTransaction,
} from "../services/transactionService";
import { getAuthData } from "../services/authService";
import {
	FiArrowUpRight,
	FiArrowDownRight,
	FiActivity,
	FiCreditCard,
	FiBarChart2,
	FiPlus,
	FiX,
} from "react-icons/fi";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import { getMonthlyData, getAnnualData } from "../utils/chartHelpers";

const Dashboard = () => {
	const auth = getAuthData();
	const queryClient = useQueryClient();
	const username = auth?.user?.username || "there";
	const [chartView, setChartView] = useState<"monthly" | "annually">("monthly");
	const [modalOpen, setModalOpen] = useState(false);

	// Form State for Drawer/Modal
	const [form, setForm] = useState({
		amount: "",
		category: "",
		type: "expense" as "expense" | "income",
		date: new Date().toISOString().split("T")[0],
		description: "",
	});
	const [formError, setFormError] = useState<string | null>(null);

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

	const createMut = useMutation({
		mutationFn: (data: any) => createTransaction(data, auth?.token || ""),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			setModalOpen(false);
			setForm({
				amount: "",
				category: "",
				type: "expense",
				date: new Date().toISOString().split("T")[0],
				description: "",
			});
		},
		onError: (err: Error) => setFormError(err.message),
	});

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.category) return setFormError("Please select a category");
		createMut.mutate({ ...form, amount: parseFloat(form.amount) });
	};

	if (txLoading || catLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-32 opacity-80 animate-fade-up">
				<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse mb-6">
					<FiActivity size={32} />
				</div>
				<p className="text-sm font-medium tracking-wide text-muted-foreground">
					Syncing your financial pulse...
				</p>
			</div>
		);
	}

	const transactions = txData?.data || [];
	const categories = catData?.data || [];

	const income = transactions
		.filter((t: any) => t.type === "income")
		.reduce((acc: number, t: any) => acc + t.amount, 0);
	const expense = transactions
		.filter((t: any) => t.type === "expense")
		.reduce((acc: number, t: any) => acc + t.amount, 0);
	const balance = income - expense;

	const currentChartData =
		chartView === "monthly"
			? getMonthlyData(transactions)
			: getAnnualData(transactions);

	const today = new Date();
	const dateOptions: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "short",
		year: "numeric",
	};
	const dateString = today.toLocaleDateString("en-US", dateOptions);

	return (
		<div className="space-y-10 pb-20 relative">
			<div className="relative z-10 space-y-10">
				{/* ── Personalized Header ── */}
				<div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-4">
					<div>
						<h1 className="text-4xl font-normal tracking-tight text-foreground">
							Welcome Back, <span className="font-semibold">{username}</span>
						</h1>
						<p className="text-muted-foreground mt-2 font-medium">
							Here is what's happening with your finances today.
						</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="bg-card px-5 py-3 rounded-full shadow-sm flex items-center gap-3 text-sm font-semibold text-foreground">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
								<line x1="16" y1="2" x2="16" y2="6"></line>
								<line x1="8" y1="2" x2="8" y2="6"></line>
								<line x1="3" y1="10" x2="21" y2="10"></line>
							</svg>
							{dateString}
						</div>
						<button
							onClick={() => setModalOpen(true)}
							className="bg-white border border-border shadow-sm px-5 py-3 rounded-full text-sm font-semibold hover:bg-secondary transition-colors flex items-center gap-2 hover:-translate-y-0.5"
						>
							<FiPlus size={16} /> New Entry
						</button>
					</div>
				</div>

				{/* ── Metric Grid ── */}
				<div
					className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up"
					style={{ animationDelay: "100ms" }}
				>
					<div className="p-8 rounded-[32px] bg-primary text-white shadow-[0_12px_40px_rgba(5,150,105,0.3)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
						<div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/10 blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
						<div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-black/10 blur-xl group-hover:scale-110 transition-transform duration-700"></div>
						<div className="relative z-10 flex flex-col h-full justify-between">
							<div className="flex items-center justify-between mb-8">
								<span className="text-primary-foreground/80 font-medium tracking-wide uppercase text-xs">
									Total Balance
								</span>
								<FiCreditCard size={24} className="opacity-80" />
							</div>
							<div>
								<h4 className="text-[2.5rem] font-bold tracking-tight mb-2">
									₹{balance.toLocaleString()}
								</h4>
								<div className="flex items-center gap-4 text-sm font-medium text-primary-foreground/80">
									<span>**** 9090</span>
									<span>EXP 09/26</span>
								</div>
							</div>
						</div>
					</div>
					<MetricCard
						label="Total Income"
						value={income}
						icon={<FiArrowUpRight size={20} />}
						variant="success"
					/>
					<MetricCard
						label="Total Expenses"
						value={expense}
						icon={<FiArrowDownRight size={20} />}
						variant="danger"
					/>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* ── Dynamic Chart ── */}
					<div
						className="lg:col-span-8 modern-card p-8 animate-fade-up"
						style={{ animationDelay: "200ms" }}
					>
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground shrink-0">
									<FiBarChart2 size={18} />
								</div>
								<h3 className="text-xl font-bold tracking-tight">
									Engagement Rate
								</h3>
							</div>
							<div className="flex bg-secondary p-1 rounded-full self-start sm:self-auto">
								<button
									onClick={() => setChartView("monthly")}
									className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${chartView === "monthly" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
								>
									Monthly
								</button>
								<button
									onClick={() => setChartView("annually")}
									className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${chartView === "annually" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
								>
									Annually
								</button>
							</div>
						</div>
						<div className="mt-4">
							<MonthlyBarChart
								labels={currentChartData.labels}
								incomeData={currentChartData.incomeData}
								expenseData={currentChartData.expenseData}
							/>
						</div>
					</div>

					{/* ── Recent Activity ── */}
					<div
						className="lg:col-span-4 modern-card p-8 animate-fade-up"
						style={{ animationDelay: "300ms" }}
					>
						<div className="flex items-center justify-between mb-8">
							<h3 className="text-xl font-bold tracking-tight">History</h3>
							<button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-zinc-200 transition-colors">
								<FiArrowUpRight size={14} />
							</button>
						</div>
						<div className="space-y-4">
							{transactions.length === 0 ? (
								<div className="py-12 text-center">
									<p className="text-sm font-medium text-muted-foreground">
										No recent transactions
									</p>
								</div>
							) : (
								transactions
									.slice(0, 5)
									.map((t: any) => <ActivityRow key={t._id} t={t} />)
							)}
						</div>
					</div>
				</div>
			</div>

			{/* ── Add/Edit Modal ── */}
			{modalOpen &&
				createPortal(
					<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
						<div className="bg-white rounded-[40px] w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden animate-fade-up">
							<div className="p-8 pb-4 flex items-center justify-between">
								<h2 className="text-2xl font-bold tracking-tight text-foreground">
									New Entry
								</h2>
								<button
									onClick={() => setModalOpen(false)}
									className="text-muted-foreground hover:text-foreground w-10 h-10 flex items-center justify-center transition-all bg-[#f3f4f6] rounded-full"
								>
									<FiX size={18} />
								</button>
							</div>

							<form onSubmit={handleSave} className="p-8 pt-2 space-y-6">
								{formError && (
									<div className="p-4 bg-rose-50 text-rose-500 text-sm rounded-2xl text-center font-bold">
										{formError}
									</div>
								)}

								<div className="bg-[#f3f4f6] p-1.5 rounded-full flex">
									{(["expense", "income"] as const).map((type) => (
										<button
											key={type}
											type="button"
											onClick={() => setForm((f) => ({ ...f, type }))}
											className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${form.type === type ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
										>
											{type.charAt(0).toUpperCase() + type.slice(1)}
										</button>
									))}
								</div>

								<div className="space-y-4">
									<div>
										<label className="text-[10px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">
											Amount (₹)
										</label>
										<input
											type="number"
											required
											value={form.amount}
											onChange={(e) =>
												setForm((f) => ({ ...f, amount: e.target.value }))
											}
											className="w-full h-14 px-5 bg-[#f3f4f6] rounded-[20px] text-base font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none"
											placeholder="0.00"
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="text-[10px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">
												Category
											</label>
											<select
												value={form.category}
												required
												onChange={(e) =>
													setForm((f) => ({ ...f, category: e.target.value }))
												}
												className="w-full h-14 bg-[#f3f4f6] rounded-[20px] px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold border-none"
											>
												<option value="">Select...</option>
												{categories.map((c: any) => (
													<option key={c._id} value={c._id}>
														{c.name}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="text-[10px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">
												Date
											</label>
											<input
												type="date"
												required
												value={form.date}
												onChange={(e) =>
													setForm((f) => ({ ...f, date: e.target.value }))
												}
												className="w-full h-14 bg-[#f3f4f6] rounded-[20px] px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold border-none"
											/>
										</div>
									</div>
									<div>
										<label className="text-[10px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">
											Description
										</label>
										<textarea
											value={form.description}
											onChange={(e) =>
												setForm((f) => ({ ...f, description: e.target.value }))
											}
											className="w-full p-5 bg-[#f3f4f6] rounded-[20px] text-sm h-28 resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium border-none"
											placeholder="Add more details..."
										/>
									</div>
								</div>
								<button
									type="submit"
									disabled={createMut.isPending}
									className="w-full h-14 bg-primary text-white rounded-full text-base font-bold hover:bg-primary/90 transition-all flex items-center justify-center shadow-[0_8px_20px_rgba(5,150,105,0.2)] hover-lift disabled:opacity-50"
								>
									{createMut.isPending ? "Processing..." : "Save Transaction"}
								</button>
							</form>
						</div>
					</div>,
					document.body,
				)}
		</div>
	);
};

const MetricCard = ({ label, value, icon, variant }: any) => {
	const isSuccess = variant === "success";
	return (
		<div className="p-8 modern-card flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
			<div className="flex items-center justify-between mb-8">
				<div className="flex flex-col">
					<p className="text-sm font-semibold text-foreground mb-1">{label}</p>
					<p className="text-xs text-muted-foreground">Since tracking began</p>
				</div>
				<div
					className={`w-10 h-10 rounded-full flex items-center justify-center ${isSuccess ? "bg-primary/10 text-primary" : "bg-rose-500/10 text-rose-500"}`}
				>
					{icon}
				</div>
			</div>
			<div className="flex items-end justify-between">
				<h4 className="text-3xl font-bold tracking-tighter text-foreground">
					₹{value.toLocaleString()}
				</h4>
			</div>
		</div>
	);
};

const ActivityRow = ({ t }: any) => {
	const isIncome = t.type === "income";
	return (
		<div className="flex items-center justify-between p-3 rounded-2xl hover:bg-secondary transition-colors group cursor-default">
			<div className="flex items-center gap-4 min-w-0">
				<div
					className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm ${isIncome ? "text-primary bg-primary/10" : "text-zinc-600 bg-zinc-100"}`}
				>
					<FiCreditCard size={20} />
				</div>
				<div className="min-w-0">
					<p className="text-sm font-bold text-foreground leading-none mb-1.5 truncate group-hover:text-primary transition-colors">
						{t.description || "Payment"}
					</p>
					<span className="text-[11px] font-semibold text-muted-foreground">
						{new Date(t.date).toLocaleDateString(undefined, {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</span>
				</div>
			</div>
			<div className="ml-4 shrink-0 text-right">
				<p className="text-sm font-bold text-foreground mb-1.5">
					{isIncome ? "+" : "-"}₹{t.amount.toLocaleString()}
				</p>
				<div className="flex items-center gap-1.5 justify-end">
					<div
						className={`w-1.5 h-1.5 rounded-full ${isIncome ? "bg-primary" : "bg-zinc-400"}`}
					></div>
					<span className="text-[10px] font-semibold text-muted-foreground">
						Successful
					</span>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
