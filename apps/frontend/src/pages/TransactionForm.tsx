import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTransaction } from "../services/transactionService";
import { getAuthData } from "../services/authService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import {
	FiArrowLeft,
	FiLayers,
	FiCalendar,
	FiTag,
	FiType,
	FiSave,
	FiPlus,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface FormData {
	amount: string;
	category: string;
	type: "income" | "expense";
	date: string;
	description: string;
}

const INITIAL_STATE: FormData = {
	amount: "",
	category: "",
	type: "expense",
	date: new Date().toISOString().split("T")[0],
	description: "",
};

const CATEGORIES = [
	"Food",
	"Rent",
	"Salary",
	"Entertainment",
	"Shopping",
	"Transport",
	"Healthcare",
	"Utilities",
	"Others",
];

const TransactionForm: React.FC = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const auth = getAuthData();
	const [formData, setFormData] = useState<FormData>(INITIAL_STATE);
	const [customCategory, setCustomCategory] = useState("");

	const mutation = useMutation({
		mutationFn: (data: any) => createTransaction(data, auth?.token || ""),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			queryClient.invalidateQueries({ queryKey: ["analyticsStats"] });
			navigate("/transactions");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const finalCategory =
			formData.category === "Others" && customCategory
				? customCategory
				: formData.category;

		mutation.mutate({
			...formData,
			amount: parseFloat(formData.amount),
			category: finalCategory || "Uncategorized",
		});
	};

	return (
		<div className="max-w-3xl mx-auto pb-20">
			{/* Header */}
			<div className="flex items-center justify-between mb-10">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate(-1)}
						className="rounded-xl border border-slate-100 bg-white shadow-sm h-12 w-12 text-slate-400 hover:text-slate-900"
					>
						<FiArrowLeft className="text-xl" />
					</Button>
					<div>
						<h1 className="text-3xl font-heading font-bold text-slate-800 tracking-tight mb-0.5">
							Initialize Node
						</h1>
						<p className="text-slate-400 font-medium text-sm">
							Create a new financial record entry.
						</p>
					</div>
				</div>
				<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
					<FiPlus className="text-2xl" />
				</div>
			</div>

			<Card className="bg-slate-50/50 border-slate-100 rounded-[2.5rem] lumen-shadow overflow-hidden">
				<CardContent className="p-8 md:p-12">
					<form onSubmit={handleSubmit} className="space-y-10">
						{/* Type Selection */}
						<div className="grid grid-cols-2 gap-4">
							<button
								type="button"
								onClick={() => setFormData({ ...formData, type: "income" })}
								className={`flex items-center justify-center gap-3 h-16 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all ${
									formData.type === "income"
										? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
										: "bg-white text-slate-400 border border-slate-100 hover:border-emerald-200 hover:text-emerald-500"
								}`}
							>
								Revenue
							</button>
							<button
								type="button"
								onClick={() => setFormData({ ...formData, type: "expense" })}
								className={`flex items-center justify-center gap-3 h-16 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all ${
									formData.type === "expense"
										? "bg-slate-900 text-white shadow-lg shadow-slate-200"
										: "bg-white text-slate-400 border border-slate-100 hover:border-slate-300 hover:text-slate-800"
								}`}
							>
								Deployment
							</button>
						</div>

						{/* Amount Input */}
						<div className="space-y-4">
							<Label className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] ml-1">
								Vector Magnitude (Amount)
							</Label>
							<div className="relative group">
								<span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-300 group-focus-within:text-primary transition-colors">
									₹
								</span>
								<Input
									type="number"
									required
									value={formData.amount}
									onChange={(e) =>
										setFormData({ ...formData, amount: e.target.value })
									}
									className="w-full bg-white border-slate-100 focus-visible:ring-primary h-20 rounded-3xl text-3xl font-black pl-14 pr-6 placeholder:text-slate-100 shadow-sm"
									placeholder="0.00"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<Label className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] ml-1">
									Classification (Category)
								</Label>
								<div className="relative">
									<FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
									<select
										value={formData.category}
										onChange={(e) =>
											setFormData({ ...formData, category: e.target.value })
										}
										className="w-full bg-white border border-slate-100 focus:ring-primary h-14 rounded-2xl pl-12 pr-4 text-sm font-medium outline-none appearance-none shadow-sm cursor-pointer"
										required
									>
										<option value="">Select Classification</option>
										{CATEGORIES.map((cat) => (
											<option key={cat} value={cat}>
												{cat}
											</option>
										))}
									</select>
									<FiTag className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
								</div>
							</div>

							<div className="space-y-4">
								<Label className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] ml-1">
									Timeline (Date)
								</Label>
								<div className="relative">
									<FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
									<Input
										type="date"
										required
										value={formData.date}
										onChange={(e) =>
											setFormData({ ...formData, date: e.target.value })
										}
										className="w-full bg-white border-slate-100 focus-visible:ring-primary h-14 rounded-2xl pl-12 shadow-sm"
									/>
								</div>
							</div>
						</div>

						{formData.category === "Others" && (
							<div className="space-y-4 animate-in slide-in-from-top-2">
								<Label className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] ml-1">
									Custom Classification
								</Label>
								<Input
									placeholder="Enter custom category name..."
									value={customCategory}
									onChange={(e) => setCustomCategory(e.target.value)}
									className="w-full bg-white border-slate-100 focus-visible:ring-primary h-14 rounded-2xl px-6 shadow-sm"
								/>
							</div>
						)}

						<div className="space-y-4">
							<Label className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] ml-1">
								Documentation (Description)
							</Label>
							<div className="relative">
								<FiType className="absolute left-4 top-4 text-slate-400" />
								<textarea
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									className="w-full bg-white border border-slate-100 focus:ring-primary min-h-[120px] rounded-2xl p-4 pl-12 text-sm font-medium outline-none shadow-sm"
									placeholder="Technical notes for this transaction..."
								/>
							</div>
						</div>

						<Button
							type="submit"
							disabled={mutation.isPending}
							className="w-full bg-primary hover:bg-primary/90 text-white h-16 rounded-[1.5rem] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-[0.98] transition-all mt-6"
						>
							{mutation.isPending ? (
								<LoadingSpinner size="sm" />
							) : (
								<span className="flex items-center gap-3">
									<FiSave className="text-xl" />
									Encrypt & Store Entry
								</span>
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default TransactionForm;
