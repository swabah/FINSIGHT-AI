import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
	title: string;
	amount: number;
	type: "balance" | "income" | "expense";
	icon?: React.ReactNode;
	trend?: number;
}

const KPICard: React.FC<KPICardProps> = ({ title, amount, type, icon, trend }) => {
	const [displayAmount, setDisplayAmount] = useState(0);

	useEffect(() => {
		const duration = 1200;
		const steps = 60;
		const increment = amount / steps;
		let current = 0;
		let step = 0;

		const timer = setInterval(() => {
			step++;
			current += increment;
			if (step >= steps || amount === 0) {
				setDisplayAmount(amount);
				clearInterval(timer);
			} else {
				setDisplayAmount(current);
			}
		}, duration / steps);

		return () => clearInterval(timer);
	}, [amount]);

	const getStyles = () => {
		switch (type) {
			case "income":
				return {
					indicator: "bg-accent",
					text: "text-accent",
					iconBg: "bg-accent/10 text-accent border-accent/20",
					glow: "shadow-accent/5",
				};
			case "expense":
				return {
					indicator: "bg-rose-500",
					text: "text-rose-400",
					iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
					glow: "shadow-rose-500/5",
				};
			default:
				return {
					indicator: "bg-primary",
					text: "text-primary",
					iconBg: "bg-primary/10 text-primary border-primary/20",
					glow: "shadow-primary/5",
				};
		}
	};

	const styles = getStyles();

    const formatTrend = () => {
        if (trend === undefined || trend === 0) return "CALIBRATED";
        const sign = trend > 0 ? "+" : "";
        return `${sign}${trend.toFixed(1)}% VELOCITY`;
    }

	return (
		<Card
			className={cn(
                "bg-card border-border border rounded-[2rem] relative group shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 hover:border-border/80 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]",
                styles.glow
            )}
		>
			<div className={cn(
                "absolute top-0 right-0 w-32 h-32 opacity-0 pointer-events-none rounded-bl-[4rem] transition-all duration-1000 group-hover:opacity-10 blur-3xl",
                styles.indicator
            )}></div>

			<CardContent className="p-8 relative z-10 flex flex-col h-full">
				<div className="flex items-start justify-between mb-8">
					<div className="space-y-1">
						<h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] mb-4">
							{title}
						</h3>
						<p className={cn("text-4xl font-heading font-black tracking-tighter tabular-nums flex items-baseline gap-1", styles.text)}>
							<span className="text-2xl opacity-50 font-medium">₹</span>
							{Math.floor(displayAmount).toLocaleString("en-IN")}
							<span className="text-xl opacity-40 font-bold">
                                .{Math.abs(displayAmount % 1).toFixed(2).split(".")[1]}
                            </span>
						</p>
					</div>
					<div
						className={cn(
                            "p-4 rounded-2xl text-2xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                            styles.iconBg
                        )}
					>
						{icon || "₹"}
					</div>
				</div>

				<div className="flex items-center gap-3 pt-6 border-t border-border mt-auto">
					<div className={cn("w-2 h-2 rounded-full animate-pulse shadow-sm", styles.indicator)}></div>
					<span className="text-[10px] font-bold text-muted-foreground/60 tracking-[0.2em]">{formatTrend()}</span>
				</div>
			</CardContent>
		</Card>
	);
};

export default KPICard;
