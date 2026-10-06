import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, setAuthData } from "../services/authService";
import { Mail, Lock, AlertCircle, ArrowRight, Activity } from "lucide-react";
import { LoadingSpinner } from "../components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login: React.FC = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({ email: "", password: "" });
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({ ...prev, [field]: e.target.value }));
		if (error) setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const response = await login(formData);
			if (response.success && response.data) {
				setAuthData(response.data);
				navigate("/chat");
			}
		} catch (err: any) {
			setError(err.message || "Invalid credentials. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#eef0f3] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans animate-in fade-in duration-500">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-10 px-8 rounded-[32px] space-y-8 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border-none">
					<div className="text-center">
						<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white mb-6 shadow-[0_8px_20px_rgba(5,150,105,0.2)]">
							<span className="font-bold text-xl">F</span>
						</div>
						<h2 className="text-3xl font-heading font-medium tracking-tight text-foreground">
							Welcome back
						</h2>
						<p className="mt-1 text-sm text-muted-foreground font-medium">
							Access your financial dashboard
						</p>
					</div>

					{error && (
						<div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
							<AlertCircle size={14} /> {error}
						</div>
					)}

					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-1">
							<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
								<Input
									type="email"
									required
									value={formData.email}
									onChange={handleInputChange("email")}
									className="pl-10 h-11 rounded-lg border-border bg-input focus:bg-input focus:border-primary/50 text-sm outline-none transition-all"
									placeholder="name@example.com"
								/>
							</div>
						</div>

						<div className="space-y-1">
							<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
								<Input
									type="password"
									required
									value={formData.password}
									onChange={handleInputChange("password")}
									className="pl-10 h-11 rounded-lg border-border bg-input focus:bg-input focus:border-primary/50 text-sm outline-none transition-all"
									placeholder="••••••••"
								/>
							</div>
						</div>

						<Button
							type="submit"
							disabled={loading}
							className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold text-sm transition-all"
						>
							{loading ? (
								<LoadingSpinner size="sm" />
							) : (
								<span className="flex items-center gap-2">
									Sign In <ArrowRight size={16} />
								</span>
							)}
						</Button>
					</form>

					<div className="text-center pt-2">
						<p className="text-xs text-muted-foreground font-medium">
							New to FinSight?{" "}
							<Link
								to="/register"
								className="text-primary font-bold hover:underline"
							>
								Initialize Account
							</Link>
						</p>
					</div>
				</div>

				<div className="mt-8 text-center">
					<p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Secure Intelligence Portal</p>
				</div>
			</div>
		</div>
	);
};

export default Login;

