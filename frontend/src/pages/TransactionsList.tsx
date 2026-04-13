import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchTransactions,
	deleteTransaction,
	createTransaction,
	updateTransaction,
	fetchCategories,
} from "../services/transactionService";
import { getAuthData } from "../services/authService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import {
	FiPlus,
	FiTrash2,
	FiEdit2,
	FiSearch,
	FiX,
	FiActivity,
	FiCalendar,
	FiTag,
	FiFilter,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ─── Types ─── */
interface TxFormData {
	amount: string;
	category: string;
	type: "income" | "expense";
	date: string;
	description: string;
}

const EMPTY_FORM: TxFormData = {
	amount: "",
	category: "",
	type: "expense",
	date: new Date().toISOString().split("T")[0],
	description: "",
};

/* ─── Main Component ─── */
const TransactionsList: React.FC = () => {
	const auth = getAuthData();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [editingTx, setEditingTx] = useState<any>(null);
	const [form, setForm] = useState<TxFormData>(EMPTY_FORM);
	const [error, setError] = useState<string | null>(null);

	// Queries
	const { data: txData, isPending: txLoading } = useQuery({
		queryKey: ["transactions"],
		queryFn: () => fetchTransactions(auth?.token || ""),
		enabled: !!auth?.token,
	});

	const { data: catData } = useQuery({
		queryKey: ["categories"],
		queryFn: () => fetchCategories(auth?.token || ""),
		enabled: !!auth?.token,
	});

	// Mutations
	const deleteMut = useMutation({
		mutationFn: (id: string) => deleteTransaction(id, auth?.token || ""),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["transactions"] }),
	});

	const saveMut = useMutation({
		mutationFn: (data: any) =>
			editingTx
				? updateTransaction(editingTx._id, data, auth?.token || "")
				: createTransaction(data, auth?.token || ""),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			closeModal();
		},
		onError: (err: any) => {
			setError(err.message || "Operation failed");
		},
	});

	// Handlers
	const openAdd = () => {
		setEditingTx(null);
		setForm(EMPTY_FORM);
		setError(null);
		setModalOpen(true);
	};

	const openEdit = (t: any) => {
		setEditingTx(t);
		setError(null);
		// Ensure category is extracted as ID
		const catId = typeof t.category === "object" ? t.category?._id : t.category;
		setForm({
			amount: t.amount.toString(),
			category: catId || "",
			type: t.type,
			date: t.date ? t.date.split("T")[0] : new Date().toISOString().split("T")[0],
			description: t.description || "",
		});
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		setEditingTx(null);
		setForm(EMPTY_FORM);
		setError(null);
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.category) return setError("Please select a category");
		setError(null);
		saveMut.mutate({
			...form,
			amount: parseFloat(form.amount),
		});
	};

	// Logic
	const filtered = useMemo(() => {
		const list = txData?.data || [];
		if (!search) return list;
		const s = search.toLowerCase();
		return list.filter(
			(t: any) =>
				t.description?.toLowerCase().includes(s) ||
				(typeof t.category === "object" && t.category?.name?.toLowerCase().includes(s)),
		);
	}, [txData, search]);

	const categories = catData?.data || [];
	const activeCategories = categories.filter((c: any) => c.type === form.type);

	return (
		<div className="max-w-6xl mx-auto space-y-4 pb-8">
			{/* Action Bar */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="relative flex-1 max-w-sm group">
					<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search records..."
						className="h-10 pl-10 pr-4 rounded-lg border-slate-200 bg-white text-sm"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						className="h-10 px-4 rounded-lg bg-white border-slate-200 hover:bg-slate-50 text-xs font-bold"
					>
						<FiFilter className="mr-2" /> Filters
					</Button>
					<Button
						onClick={openAdd}
						className="h-10 px-4 rounded-lg bg-slate-900 text-xs font-bold text-white"
					>
						<FiPlus className="mr-2" /> New Record
					</Button>
				</div>
			</div>

			{/* Results Surface */}
			{txLoading ? (
				<div className="flex justify-center py-20">
					<LoadingSpinner text="Loading..." />
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-100">
					<div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 mb-4">
						<FiActivity size={20} />
					</div>
					<h3 className="text-lg font-bold text-slate-900 mb-1">No Records</h3>
					<p className="text-slate-500 text-xs font-medium mb-6">
						{search ? "No matches found." : "No records initialized yet."}
					</p>
					{!search && (
						<Button
							onClick={openAdd}
							size="sm"
							className="px-6 rounded-lg font-bold"
						>
							<FiPlus className="mr-2" /> Add Record
						</Button>
					)}
				</div>
			) : (
				<div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
					<div className="overflow-x-auto text-xs">
						<table className="w-full border-collapse">
							<thead>
								<tr className="bg-slate-50 border-b border-slate-100">
									<th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
										Date
									</th>
									<th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
										Category
									</th>
									<th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
										Description
									</th>
									<th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
										Amount
									</th>
									<th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-50">
								{filtered.map((t: any) => (
									<tr
										key={t._id}
										className="group hover:bg-slate-50 transition-colors"
									>
										<td className="px-6 py-4">
											<div className="flex flex-col">
												<span className="font-bold text-slate-900 leading-none">
													{new Date(t.date).toLocaleDateString("en-IN", {
														day: "2-digit",
														month: "short",
													})}
												</span>
											</div>
										</td>
										<td className="px-6 py-4">
											<span
												className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border"
												style={{
													backgroundColor:
														`${t.category?.color_code}10` || "#f1f5f9",
													color: t.category?.color_code || "#64748b",
													borderColor:
														`${t.category?.color_code}20` || "#e2e8f0",
												}}
											>
												{typeof t.category === "object" ? t.category?.name : (t.category || "General")}
											</span>
										</td>
										<td className="px-6 py-4 text-slate-600 font-medium max-w-[200px] truncate">
											{t.description || (
												<span className="text-slate-300 italic opacity-50">
													—
												</span>
											)}
										</td>
										<td className="px-6 py-4 text-right whitespace-nowrap">
											<div className="flex flex-col items-end">
												<span
													className={`text-sm font-extrabold tracking-tight ${t.type === "income" ? "text-emerald-500" : "text-slate-900"}`}
												>
													{t.type === "income" ? "+" : "−"}₹
													{t.amount.toLocaleString()}
												</span>
												<span
													className={`flex items-center gap-1 text-[8px] font-bold uppercase ${t.type === "income" ? "text-emerald-400" : "text-slate-300"}`}
												>
													{t.type}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
												<button
													type="button"
													onClick={() => openEdit(t)}
													className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 bg-white border border-slate-100 hover:text-primary hover:border-primary/30 transition-all"
												>
													<FiEdit2 size={12} />
												</button>
												<button
													type="button"
													onClick={() => deleteMut.mutate(t._id)}
													className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 bg-white border border-slate-100 hover:text-rose-500 hover:border-rose-200 transition-all"
												>
													<FiTrash2 size={12} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* ─── Record Modal ─── */}
			{modalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-slate-900/40"
						onClick={closeModal}
					/>
					{/* Panel */}
					<div className="relative bg-white rounded-xl border border-slate-100 w-full max-w-sm max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
						{/* Header */}
						<div className="flex items-center justify-between p-5 border-b border-slate-100">
							<div>
								<h2 className="font-heading font-extrabold text-lg text-slate-900">
									{editingTx ? "Edit Entry" : "New Entry"}
								</h2>
							</div>
							<button
								type="button"
								onClick={closeModal}
								className="w-8 h-8 rounded-md bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500"
							>
								<FiX size={16} />
							</button>
						</div>

						{/* Form */}
						<form onSubmit={handleSave} className="p-5 space-y-4">
							{error && (
								<div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-[10px] font-bold animate-in shake duration-300">
									{error}
								</div>
							)}

							{/* Type toggle */}
							<div className="bg-slate-50 p-1 rounded-lg grid grid-cols-2 gap-1 border border-slate-100">
								<button
									type="button"
									onClick={() =>
										setForm((f) => ({ ...f, type: "expense", category: "" }))
									}
									className={`py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
										form.type === "expense"
											? "bg-white text-slate-900 border border-slate-100 shadow-sm"
											: "text-slate-400 hover:text-slate-600"
									}`}
								>
									Expense
								</button>
								<button
									type="button"
									onClick={() =>
										setForm((f) => ({ ...f, type: "income", category: "" }))
									}
									className={`py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
										form.type === "income"
											? "bg-white text-emerald-600 border border-slate-100 shadow-sm"
											: "text-slate-400 hover:text-slate-600"
									}`}
								>
									Income
								</button>
							</div>

							<div className="space-y-4">
								{/* Amount */}
								<div className="space-y-1">
									<Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">
										Amount (INR)
									</Label>
									<div className="relative">
										<span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-300">
											₹
										</span>
										<Input
											id="amount"
											type="number"
											step="0.01"
											min="0.01"
											required
											value={form.amount}
											onChange={(e) =>
												setForm((f) => ({ ...f, amount: e.target.value }))
											}
											className="h-12 pl-10 rounded-lg border-slate-200 bg-white text-xl font-black tracking-tight"
											placeholder="0.00"
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									{/* Category */}
									<div className="space-y-1">
										<Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">
											Category
										</Label>
										<div className="relative">
											<FiTag
												size={12}
												className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
											/>
											<select
												id="cat"
												required
												value={form.category}
												onChange={(e) =>
													setForm((f) => ({ ...f, category: e.target.value }))
												}
												className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 outline-none focus:border-primary transition-colors appearance-none"
											>
												<option value="">Select</option>
												{activeCategories.map((c: any) => (
													<option key={c._id} value={c._id}>
														{c.name}
													</option>
												))}
											</select>
										</div>
									</div>

									{/* Date */}
									<div className="space-y-1">
										<Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">
											Date
										</Label>
										<div className="relative">
											<FiCalendar
												size={12}
												className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
											/>
											<Input
												id="date"
												type="date"
												required
												value={form.date}
												onChange={(e) =>
													setForm((f) => ({ ...f, date: e.target.value }))
												}
												className="h-10 pl-9 rounded-lg border-slate-200 bg-white text-[11px] font-bold"
											/>
										</div>
									</div>
								</div>

								{/* Description */}
								<div className="space-y-1">
									<Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">
										Notes
									</Label>
									<textarea
										id="desc"
										value={form.description}
										onChange={(e) =>
											setForm((f) => ({ ...f, description: e.target.value }))
										}
										rows={2}
										placeholder="Record details..."
										className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-700 outline-none focus:border-primary resize-none transition-colors"
									/>
								</div>
							</div>

							{/* Actions */}
							<div className="flex gap-2 pt-2">
								<Button
									type="button"
									variant="outline"
									onClick={closeModal}
									className="flex-1 h-10 rounded-lg text-[10px] font-bold uppercase tracking-widest"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={saveMut.isPending}
									className="flex-1 h-10 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white"
								>
									{saveMut.isPending ? (
										<LoadingSpinner size="sm" />
									) : editingTx ? (
										"Update"
									) : (
										"Secure"
									)}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default TransactionsList;
