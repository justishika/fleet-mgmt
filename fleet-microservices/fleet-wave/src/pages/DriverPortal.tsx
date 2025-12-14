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
                if (!statusLoc) setStatusLoc(me.location); // Only set init
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
        // Toast notification would be better here, but alert is fine for now
        // alert('Location Updated'); 
    };

    const handleJobAction = async (action: 'arrive' | 'stop') => {
        if (!activeJob) return;
        if (action === 'arrive') {
            await api.dispatch.markArrival(activeJob.id);
        }
        fetchData();
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
                <Navigation className="w-12 h-12 text-blue-500" />
            </motion.div>
            <p className="text-slate-500 font-medium">Connecting to FleetWave...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Access Error</h2>
            <p className="text-slate-400 mb-8 max-w-xs mx-auto">{error}</p>
            <Button
                onClick={() => { localStorage.clear(); navigate('/login'); }}
                className="bg-slate-800 hover:bg-slate-700 text-white"
            >
                Return to Login
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col relative overflow-hidden">

            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
            </div>

            {/* Navbar */}
            <header className="p-4 px-6 flex items-center justify-between z-10 sticky top-0 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Truck className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight font-heading">FleetWave</h1>
                        <p className="text-xs text-blue-400 font-medium tracking-wide">DRIVER PORTAL</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-medium">{driver?.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">ID: {driver?.id.substring(0, 6)}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { localStorage.clear(); navigate('/'); }}
                        className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
                    >
                        <Power className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 max-w-lg mx-auto w-full z-10 space-y-6 pb-24">

                {/* Welcome / Status Summary */}
                <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                            <UserCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Welcome back,</p>
                            <h2 className="text-xl font-bold">{driver?.name.split(' ')[0]}</h2>
                        </div>
                    </div>
                    <Badge
                        className={cn(
                            "px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-0",
                            driver?.status === 'EMERGENCY' ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40" :
                                driver?.availability ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                    "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        )}
                    >
                        {driver?.status || (driver?.availability ? 'ONLINE' : 'BUSY')}
                    </Badge>
                </div>

                {/* Status Actions */}
                <Card className="p-1 bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl rounded-2xl">
                    <div className="grid grid-cols-3 gap-1 p-1">
                        <ActionButton
                            active={driver?.availability && driver?.status !== 'EMERGENCY'}
                            onClick={() => handleStatusUpdate('Available')}
                            icon={<CheckCircle className="w-5 h-5" />}
                            label="Ready"
                            color="bg-emerald-500"
                        />
                        <ActionButton
                            active={!driver?.availability && driver?.status !== 'EMERGENCY'}
                            onClick={() => handleStatusUpdate('Leave')}
                            icon={<Coffee className="w-5 h-5" />}
                            label="Break"
                            color="bg-amber-500"
                        />
                        <ActionButton
                            active={driver?.status === 'EMERGENCY'}
                            onClick={() => handleStatusUpdate('Emergency')}
                            icon={<AlertTriangle className="w-5 h-5" />}
                            label="SOS"
                            color="bg-red-500"
                            danger
                        />
                    </div>
                </Card>

                {/* Active Mission */}
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest pl-1 pt-2">Current Mission</h3>
                <AnimatePresence mode='wait'>
                    {activeJob ? (
                        <motion.div
                            key="job"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-b from-blue-900/20 to-slate-900/40 backdrop-blur-md relative group">
                                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />

                                <div className="p-6 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-2 text-blue-400">
                                            <Navigation className="w-5 h-5" />
                                            <span className="font-bold tracking-tight">MISSION #{activeJob.id.substring(0, 4)}</span>
                                        </div>
                                        <Badge variant="outline" className="border-blue-500/30 text-blue-300 bg-blue-500/10">
                                            IN PROGRESS
                                        </Badge>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="relative pl-4 border-l-2 border-slate-700/50 space-y-8">
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-900" />
                                                <p className="text-xs text-slate-500 uppercase mb-1">Pickup Location</p>
                                                <p className="font-medium text-lg leading-none">{activeJob.pickup}</p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                <p className="text-xs text-blue-400 uppercase mb-1">Destination</p>
                                                <p className="font-medium text-lg text-white leading-none">{activeJob.destination}</p>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 shadow-lg shadow-blue-900/20"
                                            onClick={() => handleJobAction('arrive')}
                                        >
                                            Confirm Arrival
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="no-job"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Card className="p-10 border-dashed border-2 border-slate-800 bg-slate-900/20 backdrop-blur-sm flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                                    <Truck className="w-8 h-8 text-slate-600" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-300 mb-1">No Active Missions</h3>
                                <p className="text-slate-500 text-sm max-w-[200px]">You are currently standby. Wait for dispatch to assign a route.</p>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Location Update */}
                <div className="pt-2">
                    <Card className="p-4 bg-slate-900/40 backdrop-blur-md border-white/5">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    value={statusLoc}
                                    onChange={(e) => setStatusLoc(e.target.value)}
                                    placeholder="Update your location..."
                                    className="pl-9 bg-slate-950/50 border-white/10 focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                            <Button
                                size="icon"
                                onClick={handleLocationUpdate}
                                className="bg-slate-800 hover:bg-blue-600 hover:text-white transition-colors"
                            >
                                <Navigation className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                </div>

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
