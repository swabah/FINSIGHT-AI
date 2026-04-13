import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout, getAuthData } from "../services/authService";
import {
	FiMessageCircle,
	FiLogOut,
	FiMenu,
	FiX,
	FiGrid,
	FiList,
	FiActivity,
	FiSettings,
	FiChevronRight,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
	{ to: "/dashboard", icon: <FiGrid />, label: "Overview" },
	{ to: "/chat", icon: <FiMessageCircle />, label: "AI Advisor" },
	{ to: "/transactions", icon: <FiList />, label: "History" },
];

const Layout: React.FC<{ children: React.FC | React.ReactNode }> = ({
	children,
}) => {
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const navigate = useNavigate();
	const auth = getAuthData();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<div className="flex h-screen bg-white">
			{/* ── Desktop Sidebar ── */}
			<aside className="hidden md:flex flex-col w-64 border-r border-slate-100 bg-white">
				{/* Logo */}
				<div className="p-6 flex items-center gap-3">
					<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
						<FiActivity className="text-lg" />
					</div>
					<span className="font-heading font-extrabold text-lg text-slate-900 tracking-tight">
						FinSight<span className="text-primary">AI</span>
					</span>
				</div>

				{/* Navigation */}
				<div className="flex-1 px-4 py-4 space-y-8">
					<div>
						<p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
							Main Menu
						</p>
						<nav className="space-y-1">
							{NAV_ITEMS.map((item) => (
								<NavItem key={item.to} {...item} />
							))}
						</nav>
					</div>

					<div>
						<p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
							Settings
						</p>
						<nav className="space-y-1">
							<NavItem
								to="/settings"
								icon={<FiSettings />}
								label="Preferences"
							/>
						</nav>
					</div>
				</div>

				{/* User Profile */}
				<div className="p-4 border-t border-slate-100">
					<div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
						<div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
							{auth?.user?.username?.charAt(0).toUpperCase()}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs font-bold text-slate-900 truncate">
								{auth?.user?.username}
							</p>
							<p className="text-[10px] text-slate-400 font-semibold tracking-tight">
								Pro Plan
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={handleLogout}
						className="flex items-center gap-3 w-full px-4 py-2 mt-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all"
					>
						<FiLogOut />
						Logout
					</button>
				</div>
			</aside>

			{/* ── Mobile Header ── */}
			<div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<FiActivity className="text-primary text-lg" />
					<span className="font-heading font-extrabold text-slate-900">
						FinSight
					</span>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="rounded-md h-9 w-9"
					onClick={() => setShowMobileMenu((v) => !v)}
				>
					{showMobileMenu ? <FiX size={18} /> : <FiMenu size={18} />}
				</Button>
			</div>

			{/* ── Main Content ── */}
			<main className="flex-1 flex flex-col min-w-0 overflow-hidden md:pt-0 pt-14">
				<div className="flex-1 overflow-y-auto bg-slate-50/20">
					<PageContent>{children}</PageContent>
				</div>
			</main>

			{/* ── Mobile Overlay Menu ── */}
			{showMobileMenu && (
				<div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col p-6 animate-in fade-in duration-200">
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-2">
							<FiActivity className="text-primary text-xl" />
							<span className="font-heading font-extrabold text-xl text-slate-900">
								FinSight
							</span>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-md"
							onClick={() => setShowMobileMenu(false)}
						>
							<FiX size={20} />
						</Button>
					</div>
					<nav className="space-y-2 flex-1">
						{NAV_ITEMS.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								onClick={() => setShowMobileMenu(false)}
								className={({ isActive }) =>
									`flex items-center gap-4 px-4 py-3 rounded-lg font-bold text-base transition-all ${
										isActive
											? "bg-primary/5 text-primary"
											: "text-slate-500 hover:bg-slate-50"
									}`
								}
							>
								{item.icon} {item.label}
							</NavLink>
						))}
					</nav>
					<button
						type="button"
						onClick={handleLogout}
						className="flex items-center gap-4 px-4 py-4 text-rose-500 font-bold border-t border-slate-100"
					>
						<FiLogOut /> Logout
					</button>
				</div>
			)}
		</div>
	);
};

/* Inner wrapper for page content */
const PageContent: React.FC<{ children: any }> = ({ children }) => {
	const location = useLocation();
	const pageTitle =
		NAV_ITEMS.find((n) => n.to === location.pathname)?.label ?? "Overview";

	return (
		<div className="h-full flex flex-col p-4 md:p-6 lg:p-8">
			<div className="mb-6 flex items-center justify-between px-2">
				<div>
					<h1 className="text-xl font-heading font-extrabold text-slate-900">
						{pageTitle}
					</h1>
				</div>
				<div className="hidden sm:flex items-center gap-3">
					<div className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2">
						<div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
						<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
							Live
						</span>
					</div>
				</div>
			</div>
			<div className="flex-1">
				{typeof children === "function" ? children() : children}
			</div>
		</div>
	);
};

const NavItem = ({
	to,
	icon,
	label,
}: {
	to: string;
	icon: React.ReactNode;
	label: string;
}) => (
	<NavLink
		to={to}
		className={({ isActive }) =>
			`group flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
				isActive ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50"
			}`
		}
	>
		<div className="flex items-center gap-3">
			<span className="text-base">{icon}</span>
			{label}
		</div>
		<FiChevronRight
			className={`text-xs transition-all ${to === useLocation().pathname ? "hidden" : "opacity-0 group-hover:opacity-100"}`}
		/>
	</NavLink>
);

export default Layout;
