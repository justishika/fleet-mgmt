import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Truck, AlertTriangle, Coffee, CheckCircle, Power, Navigation, UserCircle } from 'lucide-react';
import { api, type Driver, type Job } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function DriverPortal() {
    const navigate = useNavigate();
    const [driver, setDriver] = useState<Driver | null>(null);
    const [activeJob, setActiveJob] = useState<Job | null>(null);
    const [statusLoc, setStatusLoc] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Mock ID for demo if not logged in truly
    const driverId = localStorage.getItem('driverId');

    useEffect(() => {
        if (!driverId) {
            navigate('/login');
            return;
        }
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [driverId, navigate]);

    const fetchData = async () => {
        if (!driverId) return;

        // 1. Get Driver Info
        try {
            const me = await api.drivers.get(driverId);
            if (me) {
                setDriver(me);
                if (!statusLoc) setStatusLoc((me.location && me.location !== 'null') ? me.location : ''); // Only set init
                setError('');
            }
        } catch (driverError: any) {
            console.error('Driver fetch failed:', driverError);
            if (driverError.response?.status === 404) {
                setError(`Driver ID '${driverId}' not found. Please contact admin.`);
            } else {
                setError(`Failed to load profile: ${driverError.message}`);
            }
            setLoading(false);
            return;
        }

        // 2. Get Active Jobs
        try {
            const jobs = await api.dispatch.list();
            const myJob = jobs.find(j => j.driverId === driverId && (j.status === 'IN_PROGRESS' || j.status === 'PENDING'));
            setActiveJob(myJob || null);
        } catch (jobError) {
            console.warn('Job fetch failed:', jobError);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        if (!driver) return;
        if (status === 'Emergency') {
            if (!confirm('REPORT EMERGENCY? This will alert HDQ.')) return;
            await api.drivers.raiseEmergency(driver.id);
        } else if (status === 'Leave') {
            await api.drivers.applyLeave(driver.id);
        } else if (status === 'Available') {
            await api.drivers.updateAvailability(driver.id, true);
        }
        fetchData();
    };

    const handleLocationUpdate = async () => {
        if (!driver) return;
        await api.drivers.updateLocation(driver.id, statusLoc, activeJob?.destination || '');
        fetchData();
    };


    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400">Loading driver profile...</div>;
    if (error) return <div className="flex h-screen items-center justify-center bg-slate-950 text-red-400">{error}</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center">
            <main className="w-full max-w-md space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-full">
                            <UserCircle className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                Driver Portal
                            </h1>
                            <p className="text-slate-400 text-sm">Welcome back, {driver?.name}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-slate-400 hover:text-red-400">
                        <Power className="w-5 h-5" />
                    </Button>
                </div>

                {/* Status Indicator */}
                <div className="flex justify-center mb-6">
                    {driver?.status === 'AVAILABLE' && <Badge className="bg-emerald-500/10 text-emerald-400 px-4 py-1 text-sm border-emerald-500/20">● Online</Badge>}
                    {driver?.status === 'BUSY' && <Badge className="bg-amber-500/10 text-amber-400 px-4 py-1 text-sm border-amber-500/20">● On Job</Badge>}
                    {(!driver?.status || driver.status === 'OFFLINE') && <Badge className="bg-slate-500/10 text-slate-400 px-4 py-1 text-sm border-slate-500/20">● Offline</Badge>}
                </div>

                {/* Status Actions */}
                <Card className="p-6 bg-slate-900 border-slate-800 shadow-xl">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Set Status</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <ActionButton
                            active={driver?.status === 'AVAILABLE'}
                            onClick={() => handleStatusUpdate('Available')}
                            icon={<CheckCircle className="w-6 h-6" />}
                            label="Ready"
                            color="bg-emerald-600"
                        />
                        <ActionButton
                            active={driver?.status === 'OFFLINE' || false}
                            onClick={() => handleStatusUpdate('Leave')}
                            icon={<Coffee className="w-6 h-6" />}
                            label="Break"
                            color="bg-amber-600"
                        />
                        <ActionButton
                            active={driver?.status === 'EMERGENCY' || false}
                            onClick={() => handleStatusUpdate('Emergency')}
                            icon={<AlertTriangle className="w-6 h-6" />}
                            label="SOS"
                            danger
                        />
                    </div>
                </Card>

                {/* Location Update */}
                <Card className="p-6 bg-slate-900 border-slate-800 shadow-xl">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Location Update</h2>
                    <div className="flex gap-2">
                        <Input
                            value={statusLoc}
                            onChange={(e) => setStatusLoc(e.target.value)}
                            placeholder="Enter current city/location..."
                            className="bg-slate-950 border-slate-700 text-slate-200"
                        />
                        <Button
                            size="icon"
                            onClick={handleLocationUpdate}
                            className="bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 shadow-lg"
                        >
                            <Navigation className="h-4 w-4" />
                        </Button>
                    </div>
                    {driver?.location && driver.location !== 'null' && (
                        <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Last Reported: <span className="text-blue-400 font-medium">{driver.location}</span>
                        </p>
                    )}
                </Card>

                {/* Current Job */}
                <AnimatePresence>
                    {activeJob && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card className="p-6 bg-indigo-900/20 border-indigo-500/20 shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <Truck className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                    <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Current Manifest</h2>
                                    <div className="text-2xl font-bold flex items-center gap-3 text-white mb-4">
                                        <Truck className="w-6 h-6 text-indigo-400" />
                                        Job #{activeJob.id}
                                    </div>

                                    <div className="space-y-3 bg-slate-950/50 p-4 rounded-lg border border-indigo-500/30">
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <div className="w-6 flex justify-center"><Navigation className="w-4 h-4 text-slate-500" /></div>
                                            <span className="font-mono text-sm">{activeJob.pickup || 'Depot'}</span>
                                        </div>
                                        <div className="ml-3 h-4 border-l border-dashed border-slate-700"></div>
                                        <div className="flex items-center gap-3 text-white font-medium">
                                            <div className="w-6 flex justify-center"><MapPin className="w-4 h-4 text-emerald-500" /></div>
                                            <span className="font-mono text-sm">{activeJob.destination}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Badge variant="outline" className="border-indigo-500/50 text-indigo-300">{activeJob.status}</Badge>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );

}

// Helper Component for Status Buttons
function ActionButton({ active, onClick, icon, label, color, danger }: any) {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center py-4 rounded-xl transition-all duration-300 relative overflow-hidden",
                active
                    ? `${color} text-white shadow-lg`
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
        >
            {/* Glossy Effect overlay if active */}
            {active && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            )}

            <div className={cn("mb-2", active ? "text-white" : danger ? "text-red-400" : "text-slate-400")}>
                {icon}
            </div>
            <span className="text-xs font-bold tracking-wide">{label}</span>
        </motion.button>
    )
}
