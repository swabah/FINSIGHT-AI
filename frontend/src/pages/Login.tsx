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
				navigate("/dashboard");
			}
		} catch (err: any) {
			setError(err.message || "Invalid credentials. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-8 border border-slate-100 rounded-xl space-y-6">
					<div className="text-center">
						<div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
							<Activity size={24} />
						</div>
						<h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
							Welcome back
						</h2>
						<p className="mt-1 text-sm text-slate-500 font-medium">
							Access your financial dashboard
						</p>
					</div>

					{error && (
						<div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
							<AlertCircle size={14} /> {error}
						</div>
					)}

					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-1">
							<Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
								<Input
									type="email"
									required
									value={formData.email}
									onChange={handleInputChange("email")}
									className="pl-10 h-11 rounded-lg border-slate-200 bg-white focus:bg-white text-sm"
									placeholder="name@example.com"
								/>
							</div>
						</div>

						<div className="space-y-1">
							<Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
								<Input
									type="password"
									required
									value={formData.password}
									onChange={handleInputChange("password")}
									className="pl-10 h-11 rounded-lg border-slate-200 bg-white focus:bg-white text-sm"
									placeholder="••••••••"
								/>
							</div>
						</div>

						<Button
							type="submit"
							disabled={loading}
							className="w-full h-11 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-sm transition-all"
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
						<p className="text-xs text-slate-500 font-medium">
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
					<p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Secure Intelligence Portal</p>
				</div>
			</div>
		</div>
	);
};

export default Login;

