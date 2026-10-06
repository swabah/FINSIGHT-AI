import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ConfirmModal from "../components/ConfirmModal";
import { Label } from "@/components/ui/label";
import {
	FiDownload,
	FiEdit2,
	FiPlus,
	FiSearch,
	FiTrash2,
	FiX,
    FiCreditCard,
    FiList
} from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createTransaction,
	deleteTransaction,
	fetchCategories,
	fetchTransactions,
	updateTransaction,
} from "../services/transactionService";
import { getAuthData } from "../services/authService";

interface Category {
	_id: string;
	name: string;
    color_code?: string;
}

interface Transaction {
	_id: string;
	amount: number;
	type: "income" | "expense";
	category: Category | string;
	date: string;
	description?: string;
}

interface TransactionFormData {
	amount: string;
	category: string;
	type: "income" | "expense";
	date: string;
	description: string;
}

const TransactionsList = () => {
    const auth = getAuthData();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [form, setForm] = useState<TransactionFormData>({
        amount: "",
        category: "",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        description: "",
    });
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

    const categories: Category[] = catData?.data || [];

    // Mutations
    const deleteMut = useMutation({
        mutationFn: (id: string) => deleteTransaction(id, auth?.token || ""),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            setConfirmDeleteId(null);
        },
    });

    const saveMut = useMutation({
        mutationFn: (data: Omit<TransactionFormData, "amount"> & { amount: number }) =>
            editingTx
                ? updateTransaction(editingTx._id, data, auth?.token || "")
                : createTransaction(data, auth?.token || ""),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            closeModal();
        },
        onError: (err: Error) => setError(err.message),
    });

    // Handlers
    const openAdd = () => {
        setEditingTx(null);
        setForm({
            amount: "",
            category: "",
            type: "expense",
            date: new Date().toISOString().split("T")[0],
            description: "",
        });
        setError(null);
        setModalOpen(true);
    };

    const openEdit = (t: Transaction) => {
        setEditingTx(t);
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
        setError(null);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.category) return setError("Please select a category");
        saveMut.mutate({ ...form, amount: parseFloat(form.amount) });
    };

    const filtered = useMemo(() => {
        const list: Transaction[] = txData?.data || [];
        if (!search) return list;
        const s = search.toLowerCase();
        return list.filter((t: Transaction) =>
            t.description?.toLowerCase().includes(s) ||
            (typeof t.category === "object" && t.category?.name?.toLowerCase().includes(s))
        );
    }, [txData, search]);

    if (txLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 opacity-80 animate-fade-up">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse mb-6">
                    <FiList size={32} />
                </div>
                <p className="text-sm font-medium tracking-wide text-muted-foreground">Loading history...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 relative">
            <ConfirmModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={() => confirmDeleteId && deleteMut.mutate(confirmDeleteId)}
                title="Delete Transaction"
                message="Are you sure you want to permanently remove this transaction from your records?"
                confirmText="Delete"
                variant="danger"
            />

            <div className="relative z-10 space-y-8 animate-fade-up">
                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-normal tracking-tight text-foreground">
                            Transaction <span className="font-semibold">History</span>
                        </h1>
                        <p className="text-muted-foreground text-sm mt-2 font-medium">Review, add, and manage your financial records.</p>
                    </div>
                </div>

                {/* ── Toolbar ── */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center p-6 modern-card">
                    <div className="flex-1 max-w-lg relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <FiSearch size={18} />
                        </div>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search descriptions or categories..."
                            className="w-full h-12 pl-12 pr-4 bg-secondary rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:opacity-50 border-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" className="h-12 px-6 bg-secondary rounded-full text-sm font-semibold hover:bg-zinc-200 transition-all flex items-center gap-2 text-foreground">
                            <FiDownload size={16} /> Export
                        </button>
                        <button
                            type="button"
                            onClick={openAdd}
                            className="h-12 px-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-[0_8px_20px_rgba(5,150,105,0.2)] hover-lift"
                        >
                            <FiPlus size={16} /> Add Entry
                        </button>
                    </div>
                </div>

                {/* ── Ledger List View ── */}
                <div className="modern-card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h3 className="text-lg font-bold tracking-tight">All Transactions</h3>
                        <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-muted-foreground">
                            <FiList size={14} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        {filtered.length === 0 ? (
                            <div className="p-16 text-center text-sm text-muted-foreground font-medium">
                                No transactions found matching your criteria.
                            </div>
                        ) : (
                            filtered.map((t: Transaction) => (
                                <div key={t._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-4 sm:px-6 hover:bg-secondary rounded-2xl transition-colors group cursor-default gap-3 sm:gap-0 border-b border-zinc-100 sm:border-none last:border-none">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm ${
                                            t.type === "income" ? "text-primary bg-primary/10" : "text-zinc-600 bg-zinc-100"
                                        }`}>
                                            <FiCreditCard size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-base font-bold text-foreground leading-none mb-2 truncate group-hover:text-primary transition-colors">{t.description || "Uncategorized Transaction"}</p>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[10px] font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded-full inline-block truncate max-w-[100px]">
                                                    {typeof t.category === "object" ? t.category.name : t.category}
                                                </span>
                                                <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                                                    {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-16 sm:pl-0">
                                        <div className="text-left sm:text-right">
                                            <span className={`text-lg sm:text-base font-bold tracking-tight ${t.type === "income" ? "text-primary" : "text-foreground"}`}>
                                                {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(t)} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white border border-zinc-100 text-muted-foreground hover:text-foreground shadow-sm rounded-full transition-all"><FiEdit2 size={14} /></button>
                                            <button onClick={() => setConfirmDeleteId(t._id)} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white border border-zinc-100 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 shadow-sm rounded-full transition-all"><FiTrash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Add/Edit Modal ── */}
            {modalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden animate-fade-up">
                        <div className="p-8 pb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                {editingTx ? "Edit Entry" : "New Entry"}
                            </h2>
                            <button onClick={closeModal} className="text-muted-foreground hover:text-foreground w-10 h-10 flex items-center justify-center transition-all bg-[#f3f4f6] rounded-full"><FiX size={18} /></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-8 pt-2 space-y-6">
                            {error && <div className="p-4 bg-rose-50 text-rose-500 text-sm rounded-2xl text-center font-bold">{error}</div>}

                            <div className="bg-[#f3f4f6] p-1.5 rounded-full flex">
                                {(["expense", "income"] as const).map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, type }))}
                                        className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${form.type === type ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={form.amount}
                                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                        className="w-full h-14 px-5 bg-[#f3f4f6] rounded-[20px] text-base font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Category</label>
                                        <select
                                            value={form.category}
                                            required
                                            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                            className="w-full h-14 bg-[#f3f4f6] rounded-[20px] px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold border-none"
                                        >
                                            <option value="">Select...</option>
                                            {categories.map((c: Category) => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={form.date}
                                            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                            className="w-full h-14 bg-[#f3f4f6] rounded-[20px] px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold border-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        className="w-full p-5 bg-[#f3f4f6] rounded-[20px] text-sm h-28 resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium border-none"
                                        placeholder="Add more details..."
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={saveMut.isPending}
                                className="w-full h-14 bg-primary text-white rounded-full text-base font-bold hover:bg-primary/90 transition-all flex items-center justify-center shadow-[0_8px_20px_rgba(5,150,105,0.2)] hover-lift disabled:opacity-50"
                            >
                                {saveMut.isPending ? "Processing..." : editingTx ? "Update Transaction" : "Save Transaction"}
                            </button>
                        </form>
                    </div>
                </div>, document.body
            )}
        </div>
    );
};

export default TransactionsList;
