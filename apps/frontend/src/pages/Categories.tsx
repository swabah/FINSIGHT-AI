import { useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { Label } from "@/components/ui/label";
import {
	FiEdit2,
	FiLayers,
	FiTrash2,
	FiX,
	FiPlus,
} from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createCategory,
	deleteCategory,
	fetchCategories,
	updateCategory,
} from "../services/transactionService";
import { getAuthData } from "../services/authService";

interface Category {
	_id: string;
	name: string;
	color_code: string;
	isDefault?: boolean;
}

interface CategoryFormData {
	name: string;
	color_code: string;
}

const Categories = () => {
	const auth = getAuthData();
	const queryClient = useQueryClient();
	const [modalOpen, setModalOpen] = useState(false);
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
	const [editingCat, setEditingCat] = useState<Category | null>(null);
	const [form, setForm] = useState<CategoryFormData>({ name: "", color_code: "#3b82f6" });
	const [error, setError] = useState<string | null>(null);

	const { data: catData, isPending } = useQuery({
		queryKey: ["categories"],
		queryFn: () => fetchCategories(auth?.token || ""),
		enabled: !!auth?.token,
	});

	const createMut = useMutation({
		mutationFn: (data: CategoryFormData) => createCategory(data, auth?.token || ""),
		onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); closeModal(); },
		onError: (err: Error) => setError(err.message),
	});

	const updateMut = useMutation({
		mutationFn: (data: CategoryFormData & { id: string }) => updateCategory(data.id, { name: data.name, color_code: data.color_code }, auth?.token || ""),
		onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); closeModal(); },
		onError: (err: Error) => setError(err.message),
	});

	const deleteMut = useMutation({
		mutationFn: (id: string) => deleteCategory(id, auth?.token || ""),
		onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); setConfirmDeleteId(null); },
		onError: (err: Error) => alert(err.message),
	});

	const openAdd = () => { setEditingCat(null); setForm({ name: "", color_code: "#3b82f6" }); setError(null); setModalOpen(true); };
	const openEdit = (cat: Category) => { setEditingCat(cat); setForm({ name: cat.name, color_code: cat.color_code || "#3b82f6" }); setError(null); setModalOpen(true); };
	const closeModal = () => { setModalOpen(false); setEditingCat(null); setError(null); };

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name.trim()) return setError("Category name is required");
		editingCat ? updateMut.mutate({ id: editingCat._id, ...form }) : createMut.mutate(form);
	};

	const categories: Category[] = catData?.data || [];

	if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary animate-pulse mb-4">
                    <FiLayers size={20} />
                </div>
                <p className="text-xs font-medium tracking-wide">Loading categories...</p>
            </div>
        );
    }

	return (
		<div className="space-y-8 pb-20">
			<ConfirmModal
				isOpen={!!confirmDeleteId}
				onClose={() => setConfirmDeleteId(null)}
				onConfirm={() => confirmDeleteId && deleteMut.mutate(confirmDeleteId)}
				title="Delete Category"
				message="Are you sure you want to remove this category? Associated transactions will become uncategorized."
				confirmText="Delete"
				variant="danger"
			/>

			{/* ── Toolbar ── */}
			<div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary rounded">
						<FiLayers size={18} />
					</div>
					<h3 className="text-lg font-medium tracking-tight">Financial Categories</h3>
				</div>
				<button 
                    type="button" 
                    onClick={openAdd} 
                    className="h-10 px-6 bg-primary text-white rounded text-xs font-medium hover:bg-blue-600 transition-all flex items-center gap-2 shadow-sm"
                >
					<FiPlus size={14} /> New Category
				</button>
			</div>

			{/* ── Grid Interface ── */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{categories.map((c: Category) => (
					<div key={c._id} className="p-6 bg-card border border-border/60 hover:border-border rounded-2xl transition-all group relative hover:-translate-y-1 hover:shadow-md">
						<div className="flex items-center justify-between mb-8">
							<div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.15)] ring-2 ring-white" style={{ backgroundColor: c.color_code }} />
							{!c.isDefault ? (
								<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<button onClick={() => openEdit(c)} className="w-8 h-8 flex items-center justify-center border border-border bg-white text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all shadow-sm"><FiEdit2 size={12} /></button>
									<button onClick={() => setConfirmDeleteId(c._id)} className="w-8 h-8 flex items-center justify-center border border-border bg-white text-muted-foreground hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all shadow-sm"><FiTrash2 size={12} /></button>
								</div>
							) : (
                                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest bg-accent border border-border px-2 py-0.5 rounded">Standard</span>
                            )}
						</div>
						<h4 className="text-[15px] font-bold text-foreground tracking-tight truncate">{c.name}</h4>
                        <p className="text-[10px] font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{c.isDefault ? "Built-in" : "Manual"}</p>
					</div>
				))}
			</div>

			{/* ── Category Editor Modal ── */}
			{modalOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
					<div className="bg-card border border-border/50 rounded-2xl w-full max-w-sm shadow-[0_10px_40px_-5px_rgba(0,0,0,0.1)] overflow-hidden animate-fade-up">
						<div className="p-6 border-b border-border/50 flex items-center justify-between bg-white">
					    	<h4 className="text-xl font-semibold tracking-tight text-foreground">
                                {editingCat ? "Edit Category" : "New Category"}
                            </h4>
							<button onClick={closeModal} className="text-muted-foreground hover:text-foreground p-1 transition-all hover:bg-accent rounded-full"><FiX size={18} /></button>
						</div>
						
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
							{error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded text-center font-medium">{error}</div>}
							
                            <div className="space-y-5">
								<div>
									<Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category Name</Label>
									<input
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full h-11 bg-input border border-border rounded px-4 text-sm font-medium outline-none focus:border-primary/50 transition-all placeholder:opacity-30"
                                        placeholder="e.g. Subscriptions"
                                    />
								</div>
								<div>
									<Label className="text-xs font-medium text-muted-foreground mb-2 block leading-none">Color Label</Label>
									<div className="flex flex-wrap gap-2 p-3 bg-input border border-border rounded-lg">
										{["#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e", "#10b981", "#f59e0b", "#71717a"].map(c => (
											<button 
                                                key={c} 
                                                type="button" 
                                                onClick={() => setForm(f => ({ ...f, color_code: c }))} 
                                                className={`h-8 w-8 rounded transition-all duration-200 border-2 ${form.color_code === c ? "border-primary scale-110 shadow-sm" : "border-transparent opacity-50 hover:opacity-100"}`} 
                                                style={{ backgroundColor: c }} 
                                            />
										))}
									</div>
								</div>
							</div>
							<button 
                                type="submit" 
                                disabled={createMut.isPending || updateMut.isPending}
                                className="w-full h-12 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                            >
								{editingCat ? "Update Category" : "Create Category"}
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Categories;
