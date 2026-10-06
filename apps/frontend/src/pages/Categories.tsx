import { useState } from "react";
import { createPortal } from "react-dom";
import ConfirmModal from "../components/ConfirmModal";
import { Label } from "@/components/ui/label";
import {
	FiEdit2,
	FiLayers,
	FiTrash2,
	FiX,
	FiPlus,
    FiTag
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
	const [form, setForm] = useState<CategoryFormData>({ name: "", color_code: "#10b981" });
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

	const openAdd = () => { setEditingCat(null); setForm({ name: "", color_code: "#10b981" }); setError(null); setModalOpen(true); };
	const openEdit = (cat: Category) => { setEditingCat(cat); setForm({ name: cat.name, color_code: cat.color_code || "#10b981" }); setError(null); setModalOpen(true); };
	const closeModal = () => { setModalOpen(false); setEditingCat(null); setError(null); };

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name.trim()) return setError("Category name is required");
		editingCat ? updateMut.mutate({ id: editingCat._id, ...form }) : createMut.mutate(form);
	};

	const categories: Category[] = catData?.data || [];

	if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center py-32 opacity-80 animate-fade-up">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse mb-6">
                    <FiLayers size={32} />
                </div>
                <p className="text-sm font-medium tracking-wide text-muted-foreground">Loading categories...</p>
            </div>
        );
    }

	return (
		<div className="space-y-10 pb-20 relative">
			<ConfirmModal
				isOpen={!!confirmDeleteId}
				onClose={() => setConfirmDeleteId(null)}
				onConfirm={() => confirmDeleteId && deleteMut.mutate(confirmDeleteId)}
				title="Delete Category"
				message="Are you sure you want to remove this category? Associated transactions will become uncategorized."
				confirmText="Delete"
				variant="danger"
			/>

			<div className="relative z-10 space-y-8 animate-fade-up">
                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-normal tracking-tight text-foreground">
                            Expense <span className="font-semibold">Categories</span>
                        </h1>
                        <p className="text-muted-foreground text-sm mt-2 font-medium">Organize and tag your expenses seamlessly.</p>
                    </div>
                </div>

                {/* ── Toolbar ── */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-6 modern-card">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary flex items-center justify-center text-foreground rounded-full shrink-0">
                            <FiTag size={20} />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold tracking-tight">Financial Categories</h3>
                    </div>
                    <button 
                        type="button" 
                        onClick={openAdd} 
                        className="w-full sm:w-auto h-12 px-8 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(5,150,105,0.2)] hover-lift"
                    >
                        <FiPlus size={16} /> New Category
                    </button>
                </div>

                {/* ── Grid Interface ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((c: Category) => (
                        <div key={c._id} className="p-8 modern-card hover-lift group relative">
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-5 h-5 rounded-full shadow-sm ring-4 ring-secondary" style={{ backgroundColor: c.color_code }} />
                                {!c.isDefault ? (
                                    <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(c)} className="w-10 h-10 flex items-center justify-center bg-secondary text-muted-foreground hover:text-foreground hover:bg-zinc-200 rounded-full transition-all shadow-sm"><FiEdit2 size={14} /></button>
                                        <button onClick={() => setConfirmDeleteId(c._id)} className="w-10 h-10 flex items-center justify-center bg-secondary text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all shadow-sm"><FiTrash2 size={14} /></button>
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest bg-secondary px-3 py-1 rounded-full">Standard</span>
                                )}
                            </div>
                            <h4 className="text-2xl font-bold text-foreground tracking-tight truncate">{c.name}</h4>
                            <p className="text-[11px] font-bold text-muted-foreground mt-2 uppercase tracking-wider">{c.isDefault ? "Built-in" : "Manual"}</p>
                        </div>
                    ))}
                </div>
            </div>

			{/* ── Category Editor Modal ── */}
			{modalOpen && createPortal(
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
					<div className="bg-white rounded-[40px] w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden animate-fade-up">
						<div className="p-8 pb-4 flex items-center justify-between">
					    	<h4 className="text-2xl font-bold tracking-tight text-foreground">
                                {editingCat ? "Edit Category" : "New Category"}
                            </h4>
							<button onClick={closeModal} className="text-muted-foreground hover:text-foreground w-10 h-10 flex items-center justify-center transition-all bg-[#f3f4f6] rounded-full"><FiX size={18} /></button>
						</div>
						
                        <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-6">
							{error && <div className="p-4 bg-rose-50 text-rose-500 text-sm rounded-2xl text-center font-bold">{error}</div>}
							
                            <div className="space-y-6">
								<div>
									<label className="text-[10px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Category Name</label>
									<input
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full h-14 px-5 bg-[#f3f4f6] rounded-[20px] text-base font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none"
                                        placeholder="e.g. Subscriptions"
                                    />
								</div>
								<div>
									<label className="text-[10px] font-bold text-muted-foreground mb-3 block uppercase tracking-widest">Color Label</label>
									<div className="flex flex-wrap gap-3 p-4 bg-[#f3f4f6] rounded-[20px]">
										{["#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e", "#10b981", "#f59e0b", "#71717a"].map(c => (
											<button 
                                                key={c} 
                                                type="button" 
                                                onClick={() => setForm(f => ({ ...f, color_code: c }))} 
                                                className={`h-12 w-12 rounded-full transition-all duration-300 border-4 ${form.color_code === c ? "border-white scale-110 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"}`} 
                                                style={{ backgroundColor: c }} 
                                            />
										))}
									</div>
								</div>
							</div>
							<button 
                                type="submit" 
                                disabled={createMut.isPending || updateMut.isPending}
                                className="w-full h-14 bg-primary text-white rounded-full text-base font-bold hover:bg-primary/90 transition-all shadow-[0_8px_20px_rgba(5,150,105,0.2)] hover-lift disabled:opacity-50"
                            >
								{editingCat ? "Update Category" : "Create Category"}
							</button>
						</form>
					</div>
				</div>, document.body
			)}
		</div>
	);
};

export default Categories;
