import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendChatMessage } from "../services/chatService";
import { getAuthData } from "../services/authService";
import { FiSend, FiUser, FiActivity } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
	id: string;
	text: string;
	sender: "user" | "ai";
}

const SUGGESTIONS = [
	"What is my biggest spending category?",
	"How can I improve my savings rate?",
	"Give me a simple monthly budget plan.",
];

const Chat: React.FC = () => {
	const auth = getAuthData();
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "0",
			text: "Greetings. I'm your FinSight Intelligence Advisor. I've analyzed your recent financial activity. How can I assist with your capital management today?",
			sender: "ai",
		},
	]);
	const bottomRef = useRef<HTMLDivElement>(null);

	const mutation = useMutation({
		mutationFn: (msg: string) =>
			sendChatMessage(auth?.token || "", { query: msg }),
		onSuccess: (res: any) => {
			setMessages((prev) => [
				...prev,
				{ id: Date.now().toString(), text: res.data.response, sender: "ai" },
			]);
		},
	});

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, mutation.isPending]);

	const send = (text: string) => {
		if (!text.trim() || mutation.isPending) return;
		setMessages((prev) => [
			...prev,
			{ id: Date.now().toString(), text, sender: "user" },
		]);
		mutation.mutate(text);
		setInput("");
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		send(input);
	};

	return (
		<div className="flex flex-col h-[calc(100vh-140px)] relative bg-white rounded-xl border border-slate-100 overflow-hidden">
			{/* Messages area */}
			<div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 scrollbar-hide">
				{messages.map((m) => (
					<div
						key={m.id}
						className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
					>
						{/* Avatar */}
						<div
							className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm ${
								m.sender === "user"
									? "bg-slate-900 text-white"
									: "bg-primary text-white"
							}`}
						>
							{m.sender === "user" ? (
								<FiUser size={14} />
							) : (
								<FiActivity size={14} />
							)}
						</div>
						{/* Bubble */}
						<div
							className={`max-w-[85%] md:max-w-[75%] px-4 py-2.5 rounded-xl text-xs md:text-sm leading-relaxed font-medium animate-in fade-in duration-300 ${
								m.sender === "user"
									? "bg-slate-50 text-slate-900 rounded-tr-none border border-slate-100"
									: "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
							}`}
						>
							{m.text}
						</div>
					</div>
				))}

				{mutation.isPending && (
					<div className="flex items-start gap-3">
						<div className="w-8 h-8 shrink-0 rounded-lg bg-primary flex items-center justify-center text-white">
							<FiActivity size={14} />
						</div>
						<div className="bg-white border border-slate-100 px-4 py-2.5 rounded-xl rounded-tl-none">
							<div className="flex gap-1 h-4 items-center">
								<div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
								<div className="w-1 h-1 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
								<div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
							</div>
						</div>
					</div>
				)}
				<div ref={bottomRef} />
			</div>

			{/* Input System */}
			<div className="p-4 bg-slate-50 border-t border-slate-100">
				{/* Suggestions */}
				{messages.length === 1 && !mutation.isPending && (
					<div className="mb-4 flex flex-wrap gap-2 animate-in fade-in duration-500">
						{SUGGESTIONS.map((s) => (
							<button
								type="button"
								key={s}
								onClick={() => send(s)}
								className="group flex items-center gap-2 text-[10px] bg-white border border-slate-200 hover:border-primary/30 hover:bg-primary/5 text-slate-500 hover:text-primary px-3 py-1.5 rounded-full font-bold transition-all"
							>
								{s}
							</button>
						))}
					</div>
				)}

				<form onSubmit={handleSubmit} className="relative group">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Analyze finances..."
						disabled={mutation.isPending}
						className="w-full h-12 pl-4 pr-14 rounded-xl border-slate-200 bg-white text-sm font-medium focus:bg-white transition-all outline-none"
					/>
					<Button
						type="submit"
						disabled={mutation.isPending || !input.trim()}
						className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg p-0 bg-slate-900 hover:bg-black shrink-0 transition-all active:scale-95"
					>
						<FiSend size={14} />
					</Button>
				</form>
				<div className="mt-3 flex justify-center">
					<p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
						Intelligence Engine Live
					</p>
				</div>
			</div>
		</div>
	);
};

export default Chat;
