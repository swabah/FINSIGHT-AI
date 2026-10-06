import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout, getAuthData } from "../services/authService";
import {
	FiLogOut,
	FiMenu,
	FiX,
	FiList,
	FiPieChart,
	FiTag,
	FiMessageSquare,
	FiGrid,
	FiSettings
} from "react-icons/fi";
import ConfirmModal from "./ConfirmModal";

const NAV_ITEMS = [
	{ to: "/chat", icon: <FiMessageSquare />, label: "Chat" },
	{ to: "/dashboard", icon: <FiGrid />, label: "Dashboard" },
	{ to: "/analytics", icon: <FiPieChart />, label: "Reports" },
	{ to: "/transactions", icon: <FiList />, label: "History" },
	{ to: "/categories", icon: <FiTag />, label: "Categories" },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const auth = getAuthData();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const isChat = location.pathname === "/chat";

	return (
		<div className="flex h-screen bg-background text-foreground relative overflow-hidden font-sans">
			<ConfirmModal
				isOpen={showLogoutConfirm}
				onClose={() => setShowLogoutConfirm(false)}
				onConfirm={handleLogout}
				title="Sign out"
				message="Are you sure you want to log out?"
				confirmText="Sign out"
				variant="danger"
			/>

			{/* ── Desktop Floating Sidebar (Pill Style) ── */}
			<div className="hidden md:flex flex-col py-6 pl-6 z-50 h-full">
				<aside className="w-20 bg-card rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] h-full flex flex-col items-center py-8 relative overflow-hidden">
					{/* Logo */}
					<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-10 shrink-0">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
						</svg>
					</div>

					{/* Navigation */}
					<nav className="flex-1 flex flex-col items-center gap-4 w-full">
						{NAV_ITEMS.map((item) => {
							const isActive = location.pathname === item.to;
							return (
								<NavLink
									key={item.to}
									to={item.to}
									title={item.label}
									className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
										isActive
											? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
											: "text-muted-foreground hover:bg-secondary hover:text-foreground"
									}`}
								>
									<span className="text-[1.2rem]">{item.icon}</span>
								</NavLink>
							);
						})}
					</nav>

					{/* Bottom Actions */}
					<div className="flex flex-col gap-4 mt-auto">
						<button
							type="button"
							title="Settings"
							className="w-12 h-12 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
						>
							<FiSettings size={20} />
						</button>
						<button
							type="button"
							onClick={() => setShowLogoutConfirm(true)}
							title="Logout"
							className="w-12 h-12 rounded-full flex items-center justify-center text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition-all"
						>
							<FiLogOut size={20} />
						</button>
					</div>
				</aside>
			</div>

			{/* ── Mobile Nav ── */}
			<div className="md:hidden fixed top-0 inset-x-0 z-40 bg-card px-6 h-16 flex items-center justify-between shadow-sm">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                        <span className="font-bold text-sm">F</span>
					</div>
					<span className="font-bold tracking-tight text-lg">FinSight</span>
				</div>
				<button
					onClick={() => setShowMobileMenu(!showMobileMenu)}
					className="w-10 h-10 flex items-center justify-center text-foreground bg-secondary rounded-full"
				>
					{showMobileMenu ? <FiX size={20} /> : <FiMenu size={20} />}
				</button>
			</div>

			{/* ── Main Workspace ── */}
			<main className={`flex-1 relative flex flex-col min-w-0 overflow-hidden md:pt-0 h-full ${isChat ? 'pt-16' : 'pt-24'}`}>
				{isChat ? (
					<div className="flex-1 overflow-hidden">{children}</div>
				) : (
					<div className="flex-1 overflow-y-auto">
						<PageContainer>{children}</PageContainer>
					</div>
				)}
			</main>

			{/* ── Mobile Menu Overlay ── */}
			{showMobileMenu && (
				<>
					<div 
						className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
						onClick={() => setShowMobileMenu(false)}
					/>
					<div className="md:hidden fixed inset-y-0 left-0 w-[280px] z-50 bg-background shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
						<div className="p-6 flex items-center justify-between border-b border-zinc-200/50">
							<div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
								<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
									<span className="text-sm">F</span>
								</div>
								FinSight
							</div>
							<button onClick={() => setShowMobileMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-foreground">
								<FiX size={16} />
							</button>
						</div>
						
						{/* User Info Mobile */}
						<div className="p-6 border-b border-zinc-200/50 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm uppercase">
									{auth?.user?.username?.charAt(0) || "U"}
								</div>
								<div className="flex flex-col">
									<span className="text-sm font-semibold">{auth?.user?.username || "User"}</span>
									<span className="text-[11px] text-muted-foreground">{auth?.user?.email || "user@example.com"}</span>
								</div>
							</div>
							<button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-zinc-200 transition-colors">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21a2 2 0 0 0 2 2 2 2 0 0 0 2-2"></path><path d="M15.4 17h-6.8a2 2 0 0 1-1.9-2.6l1.3-3.9a3.5 3.5 0 0 0 .1-1V8.2a5.2 5.2 0 1 1 10.4 0v1.3c0 .3.1.7.1 1l1.3 3.9a2 2 0 0 1-1.9 2.6z"></path></svg>
							</button>
						</div>

						<nav className="flex-1 overflow-y-auto p-4 space-y-1">
							{NAV_ITEMS.map((item) => (
								<NavLink
									key={item.to}
									to={item.to}
									onClick={() => setShowMobileMenu(false)}
									className={({ isActive }) =>
										`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-sm transition-all ${
											isActive
												? "bg-primary text-white"
												: "text-muted-foreground hover:bg-secondary"
										}`
									}
								>
									{item.icon} {item.label}
								</NavLink>
							))}
						</nav>
						<div className="p-4 border-t border-zinc-200/50">
							<button
								onClick={() => { setShowMobileMenu(false); setShowLogoutConfirm(true); }}
								className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-sm text-rose-500 hover:bg-rose-50 transition-all text-left"
							>
								<FiLogOut /> Logout
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

const PageContainer: React.FC<{ children: any }> = ({ children }) => {
	const location = useLocation();
	const auth = getAuthData();
	const pageTitle = NAV_ITEMS.find((n) => n.to === location.pathname)?.label ?? "Dashboard";

	return (
		<div className="min-h-full flex flex-col p-4 sm:p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-fade-up z-10 relative">
			{/* Top Header / Nav - Hidden on mobile as it's redundant to the mobile navbar */}
			<header className="mb-6 md:mb-10 hidden md:flex flex-row items-center justify-between gap-4 z-10 relative">
				<div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight mr-6">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                            <span className="text-sm">F</span>
                        </div>
                        FinSight
                    </div>
                    {/* Top Pill Nav (Optional styling element for breadcrumbs) */}
                    <div className="bg-card px-6 py-3 rounded-full shadow-sm hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `transition-colors hover:text-foreground ${isActive ? "text-foreground font-semibold" : ""}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                </div>

				<div className="flex items-center gap-4">
                    <button className="w-12 h-12 rounded-full bg-card shadow-sm flex items-center justify-center text-foreground hover:bg-secondary transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21a2 2 0 0 0 2 2 2 2 0 0 0 2-2"></path><path d="M15.4 17h-6.8a2 2 0 0 1-1.9-2.6l1.3-3.9a3.5 3.5 0 0 0 .1-1V8.2a5.2 5.2 0 1 1 10.4 0v1.3c0 .3.1.7.1 1l1.3 3.9a2 2 0 0 1-1.9 2.6z"></path></svg>
                    </button>
                    <div className="flex items-center gap-3 bg-card p-2 pr-4 rounded-full shadow-sm cursor-pointer hover:bg-secondary transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
                            {auth?.user?.username?.charAt(0) || "U"}
                        </div>
                        <span className="text-sm font-semibold">{auth?.user?.username || "User"}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
				</div>
			</header>

			<div className="flex-1 z-10 relative">
				{children}
			</div>
		</div>
	);
};

export default Layout;
