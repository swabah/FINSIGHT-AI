import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	FiActivity,
	FiShield,
	FiPieChart,
	FiChevronRight,
	FiCheckCircle,
} from "react-icons/fi";

const Landing: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/20 overflow-hidden relative">
			{/* Background elements */}
			<div className="absolute top-0 left-0 w-full h-[600px] bg-mesh opacity-60 pointer-events-none" />
			<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

			{/* Navbar */}
			<nav className="h-20 flex items-center justify-between px-8 md:px-12 fixed top-0 inset-x-0 bg-white/70 backdrop-blur-xl z-[100] border-b border-slate-100">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
						<FiActivity size={22} />
					</div>
					<span className="font-heading font-black text-xl tracking-tighter">
						FinSight<span className="text-primary italic">AI</span>
					</span>
				</div>
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						onClick={() => navigate("/login")}
						className="h-11 px-6 rounded-xl text-xs font-extrabold uppercase tracking-widest text-slate-600 hover:text-slate-900"
					>
						Sign In
					</Button>
					<Button
						onClick={() => navigate("/register")}
						className="h-11 px-8 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-black transition-all"
					>
						Get Started
					</Button>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="relative px-8 pt-44 pb-24 text-center max-w-5xl mx-auto flex flex-col items-center">
				<div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-white border border-slate-100 shadow-sm mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
					<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
					<span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
						v2.0 Quantum Engine
					</span>
				</div>
				<h1 className="text-5xl md:text-7xl font-heading font-black tracking-tighter mb-8 leading-[0.95] text-slate-900 animate-in fade-in slide-in-from-bottom-6 duration-1000">
					Command your <br />
					finance with <span className="text-premium">absolute clarity.</span>
				</h1>
				<p className="text-lg md:text-xl text-slate-500 font-medium mb-12 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
					Next-generation capital management for tactical decision-making.
					Analyze, track, and optimize your wealth with AI-native intelligence.
				</p>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
					<Button
						onClick={() => navigate("/register")}
						className="h-14 px-10 rounded-2xl text-xs font-black uppercase tracking-[0.3em] bg-primary shadow-2xl shadow-primary/25 hover:bg-indigo-700 w-full sm:w-auto transition-all active:scale-95"
					>
						Initialize Stack <FiChevronRight className="ml-2" />
					</Button>
					<Button
						variant="outline"
						className="h-14 px-10 rounded-2xl text-xs font-black uppercase tracking-[0.3em] border-slate-200 bg-white/50 backdrop-blur-sm w-full sm:w-auto hover:bg-white transition-all"
					>
						Documentation
					</Button>
				</div>
			</section>

			{/* System Capabilities */}
			<section className="px-8 pb-32 max-w-7xl mx-auto animate-in fade-in duration-1000 delay-500">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<FeatureCard
						icon={<FiPieChart />}
						title="High-Value Mapping"
						desc="Deep categorical decomposition for every operational entry in your ledger."
						color="indigo"
					/>
					<FeatureCard
						icon={<FiActivity />}
						title="Velocity Analytics"
						desc="Real-time monitoring of retention rates and temporal deployment trends."
						color="emerald"
					/>
					<FeatureCard
						icon={<FiShield />}
						title="Secure Protocol"
						desc="Enterprise-grade architecture designed for maximum computational efficiency."
						color="amber"
					/>
				</div>

				{/* Proof Section */}
				<div className="mt-20 flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-40 grayscale">
					<p className="text-[10px] font-black uppercase tracking-[0.4em]">
						Proprietary Tokenization
					</p>
					<p className="text-[10px] font-black uppercase tracking-[0.4em]">
						Neural Advisory
					</p>
					<p className="text-[10px] font-black uppercase tracking-[0.4em]">
						Quantum Integrity
					</p>
				</div>
			</section>

			{/* Bottom Footer */}
			<footer className="px-12 py-16 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-8">
				<div className="flex items-center gap-3">
					<div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center">
						<FiActivity size={14} />
					</div>
					<span className="font-heading font-black text-sm tracking-tighter">
						FinSight AI
					</span>
				</div>
				<div className="flex gap-8">
					<a
						href="/"
						className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
					>
						Architecture
					</a>
					<a
						href="/"
						className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
					>
						Privacy
					</a>
					<a
						href="/"
						className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
					>
						Legal
					</a>
				</div>
				<p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
					© 2026 Intelligence Engine v2.0
				</p>
			</footer>
		</div>
	);
};

const FeatureCard = ({
	icon,
	title,
	desc,
	color,
}: {
	icon: React.ReactNode;
	title: string;
	desc: string;
	color: string;
}) => (
	<div className="modern-card p-10 bg-white hover-lift ring-1 ring-slate-100 hover:ring-primary/20 transition-all border-none">
		<div
			className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-8 shadow-sm ${color === "indigo" ? "bg-indigo-50 text-indigo-600" : color === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
		>
			{icon}
		</div>
		<h3 className="text-xl font-heading font-black text-slate-900 mb-4 tracking-tight">
			{title}
		</h3>
		<p className="text-slate-500 font-medium leading-relaxed text-sm mb-6">
			{desc}
		</p>
		<div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest">
			<FiCheckCircle /> Activated
		</div>
	</div>
);

export default Landing;
