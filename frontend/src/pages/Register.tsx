import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, setAuthData } from "../services/authService";
import { FiUser, FiMail, FiLock, FiAlertCircle, FiArrowRight, FiActivity } from "react-icons/fi";
import { LoadingSpinner } from "../components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Register: React.FC = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({ ...prev, [field]: e.target.value }));
		if (error) setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.password !== formData.confirmPassword) return setError("Passwords don't match");
		setError(null);
		setLoading(true);
		try {
			const { confirmPassword, ...regData } = formData;
			const response = await register(regData);
			if (response.success && response.data) {
				setAuthData(response.data);
				navigate("/dashboard");
			}
		} catch (err: any) {
			setError(err.message || "Registration failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans animate-in fade-in duration-500">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-card py-8 px-8 border border-border rounded-xl space-y-6 shadow-2xl">
					<div className="text-center">
						<div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 ring-1 ring-primary/20">
							<FiActivity size={24} />
						</div>
						<h2 className="text-2xl font-semibold tracking-tight text-foreground">
							Create account
						</h2>
						<p className="mt-1 text-sm text-muted-foreground font-medium">
							Join the FinSight network
						</p>
					</div>

					{error && (
						<div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
							<FiAlertCircle size={14} /> {error}
						</div>
					)}

					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-1">
							<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Entity Name</Label>
							<div className="relative">
								<FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
								<Input
									type="text"
									required
									value={formData.username}
									onChange={handleInputChange("username")}
									className="pl-10 h-11 rounded-lg border-border bg-input focus:bg-input focus:border-primary/50 text-sm outline-none transition-all"
									placeholder="John Doe"
								/>
							</div>
						</div>

						<div className="space-y-1">
							<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
							<div className="relative">
								<FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
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
								<FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
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

						<div className="space-y-1">
							<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</Label>
							<div className="relative">
								<FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
								<Input
									type="password"
									required
									value={formData.confirmPassword}
									onChange={handleInputChange("confirmPassword")}
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
									Initialize Account <FiArrowRight size={16} />
								</span>
							)}
						</Button>
					</form>

					<div className="text-center pt-2">
						<p className="text-xs text-muted-foreground font-medium">
							Already have an account?{" "}
							<Link
								to="/login"
								className="text-primary font-bold hover:underline"
							>
								Authorize Session
							</Link>
						</p>
					</div>
				</div>

				<div className="mt-8 text-center">
					<p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Distributed Ledger Network</p>
				</div>
			</div>
		</div>
	);
};

export default Register;


