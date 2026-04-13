import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FiActivity, FiShield, FiPieChart } from "react-icons/fi";

const Landing: React.FC = () => {
    const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/10">
			{/* Navbar */}
			<nav className="h-16 flex items-center justify-between px-6 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-50">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
						<FiActivity className="text-lg" />
					</div>
					<span className="font-heading font-extrabold text-lg tracking-tight">FinSight</span>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="ghost" onClick={() => navigate("/login")} className="h-9 px-4 rounded-md text-xs font-bold">Sign In</Button>
					<Button onClick={() => navigate("/register")} className="h-9 px-4 rounded-md text-xs font-bold bg-slate-900 text-white shadow-none">Get Started</Button>
				</div>
			</nav>

			{/* Hero */}
			<section className="px-6 py-20 text-center max-w-4xl mx-auto">
				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 mb-6">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
					<span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">v2.0 Compact Engine</span>
				</div>
				<h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-6 leading-[1.1]">
					Financial intelligence for the <span className="text-primary italic">next-gen</span> web.
				</h1>
				<p className="text-base text-slate-500 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
					Analyze capital flow, track deployment velocity, and consult with our RAG-powered AI advisor in one unified, flat-design stack.
				</p>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
					<Button onClick={() => navigate("/register")} className="h-11 px-8 rounded-lg text-sm font-bold bg-primary shadow-none w-full sm:w-auto">
						Initialize System
					</Button>
					<Button variant="outline" className="h-11 px-8 rounded-lg text-sm font-bold border-slate-200 w-full sm:w-auto">
						View Architecture
					</Button>
				</div>
			</section>

			{/* Feature Cards Flattened */}
			<section className="px-6 pb-24 max-w-6xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<FeatureCard 
						icon={<FiPieChart />} 
						title="Capital Distribution" 
						desc="Smart categorical breakdown of every transaction."
					/>
					<FeatureCard 
						icon={<FiActivity />} 
						title="Velocity Tracking" 
						desc="Real-time monitoring of savings and burn rates."
					/>
					<FeatureCard 
						icon={<FiShield />} 
						title="Enterprise Guard" 
						desc="Secure, flat architecture with zero-shadow overhead."
					/>
				</div>
			</section>

			{/* Footer */}
			<footer className="px-8 py-12 border-t border-slate-50 text-center">
				<p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">© 2026 FinSight Intelligence. All rights reserved.</p>
			</footer>
		</div>
	);
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
	<div className="p-6 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
		<div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-primary mb-4 text-xl">
			{icon}
		</div>
		<h3 className="font-heading font-black text-slate-900 mb-2">{title}</h3>
		<p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
	</div>
);

export default Landing;
