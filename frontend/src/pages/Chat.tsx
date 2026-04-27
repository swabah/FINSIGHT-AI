import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
	sendChatMessage,
	fetchConversations,
	fetchConversationMessages,
	confirmDelete,
	updateConversationTitle,
	deleteChatConversation,
} from "../services/chatService";
import { getAuthData } from "../services/authService";
import type {
	RichMessage,
	TransactionRow,
	ChatHistoryItem,
	Conversation,
} from "../types/chat";
import {
	FiSend,
	FiUser,
	FiLoader,
	FiPieChart,
	FiActivity,
	FiClock,
	FiEdit2,
	FiTrash2,
	FiPlus,
	FiMessageSquare,
	FiCpu,
	FiCheck,
} from "react-icons/fi";
import ExpensePieChart from "@/components/ExpensePieChart";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function historyToMessages(items: ChatHistoryItem[]): RichMessage[] {
	const out: RichMessage[] = [];
	items.forEach((item) => {
		out.push({
			id: `${item._id}-user`,
			sender: "user",
			type: "text",
			text: item.query,
			timestamp: item.timestamp,
		});
		out.push({
			id: `${item._id}-ai`,
			sender: "ai",
			type: item.message_type || "text",
			text: item.bot_response,
			actionData: item.action_data ?? undefined,
			timestamp: item.timestamp,
		});
	});
	return out;
}

function formatRelativeTime(iso: string) {
	const diff = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return "Just now";
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	return new Date(iso).toLocaleDateString();
}

// ─── Component ────────────────────────────────────────────────────────────────

const Chat: React.FC = () => {
	const auth = getAuthData();
	const queryClient = useQueryClient();

	// Active conversation state
	const [activeConvId, setActiveConvId] = useState<string | null>(null);
	const [messages, setMessages] = useState<RichMessage[]>([]);
	const [input, setInput] = useState("");
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [editingConvId, setEditingConvId] = useState<string | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [loadingMessages, setLoadingMessages] = useState(false);

	const bottomRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	// ── Fetch conversation list ──────────────────────────────────────────────
	const { data: convData, isLoading: convLoading } = useQuery({
		queryKey: ["conversations"],
		queryFn: () => fetchConversations(auth?.token || ""),
		enabled: !!auth?.token,
		refetchOnWindowFocus: false,
	});

	const conversations: Conversation[] = convData?.data ?? [];

	// ── Load messages when active conversation changes ───────────────────────
	useEffect(() => {
		if (!activeConvId || !auth?.token) return;
		setLoadingMessages(true);
		fetchConversationMessages(auth.token, activeConvId)
			.then((res) => setMessages(historyToMessages(res.data)))
			.catch(() => setMessages([]))
			.finally(() => setLoadingMessages(false));
	}, [activeConvId, auth?.token]);

	// ── Auto-scroll ──────────────────────────────────────────────────────────
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// ── Send message ─────────────────────────────────────────────────────────
	const chatMutation = useMutation({
		mutationFn: (msg: string) =>
			sendChatMessage(auth?.token || "", {
				query: msg,
				history: messages.slice(-10).map((m) => ({
					role: m.sender === "user" ? "user" : "ai",
					text: m.text,
				})),
				conversation_id: activeConvId ?? undefined,
			}),
		onSuccess: (res) => {
			const d = res.data;

			// If this was a new conversation, set its ID
			if (!activeConvId) {
				setActiveConvId(d.conversation_id);
			}

			const aiMsg: RichMessage = {
				id: `ai-${Date.now()}`,
				sender: "ai",
				type: d.message_type,
				text: d.response,
				actionData: d.action_data ?? undefined,
				timestamp: d.timestamp,
			};
			setMessages((prev) => [...prev, aiMsg]);

			// Refresh conversation list sidebar
			queryClient.invalidateQueries({ queryKey: ["conversations"] });

			if (d.message_type === "action_success") {
				queryClient.invalidateQueries({ queryKey: ["transactions"] });
				queryClient.invalidateQueries({ queryKey: ["analytics"] });
			}
		},
		onError: () => {
			setMessages((prev) => [
				...prev,
				{
					id: `err-${Date.now()}`,
					sender: "ai",
					type: "text",
					text: "Sorry, something went wrong. Please try again.",
					timestamp: new Date().toISOString(),
				},
			]);
		},
	});

	const send = (text: string) => {
		if (!text.trim() || chatMutation.isPending) return;
		const userMsg: RichMessage = {
			id: `user-${Date.now()}`,
			sender: "user",
			type: "text",
			text,
			timestamp: new Date().toISOString(),
		};
		setMessages((prev) => [...prev, userMsg]);
		chatMutation.mutate(text);
		setInput("");
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			send(input);
		}
	};

	// ── Start new conversation ────────────────────────────────────────────────
	const startNewConversation = () => {
		setActiveConvId(null);
		setMessages([]);
		setInput("");
		inputRef.current?.focus();
	};

	// ── Switch to existing conversation ──────────────────────────────────────
	const openConversation = (conv: Conversation) => {
		if (conv._id === activeConvId) return;
		setActiveConvId(conv._id);
		setMessages([]);
	};

	// ── Delete confirmation ───────────────────────────────────────────────────
	const deleteMutation = useMutation({
		mutationFn: ({ txId, logId }: { txId: string; logId?: string }) =>
			confirmDelete(auth?.token || "", txId, logId),
		onMutate: ({ txId }) => setDeletingId(txId),
		onSuccess: (result, { txId }) => {
			setDeletingId(null);
			setMessages((prev) =>
				prev.map((m) =>
					m.type === "confirm_delete" &&
					m.actionData?.confirmDelete?.candidates.some((c) => c._id === txId)
						? {
								...m,
								type: "action_success" as const,
								text: `✅ ${result.message}`,
								actionData: undefined,
							}
						: m,
				),
			);
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
		},
	});

	// ── Rename Conversation ───────────────────────────────────────────────────
	const renameConvMutation = useMutation({
		mutationFn: ({ id, title }: { id: string; title: string }) =>
			updateConversationTitle(auth?.token || "", id, title),
		onSuccess: () => {
			setEditingConvId(null);
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
		},
	});

	// ── Delete Conversation ───────────────────────────────────────────────────
	const deleteConvMutation = useMutation({
		mutationFn: (id: string) => deleteChatConversation(auth?.token || "", id),
		onSuccess: (_, deletedId) => {
			if (activeConvId === deletedId) {
				startNewConversation();
			}
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
		},
	});

	const handleRenameSubmit = (e: React.FormEvent, convId: string) => {
		e.preventDefault();
		if (editTitle.trim()) {
			renameConvMutation.mutate({ id: convId, title: editTitle.trim() });
		}
	};

	const isNewConversation = !activeConvId && messages.length === 0;

	return (
		<div className="flex h-full overflow-hidden animate-in fade-in duration-500 relative bg-background">
			{/* Gradient Background Effect */}
			<div className="echo-gradient-bg" />

			{/* ── Main Active Chat Area (Center) ── */}
			<div className="flex-1 flex flex-col min-w-0 relative z-10">
				{/* Top Bar */}
				<header className="h-14 px-6 border-b border-border flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-md">
					<div className="flex items-center gap-2 min-w-0">
						<span className="text-sm font-semibold truncate text-foreground">
							{activeConvId
								? (conversations.find((c) => c._id === activeConvId)?.title ??
									"Conversation")
								: "FinSight AI Connect"}
						</span>
					</div>
					<div className="flex items-center gap-3 shrink-0">
						<span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-border rounded-full shadow-sm text-xs text-foreground font-medium">
							<div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
							Echo Model Active
						</span>
						{/* Mobile: New Chat Button */}
						<button
							type="button"
							onClick={startNewConversation}
							className="lg:hidden flex items-center gap-1 h-8 px-3 bg-white border border-border text-foreground hover:bg-accent rounded-full text-xs font-semibold transition-all shadow-sm"
						>
							<FiPlus size={12} /> New
						</button>
					</div>
				</header>

				{/* Messages Area */}
				<div className="flex-1 overflow-y-auto px-4 md:px-8 pb-36 pt-6">
					{/* Empty state */}
					{isNewConversation ? (
						<EmptyState onSuggestion={send} />
					) : loadingMessages ? (
						<div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground animate-pulse">
							<FiLoader size={24} />
							<p className="text-sm">Loading conversation...</p>
						</div>
					) : (
						<div className="max-w-3xl mx-auto space-y-6">
							{messages
								.filter((m) => m.sender === "user" || m.sender === "ai")
								.map((m) => (
									<MessageBubble
										key={m.id}
										message={m}
										onDelete={(txId, logId) =>
											deleteMutation.mutate({ txId, logId })
										}
										isDeleting={deleteMutation.isPending && deletingId !== null}
									/>
								))}
							{chatMutation.isPending && <ThinkingBubble />}
							<div ref={bottomRef} className="h-4" />
						</div>
					)}
				</div>

				{/* Input Bar — Floating Pill */}
				<div className="absolute bottom-0 inset-x-0 p-6 pt-12 bg-gradient-to-t from-background via-background/80 to-transparent z-20 pointer-events-none">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							send(input);
						}}
						className="max-w-4xl mx-auto bg-white border border-border/80 rounded-[2rem] shadow-lg shadow-black/5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all overflow-hidden pointer-events-auto flex items-center pl-6 pr-2 py-2 gap-3"
					>
						<textarea
							ref={inputRef}
							rows={1}
							value={input}
							onKeyDown={handleKeyDown}
							onChange={(e) => setInput(e.target.value)}
							placeholder={
								activeConvId
									? "Continue chatting..."
									: "Start your request, and let FinSight handle everything"
							}
							className="flex-1 bg-transparent outline-none resize-none text-sm font-medium placeholder:text-muted-foreground/60 py-2 h-10 max-h-32"
						/>
						<button
							type="submit"
							disabled={!input.trim() || chatMutation.isPending}
							className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-primary text-white hover:bg-lime-500 transition-all shadow-sm shadow-primary/20 disabled:opacity-30 disabled:cursor-not-allowed"
						>
							<FiSend size={15} className="-ml-0.5" />
						</button>
					</form>
				</div>
			</div>

			{/* ── Right: Conversation History Panel ── */}
			<aside className="hidden lg:flex flex-col w-[300px] h-full bg-white/70 backdrop-blur-xl border-l border-border shrink-0 z-10 shadow-sm">
				{/* Top CTA */}
				<div className="p-5 border-b border-border/60">
					<button
						type="button"
						onClick={startNewConversation}
						className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-white border border-border shadow-sm hover:border-primary/30 hover:text-primary text-foreground text-sm font-semibold transition-all hover:shadow-[0_4px_12px_rgba(132,204,22,0.1)]"
					>
						<FiPlus size={16} /> New Chat
					</button>
				</div>

				<div className="px-5 pt-4 pb-2 flex items-center justify-between opacity-70">
					<span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
						Chat History
					</span>
				</div>

				{/* Conversation List */}
				<div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
					{convLoading ? (
						<div className="flex items-center justify-center py-10 text-muted-foreground animate-pulse gap-2">
							<FiLoader size={14} />{" "}
							<span className="text-xs font-medium">Loading history...</span>
						</div>
					) : conversations.length === 0 ? (
						<div className="py-10 px-4 text-center">
							<div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
								<FiMessageSquare size={18} />
							</div>
							<p className="text-xs font-medium text-foreground">
								No past chats.
							</p>
							<p className="text-[11px] text-muted-foreground mt-1">
								Start a conversation!
							</p>
						</div>
					) : (
						conversations.map((conv) => (
							<div
								key={conv._id}
								className={`group relative w-full text-left px-4 py-3.5 rounded-2xl transition-all border ${
									activeConvId === conv._id
										? "bg-white border-primary shadow-[0_2px_10px_rgba(132,204,22,0.1)]"
										: "bg-transparent border-transparent hover:bg-white/60 hover:border-border/60"
								}`}
							>
								{editingConvId === conv._id ? (
									<form
										onSubmit={(e) => handleRenameSubmit(e, conv._id)}
										className="flex items-center gap-2"
									>
										<input
											autoFocus
											value={editTitle}
											onChange={(e) => setEditTitle(e.target.value)}
											onBlur={() => setEditingConvId(null)}
											className="w-full text-[13px] font-semibold bg-background border border-border rounded px-2 py-1 outline-none focus:border-primary text-foreground"
										/>
									</form>
								) : (
									<button
										type="button"
										onClick={() => openConversation(conv)}
										className="w-full text-left cursor-pointer"
									>
										<p
											className={`text-[13px] pr-12 font-semibold truncate leading-tight ${activeConvId === conv._id ? "text-primary" : "text-foreground"}`}
										>
											{conv.title}
										</p>
										<div className="flex items-center gap-2 mt-1.5 opacity-80">
											<span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
												{formatRelativeTime(conv.updatedAt)}
											</span>
										</div>
									</button>
								)}

								{/* Hover Actions */}
								{!editingConvId && (
									<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												setEditTitle(conv.title);
												setEditingConvId(conv._id);
											}}
											className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
											title="Rename"
										>
											<FiEdit2 size={12} />
										</button>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												if (
													window.confirm(
														"Are you sure you want to delete this conversation?",
													)
												) {
													deleteConvMutation.mutate(conv._id);
												}
											}}
											className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
											disabled={deleteConvMutation.isPending}
											title="Delete"
										>
											<FiTrash2 size={12} />
										</button>
									</div>
								)}
							</div>
						))
					)}
				</div>
			</aside>
		</div>
	);
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const EmptyState = ({
	onSuggestion,
}: {
	onSuggestion: (s: string) => void;
}) => {
	const auth = getAuthData();
	const firstName = auth?.user?.username?.split(" ")[0] || "Trader";

	const actionCards = [
		{
			icon: <FiActivity className="text-primary" size={20} />,
			title: "Log Transaction",
			desc: "Instantly record expenses or income perfectly categorized.",
			prompt: "I spent ₹500 on Dinner last night",
		},
		{
			icon: <FiPieChart className="text-primary" size={20} />,
			title: "Analyze Spending",
			desc: "Get deep insights into your cash flow trends instantly.",
			prompt: "What is my biggest expense category this month?",
		},
		{
			icon: <FiClock className="text-primary" size={20} />,
			title: "Past Records",
			desc: "Rapidly retrieve statements or specific tabular queries.",
			prompt: "Show me my last 5 transaction records in a table",
		},
	];

	return (
		<div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12 px-4 animate-fade-up">
			{/* Center Hero Icon */}
			<div className="relative">
				<div className="absolute inset-0 bg-primary opacity-20 blur-3xl rounded-full scale-150" />
				<div className="relative w-20 h-20 bg-white shadow-xl shadow-primary/10 rounded-full flex items-center justify-center border-4 border-white">
					<FiActivity size={32} className="text-primary" />
				</div>
			</div>

			<div className="space-y-4">
				<h2 className="text-4xl font-semibold tracking-tight text-foreground">
					Welcome, {firstName}
				</h2>
				<p className="text-sm font-medium text-muted-foreground max-w-md mx-auto">
					Start by scripting a financial task, and let the smart ledger handle
					your bookkeeping. Not sure where to begin?
				</p>
			</div>

			{/* Large Action Cards exactly like 'EchoAI' */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
				{actionCards.map((c) => (
					<button
						type="button"
						key={c.title}
						onClick={() => onSuggestion(c.prompt)}
						className="p-6 text-left bg-white border border-border/60 hover:border-primary/30 rounded-2xl transition-all hover:shadow-[0_8px_30px_rgba(132,204,22,0.12)] hover:-translate-y-1 group flex flex-col gap-3 min-h-[160px]"
					>
						<div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
							{c.icon}
						</div>
						<div>
							<h3 className="font-bold tracking-tight text-sm text-foreground mb-1">
								{c.title}
							</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">
								{c.desc}
							</p>
						</div>
					</button>
				))}
			</div>
		</div>
	);
};

const ThinkingBubble = () => (
	<div className="flex gap-4 max-w-3xl mx-auto">
		<div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white shrink-0">
			<FiCpu size={14} />
		</div>
		<div className="bg-card border border-border px-4 py-3 rounded-xl rounded-tl-none text-sm italic text-muted-foreground flex items-center gap-2">
			<span className="flex gap-1">
				<span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
				<span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
				<span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
			</span>
			Thinking...
		</div>
	</div>
);

const MessageBubble = ({
	message: m,
	onDelete,
	isDeleting,
}: {
	message: RichMessage;
	onDelete: (txId: string, logId: string) => void;
	isDeleting: boolean;
}) => {
	const isAi = m.sender === "ai";
	return (
		<div
			className={`flex max-w-3xl mx-auto ${isAi ? "justify-start" : "justify-end"}`}
		>
			<div
				className={`flex gap-3 max-w-[85%] ${isAi ? "flex-row" : "flex-row-reverse"}`}
			>
				{/* Avatar */}
				<div
					className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm border ${isAi ? "bg-primary text-white border-primary/20" : "bg-white text-foreground border-border"}`}
				>
					{isAi ? <FiActivity size={14} /> : <FiUser size={14} />}
				</div>

				{/* Content */}
				<div className="space-y-2 min-w-0">
					{/* Text bubble powered by Markdown */}
					<div
						className={`px-5 py-3.5 rounded-[1.25rem] text-[13px] font-medium leading-relaxed shadow-sm ${
							isAi
								? "bg-white border border-border/60 rounded-tl-sm text-foreground prose prose-sm max-w-none prose-p:my-1 prose-headings:font-bold prose-headings:mb-2 prose-headings:text-foreground prose-strong:font-bold prose-ul:my-1 prose-li:my-0.5"
								: "bg-foreground text-background rounded-tr-sm"
						}`}
					>
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
					</div>

					{/* Rich: transaction table */}
					{isAi && m.type === "table" && m.actionData?.transactions && (
						<TxTable rows={m.actionData.transactions} />
					)}

					{/* Rich: confirm delete */}
					{isAi &&
						m.type === "confirm_delete" &&
						m.actionData?.confirmDelete && (
							<DeleteConfirmCard
								rows={m.actionData.confirmDelete.candidates}
								onConfirm={(txId) => onDelete(txId, m.id)}
								loading={isDeleting}
							/>
						)}

					{/* Rich: action success badge */}
					{isAi && m.type === "action_success" && (
						<span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
							<FiCheck size={10} strokeWidth={3} /> Done
						</span>
					)}

					{/* Rich: chart visualization */}
					{isAi && m.type === "chart" && m.actionData?.charts && (
						<div className="mt-4 flex flex-col md:flex-row gap-4 w-full">
							{m.actionData.charts.map((chart, idx) => (
								<div key={idx} className="flex-1 p-4 bg-white border border-border/60 rounded-2xl shadow-sm min-h-[300px]">
									<h4 className="text-sm font-bold text-center mb-4 text-foreground">{chart.title}</h4>
									<ExpensePieChart data={chart.data} />
								</div>
							))}
						</div>
					)}

					{/* Timestamp */}
					<p className="text-[10px] text-muted-foreground/50 px-1">
						{new Date(m.timestamp).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</p>
				</div>
			</div>
		</div>
	);
};

const TxTable = ({ rows }: { rows: TransactionRow[] }) => (
	<div className="overflow-hidden rounded-lg border border-border bg-card text-xs w-full">
		<table className="w-full text-left">
			<thead>
				<tr className="bg-accent/50 border-b border-border">
					{["Date", "Category", "Description", "Amount"].map((h) => (
						<th
							key={h}
							className="px-4 py-2 font-bold text-muted-foreground uppercase tracking-wider text-[10px]"
						>
							{h}
						</th>
					))}
				</tr>
			</thead>
			<tbody className="divide-y divide-border">
				{rows.map((t) => (
					<tr key={t._id} className="hover:bg-accent/20 transition-colors">
						<td className="px-4 py-2.5 text-muted-foreground">
							{new Date(t.date).toLocaleDateString("en-IN", {
								month: "short",
								day: "2-digit",
							})}
						</td>
						<td className="px-4 py-2.5 font-medium text-primary">
							{t.category}
						</td>
						<td className="px-4 py-2.5 truncate max-w-[130px]">
							{t.description}
						</td>
						<td
							className={`px-4 py-2.5 font-medium text-right ${t.type === "income" ? "text-emerald-500" : "text-foreground"}`}
						>
							{t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

const DeleteConfirmCard = ({
	rows,
	onConfirm,
	loading,
}: {
	rows: TransactionRow[];
	onConfirm: (id: string) => void;
	loading: boolean;
}) => (
	<div className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 space-y-3">
		<p className="text-xs font-medium text-rose-400">
			Please confirm which transaction to delete:
		</p>
		{rows.map((t) => (
			<div
				key={t._id}
				className="flex items-center justify-between p-3 bg-card border border-border rounded-lg gap-4"
			>
				<div className="min-w-0">
					<p className="text-sm font-medium truncate">{t.description}</p>
					<p className="text-[10px] text-muted-foreground mt-0.5">
						₹{t.amount} · {new Date(t.date).toLocaleDateString()}
					</p>
				</div>
				<button
					onClick={() => onConfirm(t._id)}
					disabled={loading}
					className="shrink-0 h-8 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-all disabled:opacity-50"
				>
					Delete
				</button>
			</div>
		))}
	</div>
);

// Note: Custom renderText was replaced by proper ReactMarkdown implementation

export default Chat;
