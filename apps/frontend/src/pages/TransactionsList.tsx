import { useMemo, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { Label } from "@/components/ui/label";
import {
	FiDownload,
	FiEdit2,
	FiPlus,
	FiSearch,
	FiTrash2,
	FiX,
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
    const { data: txData } = useQuery({
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

    return (
        <div className="space-y-6 pb-20">
            <ConfirmModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={() => confirmDeleteId && deleteMut.mutate(confirmDeleteId)}
                title="Delete Transaction"
                message="Are you sure you want to permanently remove this transaction from your records?"
                confirmText="Delete"
                variant="danger"
            />

            {/* ── Toolbar ── */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center p-5 bg-card border border-border/60 rounded-2xl shadow-sm">
                <div className="flex-1 max-w-lg relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <FiSearch size={16} />
                    </div>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by description or category..."
                        className="w-full h-11 pl-11 pr-4 bg-white border border-border/60 rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-medium text-foreground placeholder:opacity-40 shadow-sm shadow-black/5"
                    />
                </div>
                <div className="flex gap-2">
                    <button type="button" className="h-11 px-5 bg-white border border-border/60 rounded-xl text-xs font-semibold hover:border-border transition-all flex items-center gap-2 text-foreground shadow-sm shadow-black/5">
                        <FiDownload size={14} /> Export
                    </button>
                    <button
                        type="button"
                        onClick={openAdd}
                        className="h-11 px-6 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm shadow-primary/20"
                    >
                        <FiPlus size={14} /> Add Transaction
                    </button>
                </div>
            </div>

            {/* ── Ledger Table ── */}
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-accent/40 border-b border-border/60 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 bg-white">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-sm text-muted-foreground font-medium">
                                        No transactions found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((t: Transaction) => (
                                    <tr key={t._id} className="group hover:bg-accent/40 transition-colors">
                                        <td className="px-6 py-4 text-sm font-semibold text-foreground">
                                            {new Date(t.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <span className="px-2 py-0.5 bg-accent/60 border border-border rounded font-bold text-muted-foreground">
                                                {typeof t.category === "object" ? t.category.name : t.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground font-medium truncate max-w-[200px]">{t.description || "—"}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-sm font-bold ${t.type === "income" ? "text-primary" : "text-foreground"}`}>
                                                {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(t)} className="p-2 bg-white text-muted-foreground hover:text-foreground border border-border shadow-sm hover:border-border/80 rounded-lg transition-all"><FiEdit2 size={13} /></button>
                                                <button onClick={() => setConfirmDeleteId(t._id)} className="p-2 bg-white text-muted-foreground hover:text-red-500 border border-border shadow-sm hover:bg-red-500/5 hover:border-red-500/30 rounded-lg transition-all"><FiTrash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Add/Edit Modal ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-card border border-border/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-up">
                        <div className="p-6 border-b border-border/50 flex items-center justify-between">
                            <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                {editingTx ? "Edit Transaction" : "New Transaction"}
                            </h2>
                            <button onClick={closeModal} className="text-muted-foreground hover:text-foreground p-1 transition-all hover:bg-accent rounded-full"><FiX size={18} /></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded text-center font-medium">{error}</div>}

                            <div className="bg-input p-1 rounded flex border border-border">
                                {(["expense", "income"] as const).map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, type }))}
                                        className={`flex-1 py-2 text-xs font-medium rounded transition-all ${form.type === type ? "bg-primary text-white shadow" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount (₹)</Label>
                                    <input
                                        type="number"
                                        required
                                        value={form.amount}
                                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                        className="w-full h-11 px-4 bg-input border border-border rounded text-lg font-medium outline-none focus:border-primary/50 transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</Label>
                                        <select
                                            value={form.category}
                                            required
                                            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                            className="w-full h-11 bg-input border border-border rounded px-3 text-sm outline-none focus:border-primary/50 transition-all"
                                        >
                                            <option value="">Select...</option>
                                            {categories.map((c: Category) => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</Label>
                                        <input
                                            type="date"
                                            required
                                            value={form.date}
                                            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                            className="w-full h-11 bg-input border border-border rounded px-4 text-sm outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</Label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        className="w-full p-4 bg-input border border-border rounded text-sm h-24 resize-none outline-none focus:border-primary/50 transition-all"
                                        placeholder="Add more details..."
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={saveMut.isPending}
                                className="w-full h-12 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all flex items-center justify-center shadow-sm"
                            >
                                {saveMut.isPending ? "Processing..." : editingTx ? "Update Transaction" : "Save Transaction"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionsList;
