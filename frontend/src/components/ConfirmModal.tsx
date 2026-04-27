import React from "react";
import { FiX, FiAlertTriangle } from "react-icons/fi";

interface ConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	variant?: "default" | "danger";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	variant = "default",
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
			{/* Backdrop */}
			<button
				type="button"
				className="absolute inset-0 w-full bg-zinc-900/40 backdrop-blur-[2px] cursor-default"
				onClick={onClose}
				onKeyDown={(e) => e.key === "Escape" && onClose()}
				aria-label="Close modal"
			/>
			{/* Panel */}
			<div className="relative bg-white border border-zinc-200 rounded-lg w-full max-w-sm overflow-hidden shadow-2xl">
				<div className="p-8">
					<div className="flex items-center justify-between mb-8">
						<div
							className={`w-10 h-10 flex items-center justify-center border ${variant === "danger" ? "bg-rose-50 border-rose-200 text-rose-500" : "bg-zinc-50 border-zinc-200 text-zinc-900"} rounded`}
						>
							<FiAlertTriangle size={18} />
						</div>
						<button
							type="button"
							onClick={onClose}
							className="p-2 text-zinc-400 hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-100 rounded"
						>
							<FiX size={16} />
						</button>
					</div>
					<div>
						<h3 className="text-xl font-heading font-black text-zinc-900 tracking-tighter mb-2">
							{title}
						</h3>
						<p className="text-xs text-zinc-500 font-bold leading-relaxed uppercase tracking-tight opacity-70">
							{message}
						</p>
					</div>
				</div>

				<div className="p-8 pt-0 flex flex-col gap-3">
					<button
						type="button"
						onClick={() => {
							onConfirm();
							onClose();
						}}
						className={`w-full h-12 rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
							variant === "danger"
								? "bg-rose-600 border-rose-800 hover:bg-rose-700 text-white"
								: "bg-zinc-900 border-zinc-950 hover:bg-black text-white"
						}`}
					>
						{confirmText}
					</button>
					<button
						type="button"
						onClick={onClose}
						className="w-full h-10 text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-all"
					>
						Decline Action
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmModal;
