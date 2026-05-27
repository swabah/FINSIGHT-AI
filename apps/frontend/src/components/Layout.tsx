import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout, getAuthData } from "../services/authService";
import {
	FiLogOut,
	FiMenu,
	FiX,
	FiList,
	FiActivity,
	FiTag,
	FiMessageSquare,
	FiPieChart,
	FiBarChart2,
	FiChevronLeft,
	FiChevronRight,
} from "react-icons/fi";
import ConfirmModal from "./ConfirmModal";

const NAV_ITEMS = [
	{ to: "/chat", icon: <FiMessageSquare />, label: "Chat" },
	{ to: "/dashboard", icon: <FiPieChart />, label: "Overview" },
	{ to: "/analytics", icon: <FiBarChart2 />, label: "Analytics" },
	{ to: "/transactions", icon: <FiList />, label: "Transactions" },
	{ to: "/categories", icon: <FiTag />, label: "Categories" },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
				title="Confirm Logout"
				message="Are you sure you want to log out of your account?"
				confirmText="Log Out"
				variant="danger"
			/>

			{/* ── Left Sidebar (Togglable) ── */}
			<aside 
				className={`hidden md:flex flex-col border-r border-border bg-card z-50 transition-all duration-300 relative ${
					isSidebarOpen ? "w-64" : "w-20"
				}`}
			>
				{/* Toggle Button */}
				<button 
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center text-foreground hover:bg-accent transition-all z-[60] shadow-sm"
				>
					{isSidebarOpen ? <FiChevronLeft size={12} /> : <FiChevronRight size={12} />}
				</button>

				<div className="p-6 flex items-center gap-3 h-20 shrink-0">
					<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow-sm border border-primary/20">
						<FiActivity size={18} />
					</div>
					{isSidebarOpen && (
						<span className="font-semibold text-lg tracking-tight truncate text-foreground">
							FinSight AI
						</span>
					)}
				</div>

				<div className="flex-1 flex flex-col justify-between py-4 pb-8">
					<nav className="px-3 space-y-1">
						{NAV_ITEMS.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) =>
									`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
										isActive
											? "bg-primary/5 text-primary font-semibold"
											: "text-muted-foreground hover:bg-accent hover:text-foreground font-medium"
									}`
								}
							>
								<div className="shrink-0 text-[1.1rem]">{item.icon}</div>
								{isSidebarOpen && <span className="text-sm">{item.label}</span>}
							</NavLink>
						))}
					</nav>

					<div className="px-3 space-y-4">
						<div className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-all cursor-pointer group">
							<div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 uppercase border border-primary/20">
								{auth?.user?.username?.charAt(0)}
							</div>
							{isSidebarOpen && (
								<div className="flex-1 min-w-0">
									<p className="text-xs font-semibold text-foreground truncate">
										{auth?.user?.username}
									</p>
									<p className="text-[10px] text-muted-foreground truncate">
										{auth?.user?.email}
									</p>
								</div>
							)}
							{isSidebarOpen && (
								<button
									type="button"
									onClick={() => setShowLogoutConfirm(true)}
									className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
									title="Logout"
								>
									<FiLogOut size={16} />
								</button>
							)}
						</div>
						{!isSidebarOpen && (
							<button
								type="button"
								onClick={() => setShowLogoutConfirm(true)}
								className="w-full flex justify-center text-muted-foreground hover:text-destructive p-2"
							>
								<FiLogOut size={18} />
							</button>
						)}
					</div>
				</div>
			</aside>

			{/* ── Mobile Nav ── */}
			<div className="md:hidden fixed top-0 inset-x-0 z-40 bg-background border-b border-border px-6 h-16 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<FiActivity className="text-primary text-xl" />
					<span className="font-medium tracking-tight text-lg">FinSight</span>
				</div>
				<button
					onClick={() => setShowMobileMenu(!showMobileMenu)}
					className="w-10 h-10 flex items-center justify-center text-foreground"
				>
					{showMobileMenu ? <FiX size={20} /> : <FiMenu size={20} />}
				</button>
			</div>

			{/* ── Main Workspace ── */}
			<main className="flex-1 relative flex flex-col min-w-0 overflow-hidden md:pt-0 pt-16 bg-background">
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
				<div className="md:hidden fixed inset-0 z-50 bg-background flex flex-col pt-20 px-8 animate-in slide-in-from-top duration-300">
					<nav className="space-y-2">
						{NAV_ITEMS.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								onClick={() => setShowMobileMenu(false)}
								className={({ isActive }) =>
									`flex items-center gap-4 px-6 py-4 rounded font-medium text-base transition-all ${
										isActive
											? "bg-primary text-white"
											: "text-muted-foreground hover:bg-accent"
									}`
								}
							>
								{item.icon} {item.label}
							</NavLink>
						))}
						<button
							onClick={() => setShowLogoutConfirm(true)}
							className="w-full flex items-center gap-4 px-6 py-4 rounded font-medium text-base text-destructive hover:bg-destructive/5 transition-all text-left"
						>
							<FiLogOut /> Logout
						</button>
					</nav>
				</div>
			)}
		</div>
	);
};

const PageContainer: React.FC<{ children: any }> = ({ children }) => {
	const location = useLocation();
	const pageTitle = NAV_ITEMS.find((n) => n.to === location.pathname)?.label ?? "Dashboard";

	return (
		<div className="min-h-full flex flex-col p-6 md:p-10 max-w-6xl mx-auto w-full animate-fade-up z-10 relative">
            {/* The gradient is injected by index.css but we ensure container is elevated */}
			<header className="mb-8 p-5 bg-card/70 backdrop-blur-md rounded-2xl border border-border shadow-sm flex items-center justify-between z-10 relative">
				<h1 className="text-2xl font-semibold text-foreground tracking-tight">
					{pageTitle}
				</h1>
				<div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
					Workspace / {pageTitle}
				</div>
			</header>
			<div className="flex-1 z-10 relative">
				{children}
			</div>
		</div>
	);
};

export default Layout;
