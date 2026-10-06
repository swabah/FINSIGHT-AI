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
	FiX,
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

	const startNewConversation = () => {
		setActiveConvId(null);
		setMessages([]);
		setInput("");
		inputRef.current?.focus();
	};

	const openConversation = (conv: Conversation) => {
		if (conv._id === activeConvId) return;
		setActiveConvId(conv._id);
		setMessages([]);
	};

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

	const renameConvMutation = useMutation({
		mutationFn: ({ id, title }: { id: string; title: string }) =>
			updateConversationTitle(auth?.token || "", id, title),
		onSuccess: () => {
			setEditingConvId(null);
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
		},
	});

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
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

	return (
		<div className="flex h-[calc(100vh-64px)] md:h-full overflow-hidden animate-in fade-in duration-500 relative bg-[#eef0f3]">
			{/* Glow Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Floating History Button mapped to Global Mobile Navbar */}
            <button 
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden fixed top-3 right-20 z-[60] w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all shadow-sm"
            >
                <FiMessageSquare size={18} />
            </button>

			{/* ── Main Active Chat Area (Center) ── */}
			<div className="flex-1 flex flex-col min-w-0 relative z-10 pt-4 lg:pt-10">
				
				{/* Messages Area */}
				<div className="flex-1 overflow-y-auto px-4 md:px-8 pb-36">
					{/* Empty state */}
					{isNewConversation ? (
						<EmptyState onSuggestion={send} />
					) : loadingMessages ? (
						<div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground animate-pulse">
							<FiLoader size={24} />
							<p className="text-sm font-medium">Loading conversation...</p>
						</div>
					) : (
						<div className="max-w-3xl mx-auto space-y-8">
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

				{/* Input Bar */}
				<div className="absolute bottom-0 inset-x-0 pt-10 pb-4 sm:pb-6 px-4 md:px-8 z-20 pointer-events-none bg-gradient-to-t from-[#eef0f3] via-[#eef0f3]/90 to-transparent">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							send(input);
						}}
						className="max-w-4xl mx-auto bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center pl-4 sm:pl-6 pr-1.5 sm:pr-2 py-1.5 sm:py-2 gap-2 sm:gap-3 pointer-events-auto border border-zinc-100"
					>
						<textarea
							ref={inputRef}
							rows={1}
							value={input}
							onKeyDown={handleKeyDown}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Start Conversation"
							className="flex-1 bg-transparent outline-none resize-none text-[13px] sm:text-sm font-medium placeholder:text-muted-foreground/60 py-2 h-[36px] sm:h-[42px]"
						/>
						<button
							type="submit"
							disabled={!input.trim() || chatMutation.isPending}
							className="h-[36px] w-[36px] sm:h-[42px] sm:w-[42px] shrink-0 flex items-center justify-center rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
						>
							<FiSend className="-ml-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4" />
						</button>
					</form>
				</div>
			</div>

			{/* ── Right: Conversation History Panel ── */}
			{/* Mobile Backdrop */}
			{mobileSidebarOpen && (
				<button 
					type="button"
					onClick={() => setMobileSidebarOpen(false)}
					className="lg:hidden fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm cursor-default"
				/>
			)}
			
			<aside className={`fixed lg:relative top-0 right-0 h-full lg:h-[calc(100%-2rem)] w-[320px] bg-white lg:rounded-[32px] shadow-2xl lg:shadow-[0_8px_30px_rgb(0,0,0,0.03)] shrink-0 z-50 lg:z-10 flex flex-col p-2 my-0 lg:my-4 mr-0 lg:mr-4 transition-transform duration-300 ${mobileSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
				{/* Mobile close button */}
				<div className="lg:hidden flex justify-end p-2 pb-0">
					<button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-full bg-secondary text-foreground"><FiX size={16} /></button>
				</div>
				
				{/* Top CTA */}
				<div className="p-4 pt-2 lg:pt-4">
					<button
						type="button"
						onClick={() => { startNewConversation(); setMobileSidebarOpen(false); }}
						className="w-full h-12 flex items-center justify-center gap-2 rounded-full bg-primary text-white shadow-[0_8px_20px_rgba(5,150,105,0.2)] hover:shadow-[0_12px_25px_rgba(5,150,105,0.3)] hover:-translate-y-0.5 text-sm font-bold transition-all"
					>
						<FiPlus size={16} /> New Chat
					</button>
				</div>

				<div className="px-5 pt-2 pb-2 flex items-center justify-between opacity-70">
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
						</div>
					) : (
						conversations.map((conv) => (
							<div
								key={conv._id}
								className={`group relative w-full text-left px-4 py-3.5 rounded-2xl transition-all border ${
									activeConvId === conv._id
										? "bg-white border-primary shadow-[0_2px_10px_rgba(132,204,22,0.1)]"
										: "bg-transparent border-transparent hover:bg-zinc-50"
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
											className="w-full text-[13px] font-bold bg-background border border-border rounded px-2 py-1 outline-none focus:border-primary text-foreground"
										/>
									</form>
								) : (
									<button
										type="button"
										onClick={() => { openConversation(conv); setMobileSidebarOpen(false); }}
										className="w-full text-left cursor-pointer"
									>
										<p
											className={`text-[13px] pr-12 font-bold truncate leading-tight ${activeConvId === conv._id ? "text-primary" : "text-foreground"}`}
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
									<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm px-1 py-1 rounded-lg">
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
	const username = auth?.user?.username || "there";

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
		<div className="max-w-4xl mx-auto flex flex-col items-center justify-start sm:justify-center min-h-[60vh] text-center space-y-6 sm:space-y-12 px-2 sm:px-4 animate-fade-up pt-4 sm:pt-10">
			{/* Center Hero Icon */}
			<div className="w-16 h-16 sm:w-24 sm:h-24 bg-white shadow-[0_12px_40px_rgba(5,150,105,0.15)] rounded-full flex items-center justify-center border-4 border-white">
                <FiActivity className="text-primary w-6 h-6 sm:w-8 sm:h-8" />
            </div>

			<div className="space-y-2 sm:space-y-4">
				<h2 className="text-2xl sm:text-4xl font-heading font-medium tracking-tight text-foreground">
					Welcome, {username}
				</h2>
				<p className="text-[13px] sm:text-sm font-medium text-muted-foreground max-w-md mx-auto">
					Start by scripting a financial task, and let the smart ledger handle
					your bookkeeping. Not sure where to begin?
				</p>
			</div>

			{/* Large Action Cards exactly like 'EchoAI' */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5 w-full">
				{actionCards.map((c) => (
					<button
						type="button"
						key={c.title}
						onClick={() => onSuggestion(c.prompt)}
						className="p-4 sm:p-8 text-left bg-white rounded-[24px] sm:rounded-[32px] hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 group flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 justify-between min-h-[auto] md:min-h-[220px]"
					>
						<div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-[#eef0f3] flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
							{c.icon}
						</div>
						<div className="md:mt-6 flex-1">
							<h3 className="font-bold tracking-tight text-sm sm:text-base text-foreground sm:mb-2">
								{c.title}
							</h3>
							<p className="hidden sm:block text-sm text-muted-foreground leading-relaxed font-medium">
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
		<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm border border-primary/20">
			<FiCpu size={14} />
		</div>
		<div className="bg-white border border-border px-5 py-3.5 rounded-[1.25rem] rounded-tl-sm text-[13px] font-medium text-muted-foreground flex items-center gap-3 shadow-sm">
			<span className="flex gap-1.5">
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
		<div className={`flex max-w-3xl mx-auto ${isAi ? "justify-start" : "justify-end"}`}>
			<div className={`flex gap-2 sm:gap-3 max-w-[95%] sm:max-w-[85%] w-full ${isAi ? "flex-row" : "flex-row-reverse"}`}>
				{/* Avatar */}
				<div
					className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm border ${isAi ? "bg-primary text-white border-primary/20" : "bg-[#eef0f3] text-foreground border-border"}`}
				>
					{isAi ? <FiActivity size={14} /> : <FiUser size={14} />}
				</div>

				{/* Content */}
				<div className="space-y-2 min-w-0 text-left w-full sm:w-auto">
					{/* Text bubble powered by Markdown */}
					<div
						className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-[1.5rem] text-[13px] sm:text-[14px] font-medium leading-relaxed shadow-sm overflow-x-auto ${
							isAi
								? "bg-white border border-border/60 rounded-tl-sm text-foreground prose prose-sm max-w-none prose-p:my-1 prose-headings:font-bold prose-headings:mb-2 prose-headings:text-foreground prose-strong:font-bold prose-ul:my-1 prose-li:my-0.5 prose-table:overflow-x-auto prose-table:block"
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
						<span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
							<FiCheck size={12} strokeWidth={3} /> Done
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
				</div>
			</div>
		</div>
	);
};

const TxTable = ({ rows }: { rows: TransactionRow[] }) => (
	<div className="overflow-x-auto rounded-2xl border border-border bg-white text-xs w-full shadow-sm mt-3 max-w-[85vw] sm:max-w-none">
		<table className="w-full text-left min-w-[320px]">
			<thead>
				<tr className="bg-[#eef0f3]/50 border-b border-border">
					{["Date", "Category", "Desc.", "Amount"].map((h) => (
						<th
							key={h}
							className="px-3 sm:px-5 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]"
						>
							{h}
						</th>
					))}
				</tr>
			</thead>
			<tbody className="divide-y divide-border">
				{rows.map((t) => (
					<tr key={t._id} className="hover:bg-zinc-50 transition-colors">
						<td className="px-3 sm:px-5 py-3.5 font-medium text-muted-foreground whitespace-nowrap">
							{new Date(t.date).toLocaleDateString("en-IN", {
								month: "short",
								day: "2-digit",
							})}
						</td>
						<td className="px-3 sm:px-5 py-3.5 font-bold text-primary whitespace-nowrap">
							{t.category}
						</td>
						<td className="px-3 sm:px-5 py-3.5 font-medium min-w-[120px]">
							{t.description}
						</td>
						<td
							className={`px-3 sm:px-5 py-3.5 font-bold text-right whitespace-nowrap ${t.type === "income" ? "text-emerald-500" : "text-foreground"}`}
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
	<div className="p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-3 mt-3 shadow-sm">
		<p className="text-xs font-bold text-rose-500 uppercase tracking-wide">
			Confirm deletion:
		</p>
		{rows.map((t) => (
			<div
				key={t._id}
				className="flex items-center justify-between p-4 bg-white border border-rose-500/10 rounded-xl gap-4 shadow-sm"
			>
				<div className="min-w-0">
					<p className="text-sm font-bold truncate">{t.description}</p>
					<p className="text-[11px] font-medium text-muted-foreground mt-1">
						₹{t.amount} · {new Date(t.date).toLocaleDateString()}
					</p>
				</div>
				<button
					onClick={() => onConfirm(t._id)}
					disabled={loading}
					className="shrink-0 h-9 px-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
				>
					Delete
				</button>
			</div>
		))}
	</div>
);

export default Chat;
