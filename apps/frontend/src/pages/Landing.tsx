import { useNavigate } from "react-router-dom";
import {
	FiActivity,
	FiShield,
	FiPieChart,
	FiChevronRight,
	FiCheckCircle,
    FiMessageSquare,
} from "react-icons/fi";

const Landing: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-[#eef0f3] text-[#1c1c21] font-sans selection:bg-primary/20 overflow-hidden relative">
			{/* Soft background glow elements */}
			<div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
			<div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

			{/* Navbar */}
			<nav className="h-24 flex items-center fixed top-0 inset-x-0 bg-[#eef0f3]/80 backdrop-blur-2xl z-[100]">
				<div className="max-w-6xl mx-auto w-full px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary font-bold text-lg md:text-xl">
                            F
                        </div>
                        <span className="font-heading font-bold text-xl md:text-2xl tracking-tight">
                            FinSight
                        </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="h-10 md:h-12 px-4 md:px-8 rounded-full text-xs md:text-sm font-bold text-foreground hover:bg-white transition-all shadow-sm bg-transparent"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="h-10 md:h-12 px-4 md:px-8 rounded-full text-xs md:text-sm font-bold bg-primary text-white shadow-[0_8px_20px_rgba(5,150,105,0.2)] hover:-translate-y-0.5 transition-all"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
			</nav>

			{/* Hero Section */}
			<section className="relative pt-48 pb-32 text-center w-full z-10">
                <div className="max-w-6xl mx-auto w-full px-8 flex flex-col items-center">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white shadow-sm mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:shadow-md transition-all cursor-default">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-bold text-foreground">
                            FinSight AI v2.0 is now live
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-[80px] font-heading font-medium tracking-tighter mb-8 leading-[1.05] text-foreground animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-4xl mx-auto">
                        Your finances, <br />
                        <span className="text-primary italic font-normal">beautifully</span> organized.
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground font-medium mb-12 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Say goodbye to spreadsheets. Chat with FinSight to log expenses, generate insights, and take absolute control of your financial future.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <button
                            onClick={() => navigate("/register")}
                            className="h-16 px-10 rounded-full text-base font-bold bg-primary text-white shadow-[0_12px_30px_rgba(5,150,105,0.25)] hover:bg-emerald-700 w-full sm:w-auto transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            Create Free Account <FiChevronRight size={20} />
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="h-16 px-10 rounded-full text-base font-bold bg-white text-foreground shadow-sm hover:shadow-md w-full sm:w-auto transition-all hover:-translate-y-1 flex items-center justify-center"
                        >
                            See How It Works
                        </button>
                    </div>
                </div>
			</section>

			{/* System Capabilities / Features */}
			<section className="pb-40 w-full animate-in fade-in duration-1000 delay-500 relative z-10">
                <div className="max-w-6xl mx-auto w-full px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<FiMessageSquare />}
                            title="Conversational AI"
                            desc="Just text your expenses. 'I spent $45 on dinner'—FinSight handles the categorization and logging instantly."
                            color="emerald"
                        />
                        <FeatureCard
                            icon={<FiPieChart />}
                            title="Visual Analytics"
                            desc="Beautiful, soft-rendered charts and reports give you an immediate understanding of where your money goes."
                            color="blue"
                        />
                        <FeatureCard
                            icon={<FiShield />}
                            title="Secure & Private"
                            desc="Your data is encrypted and strictly private. We use industry-standard security to keep your finances safe."
                            color="amber"
                        />
                    </div>

                    {/* Aesthetic Graphic Block */}
                    <div className="mt-32 w-full bg-white rounded-[40px] p-12 shadow-[0_20px_60px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
                        <div className="md:w-1/2 relative z-10 space-y-6">
                            <h2 className="text-4xl font-heading font-medium tracking-tight">The easiest way to track wealth.</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">Join thousands of users who have upgraded their financial lives. No more manual entry, no more complex tools.</p>
                            <div className="pt-4 flex gap-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-3xl font-bold text-foreground">98%</span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Accuracy</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-3xl font-bold text-foreground">10x</span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Faster Logging</span>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/2 relative z-10 flex flex-col gap-4 w-full">
                            <div className="bg-[#eef0f3] p-4 rounded-3xl self-end max-w-[80%] rounded-tr-sm">
                                <p className="text-sm font-medium">I just paid my $120 electricity bill.</p>
                            </div>
                            <div className="bg-primary text-white p-4 rounded-3xl self-start max-w-[80%] rounded-tl-sm shadow-sm flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <FiCheckCircle />
                                </div>
                                <p className="text-sm font-medium">Got it! Logged $120 to Utilities.</p>
                            </div>
                        </div>
                    </div>
                </div>
			</section>

			{/* Bottom Footer */}
			<footer className="py-12 border-t border-zinc-200/50 bg-white/30 relative z-10">
                <div className="max-w-6xl mx-auto w-full px-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                            <span className="font-bold text-sm">F</span>
                        </div>
                        <span className="font-heading font-bold text-lg tracking-tight">
                            FinSight
                        </span>
                    </div>
                    <div className="flex gap-8">
                        <a href="/" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
                        <a href="/" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
                        <a href="/" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground">
                        © 2026 FinSight AI.
                    </p>
                </div>
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
	<div className="bg-white rounded-[32px] p-10 hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 group">
		<div
			className={`w-16 h-16 rounded-[20px] flex items-center justify-center text-2xl mb-8 shadow-sm ${color === "emerald" ? "bg-emerald-50 text-emerald-600" : color === "blue" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}
		>
			{icon}
		</div>
		<h3 className="text-2xl font-heading font-bold text-foreground mb-4 tracking-tight group-hover:text-primary transition-colors">
			{title}
		</h3>
		<p className="text-muted-foreground font-medium leading-relaxed text-sm mb-6">
			{desc}
		</p>
	</div>
);

export default Landing;
