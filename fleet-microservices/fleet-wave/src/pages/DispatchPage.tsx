import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, MapPin, Truck, Trash2, Navigation } from 'lucide-react';
import { api, type Job, type Vehicle, type Driver } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function DispatchPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ pickup: '', destination: '' });
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

    const fetchData = async () => {
        // Fetch Jobs
        try {
            const jobsData = await api.dispatch.list();
            setJobs(jobsData.reverse());
        } catch (e) {
            console.error("Failed to fetch jobs", e);
        }

        // Fetch Vehicles
        try {
            const vehiclesData = await api.fleet.list();
            setVehicles(vehiclesData);
        } catch (e) {
            console.error("Failed to fetch vehicles", e);
        }

        // Fetch Drivers
        try {
            const driversData = await api.drivers.list();
            setDrivers(driversData);
        } catch (e) {
            console.error("Failed to fetch drivers", e);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleDispatch = async () => {
        if (!selectedVehicleId) return alert("Please select a vehicle");

        const vehicle = vehicles.find(v => v.id === selectedVehicleId);
        if (!vehicle) return;

        try {
            await api.dispatch.create({
                ...formData,
                vehicleId: vehicle.id,
                driverId: vehicle.assignedDriverId,
                status: 'PENDING'
            });
            setIsOpen(false);
            setFormData({ pickup: '', destination: '' });
            setSelectedVehicleId('');
            fetchData();
        } catch (e: any) {
            console.error("Dispatch Error:", e);
            let msg = e.response?.data?.message || e.message || "Unknown Error";
            if (typeof e.response?.data === 'string' && e.response.data) {
                msg = e.response.data;
            }
            alert("Dispatch Failed: " + msg);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Cancel this mission?")) return;
        try {
            await api.dispatch.delete(id);
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'secondary';
            case 'IN_PROGRESS': return 'info';
            case 'COMPLETED': return 'success';
            case 'NEEDS_ATTENTION': return 'destructive';
            case 'CANCELLED': return 'destructive';
            default: return 'outline';
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-heading">Mission Control</h1>
                    <p className="text-muted-foreground">Live operations board</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="glow" className="gap-2">
                                <Radio className="h-4 w-4" /> New Mission
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Dispatch Mission</DialogTitle>
                                <DialogDescription>Configure mission parameters.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Pickup Point</Label>
                                        <Input value={formData.pickup} onChange={e => setFormData({ ...formData, pickup: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Dropoff Point</Label>
                                        <Input value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Select Response Unit</Label>
                                    <div className="h-[200px] overflow-y-auto border rounded-md p-2 space-y-2 bg-slate-950/50">
                                        {vehicles.filter(v => v.status === 'AVAILABLE').length === 0 ? (
                                            <p className="text-center text-muted-foreground py-8">No available vehicles.</p>
                                        ) : (
                                            vehicles.filter(v => v.status === 'AVAILABLE').map(v => {
                                                const driver = drivers.find(d => d.id === v.assignedDriverId);
                                                return (
                                                    <div
                                                        key={v.id}
                                                        onClick={() => setSelectedVehicleId(v.id)}
                                                        className={cn(
                                                            "p-3 rounded border cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors",
                                                            selectedVehicleId === v.id ? "border-blue-500 bg-blue-500/10" : "border-white/10"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Truck className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <div className="font-medium text-sm">{v.plate} ({v.type})</div>
                                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    {driver ? (
                                                                        <>
                                                                            <span className="text-emerald-400">{driver.name}</span>
                                                                            {driver.location && (
                                                                                <span className="flex items-center gap-0.5 ml-1">
                                                                                    • <Navigation className="h-3 w-3" /> {driver.location}
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-amber-500">No Driver</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {selectedVehicleId === v.id && <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleDispatch}>Initialize Dispatch</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Feed Column */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold">Active Jobs</h2>
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {jobs.map((job) => (
                                <motion.div
                                    key={job.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group"
                                >
                                    <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors glass-card relative group/card">
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 ${job.status === 'COMPLETED' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-blue-500/50 bg-blue-500/10'}`}>
                                            <Truck className="h-5 w-5 opacity-80" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-mono text-xs text-muted-foreground">ID: {job.id.substring(0, 8)}</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={getStatusColor(job.status) as any}>{job.status}</Badge>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 text-muted-foreground hover:text-red-400 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(job.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm font-medium">
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-cyan-400" /> {job.pickup}</span>
                                                <span className="text-muted-foreground">→</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-purple-400" /> {job.destination}</span>
                                            </div>
                                            <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                                                <span>Vehicle: {job.vehicleId || 'Pending'}</span>
                                                <span>Driver: {job.driverId || 'Pending'}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {jobs.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-lg">
                                No active jobs. Standby.
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Column */}
                <div className="space-y-6">
                    <Card className="p-6 glass-card border-indigo-500/20">
                        <h3 className="text-sm font-medium text-indigo-300 mb-4">Operations Velocity</h3>
                        <div className="text-4xl font-bold mb-2">{jobs.filter(j => j.status === 'COMPLETED').length}</div>
                        <div className="text-xs text-muted-foreground">Jobs Completed Today</div>
                    </Card>

                    <Card className="p-6 glass-card">
                        <h3 className="text-lg font-semibold mb-4">Network Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Fleet Service</span>
                                <span className="text-emerald-500">Connected</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Driver Service</span>
                                <span className="text-emerald-500">Connected</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Dispatch Core</span>
                                <span className="text-emerald-500">Connected</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div >
    );
}
