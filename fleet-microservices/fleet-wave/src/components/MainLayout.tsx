import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Car,
    Users,
    Radio,
    Activity,
    Menu,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export default function MainLayout() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('driverId');
        navigate('/');
    };

    const navItems = [
        { to: '/admin', icon: LayoutDashboard, label: 'Command Center' },
        { to: '/admin/fleet', icon: Car, label: 'Fleet Ops' },
        { to: '/admin/drivers', icon: Users, label: 'Drivers' },
        { to: '/admin/dispatch', icon: Radio, label: 'Mission Control' },
        { to: '/admin/health', icon: Activity, label: 'System Health' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1e] to-black overflow-hidden flex">
            {/* Sidebar Backdrop (Mobile) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={cn(
                    "fixed lg:relative z-30 h-screen w-64 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl flex flex-col",
                    !isSidebarOpen && "hidden lg:flex"
                )}
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", damping: 20 }}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                        <Radio className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold font-heading tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        FleetWave
                    </span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(56,189,248,0.1)]"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-primary/10 rounded-lg"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className={cn("h-4 w-4 relative z-10", isActive && "text-primary")} />
                                    <span className="relative z-10">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-4 border border-white/5">
                        <h4 className="text-xs font-semibold text-slate-400 mb-1">Status</h4>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-emerald-500">System Online</span>
                        </div>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Header */}
                <header className="h-16 border-b border-white/5 bg-slate-900/30 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="flex-1" /> {/* Spacer */}

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                                <span className="text-xs font-bold">A</span>
                            </div>
                            <span className="text-sm">Admin User</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-red-400"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                {/* Page Content with Transitions */}
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-7xl mx-auto space-y-6"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
