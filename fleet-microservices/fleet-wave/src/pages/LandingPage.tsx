import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Truck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=3432&auto=format&fit=crop')] bg-cover bg-center">
            <div className="min-h-screen bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Brand Section */}
                    <div className="space-y-6 text-white flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                        >
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                                FleetWave
                            </h1>
                            <p className="text-xl text-slate-300 font-light">
                                Next-Gen Operations Command
                            </p>
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 max-w-md"
                        >
                            Orchestrate your entire logistics network from a single, beautiful dashboard. Real-time tracking, AI-assisted dispatch, and seamless driver communication.
                        </motion.p>
                    </div>

                    {/* Login Options */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        {/* Admin Card */}
                        <div
                            onClick={() => navigate('/login?role=admin')}
                            className="group relative overflow-hidden rounded-2xl bg-white/5 p-6 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Command Center</h3>
                                    <p className="text-sm text-slate-400">For Fleet Managers & Admins</p>
                                </div>
                            </div>
                        </div>

                        {/* Driver Card */}
                        <div
                            onClick={() => navigate('/login?role=driver')}
                            className="group relative overflow-hidden rounded-2xl bg-white/5 p-6 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <Truck className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Driver Portal</h3>
                                    <p className="text-sm text-slate-400">Access Routes & Schedule</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Footer / Credits */}
            <div className="absolute bottom-4 w-full text-center text-slate-500 text-xs">
                System Status: <span className="text-emerald-500">Operational</span> • v2.0.0
            </div>
        </div>
    );
}
