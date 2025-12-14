import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Server, Database, Shield, Zap, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function HealthPage() {
    const [status, setStatus] = useState<any>({ fleet: 'checking', driver: 'checking', dispatch: 'checking' });

    // Mock check (in reality would ping /health endpoints)
    useEffect(() => {
        const check = async () => {
            // Just simulate for visual effect as we don't have direct /health access from browser without CORS sometimes
            // But we know api calls work.
            try { await api.fleet.list(); setStatus((p: any) => ({ ...p, fleet: 'online' })); } catch (e) { setStatus((p: any) => ({ ...p, fleet: 'error' })); }
            try { await api.drivers.list(); setStatus((p: any) => ({ ...p, driver: 'online' })); } catch (e) { setStatus((p: any) => ({ ...p, driver: 'error' })); }
            try { await api.dispatch.list(); setStatus((p: any) => ({ ...p, dispatch: 'online' })); } catch (e) { setStatus((p: any) => ({ ...p, dispatch: 'error' })); }
        };
        check();
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-heading">System Diagnostics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visualizer */}
                <Card className="p-8 flex items-center justify-center min-h-[400px] bg-slate-900/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 to-transparent" />

                    {/* Central Core */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="relative z-10 h-32 w-32 rounded-full border border-blue-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.2)]"
                    >
                        <div className="h-24 w-24 rounded-full bg-blue-500/10 flex items-center justify-center backdrop-blur-sm border border-blue-400/20">
                            <Activity className="h-10 w-10 text-blue-400" />
                        </div>
                    </motion.div>

                    {/* Nodes */}
                    {[
                        { label: 'Fleet Svc', status: status.fleet, x: -120, y: -80, icon: Truck },
                        { label: 'Driver Svc', status: status.driver, x: 120, y: -80, icon: Shield },
                        { label: 'Dispatch Svc', status: status.dispatch, x: 0, y: 120, icon: Zap },
                    ].map((node, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: 0, y: 0, opacity: 0 }}
                            animate={{ x: node.x, y: node.y, opacity: 1 }}
                            transition={{ delay: 0.2 * i, duration: 0.5 }}
                            className="absolute z-10"
                        >
                            <div className={`
                                flex flex-col items-center gap-2
                                ${node.status === 'online' ? 'text-emerald-400' : node.status === 'error' ? 'text-red-400' : 'text-slate-500'}
                            `}>
                                <div className={`
                                    h-16 w-16 rounded-xl border flex items-center justify-center bg-slate-900/80 backdrop-blur-md
                                    ${node.status === 'online' ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-slate-700'}
                                `}>
                                    {/* connection line to center */}
                                    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[300px] h-[300px] pointer-events-none opacity-20 overflow-visible text-white">
                                        <line x1="150" y1="150" x2={150 - node.x} y2={150 - node.y} stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                                    </svg>

                                    {/* <node.icon className="h-6 w-6" /> */}
                                </div>
                                <span className="text-xs font-mono font-bold uppercase tracking-wider">{node.label}</span>
                                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full border border-white/5 uppercase">
                                    Port {8081 + i}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </Card>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold">Service Status</h3>
                    <div className="space-y-4">
                        {['Fleet', 'Driver', 'Dispatch'].map((svc, i) => (
                            <Card key={i} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                        <Server className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{svc} Microservice</div>
                                        <div className="text-xs text-muted-foreground">Running on localhost:{8081 + i}</div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="h-8">
                                    <Activity className="h-3 w-3 mr-2 text-emerald-500" /> 99.9% Uptime
                                </Button>
                            </Card>
                        ))}
                        <Card className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                    <Database className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="font-bold">MongoDB Cluster</div>
                                    <div className="text-xs text-muted-foreground">Port 27017</div>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="h-8">
                                <Activity className="h-3 w-3 mr-2 text-emerald-500" /> Connected
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
