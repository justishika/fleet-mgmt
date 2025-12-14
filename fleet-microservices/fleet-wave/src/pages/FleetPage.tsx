import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Truck, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api, type Vehicle } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

export default function FleetPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [assignDriverId, setAssignDriverId] = useState('');
    const [formData, setFormData] = useState({ plate: '', type: 'Sedan', lastLocation: 'HQ', assignedDriverId: '' });

    const [drivers, setDrivers] = useState<any[]>([]);

    const fetchVehicles = async () => {
        try {
            const data = await api.fleet.list();
            setVehicles(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            const data = await api.drivers.list();
            setDrivers(data);
        } catch (e) {
            console.error(e);
        }
    };



    useEffect(() => {
        fetchVehicles();
        fetchDrivers();
        const interval = setInterval(() => {
            fetchVehicles();
            fetchDrivers();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSave = async () => {
        try {
            let savedVehicle: Vehicle;

            if (selectedVehicle) {
                // Update basic info
                // Update vehicle with all details including driver
                savedVehicle = await api.fleet.update(selectedVehicle.id, {
                    plate: formData.plate,
                    type: formData.type,
                    lastLocation: formData.lastLocation,
                    assignedDriverId: formData.assignedDriverId, // Send driver ID directly
                    status: selectedVehicle.status // Required by backend validation
                });

                // (Old separate assignment logic removed to prevent double-calls and verification errors)
            } else {
                // Create
                savedVehicle = await api.fleet.create({
                    ...formData,
                    status: 'AVAILABLE',
                    health: 'GOOD'
                });

                // Assign driver if selected during creation
                if (formData.assignedDriverId) {
                    await api.fleet.assignDriver(savedVehicle.id, formData.assignedDriverId);
                }
            }

            setIsOpen(false);
            setFormData({ plate: '', type: 'Sedan', lastLocation: 'HQ', assignedDriverId: '' });
            setSelectedVehicle(null);
            fetchVehicles();
        } catch (error) {
            console.error("Failed to save vehicle:", error);
            alert("Failed to save vehicle. Check console for details.");
        }
    };

    // ... (rest of code)


    const handleDelete = async (id: string) => {
        if (!confirm("Decommission this vehicle?")) return;
        await api.fleet.delete(id);
        fetchVehicles();
    };

    const handleAssignDriver = async () => {
        if (selectedVehicle && assignDriverId) {
            await api.fleet.assignDriver(selectedVehicle.id, assignDriverId);
            setIsAssignOpen(false);
            setAssignDriverId('');
            fetchVehicles();
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'success';
            case 'IN_TRANSIT': return 'info';
            case 'MAINTENANCE': return 'destructive';
            default: return 'secondary';
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-heading">Fleet Management</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="glow" className="gap-2" onClick={() => {
                            setSelectedVehicle(null);
                            setFormData({ plate: '', type: 'Sedan', lastLocation: 'HQ', assignedDriverId: '' });
                        }}>
                            <Plus className="h-4 w-4" /> Add Vehicle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedVehicle ? 'Update Vehicle' : 'Register New Vehicle'}</DialogTitle>
                            <DialogDescription>Enter the vehicle details to {selectedVehicle ? 'update' : 'add'} it.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>License Plate</Label>
                                <Input
                                    placeholder="e.g. ABC-123"
                                    value={formData.plate}
                                    onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Vehicle Type</Label>
                                <Input
                                    placeholder="Sedan, Truck, Van..."
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Initial Location</Label>
                                <Input
                                    placeholder="Depot Name"
                                    value={formData.lastLocation}
                                    onChange={(e) => setFormData({ ...formData, lastLocation: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Assign Driver</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.assignedDriverId}
                                    onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                                >
                                    <option value="" className="bg-slate-900 text-white">-- No Driver Assigned --</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                                            {d.name} ({d.status})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}>{selectedVehicle ? 'Update Vehicle' : 'Register Vehicle'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Assign Driver</DialogTitle>
                            <DialogDescription>Select a driver for vehicle {selectedVehicle?.plate}</DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[300px] overflow-y-auto py-4 space-y-2">
                            {/* Ideally we filter for drivers NOT assigned or check availability */}
                            {drivers.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No available drivers found.</p>
                            ) : (
                                drivers.map(d => (
                                    <div key={d.id}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-white/5 transition-colors",
                                            assignDriverId === d.id ? "border-blue-500 bg-blue-500/10" : "border-white/10"
                                        )}
                                        onClick={() => setAssignDriverId(d.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("h-3 w-3 rounded-full", d.availability ? "bg-emerald-500" : "bg-amber-500")} />
                                            <div>
                                                <p className="font-medium">{d.name}</p>
                                                <p className="text-xs text-muted-foreground">Class {d.licenseClass} • Rating {d.rating}</p>
                                            </div>
                                        </div>
                                        {assignDriverId === d.id && <div className="text-blue-500 font-bold text-sm">Selected</div>}
                                    </div>
                                ))
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAssignDriver} disabled={!assignDriverId}>Confirm Assignment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Fleet', val: vehicles.length, color: 'text-blue-400' },
                    { label: 'Available', val: vehicles.filter(v => v.status === 'AVAILABLE').length, color: 'text-emerald-400' },
                    { label: 'En Route', val: vehicles.filter(v => v.status === 'BUSY').length, color: 'text-amber-400' },
                    { label: 'Maintenance', val: vehicles.filter(v => v.status === 'MAINTENANCE').length, color: 'text-red-400' },
                ].map((stat, i) => (
                    <Card key={i} className="p-4 glass-card flex flex-col justify-between">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        <span className={cn("text-3xl font-bold mt-2", stat.color)}>{stat.val}</span>
                    </Card>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search vehicles..." className="pl-9 bg-slate-900/50 border-white/10" />
                </div>
            </div>

            {/* Table */}
            <Card className="overflow-hidden glass-panel">
                <Table>
                    <TableHeader className="bg-slate-900/60">
                        <TableRow className="border-white/5 hover:bg-slate-900/60">
                            <TableHead>Plate ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Assigned Driver</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vehicles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                                    {loading ? "Scanning Fleet..." : "No vehicles found."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            vehicles.map((v) => (
                                <motion.tr
                                    key={v.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-white/5 hover:bg-white/5 transition-colors group"
                                >
                                    <TableCell className="font-mono font-medium">{v.plate}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-muted-foreground" />
                                            {v.type}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(v.status) as any}>
                                            {v.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{v.lastLocation}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {v.assignedDriverId ? (
                                            <span className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-white/10">
                                                    {(drivers.find(d => d.id === v.assignedDriverId)?.name || '?').charAt(0)}
                                                </div>
                                                {drivers.find(d => d.id === v.assignedDriverId)?.name || v.assignedDriverId}
                                            </span>
                                        ) : (
                                            <Button
                                                variant="link"
                                                className="h-auto p-0 text-xs text-blue-400"
                                                onClick={() => {
                                                    setSelectedVehicle(v);
                                                    setIsAssignOpen(true);
                                                }}
                                            >
                                                + Assign
                                            </Button>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-blue-400 hover:bg-blue-500/10"
                                                onClick={() => {
                                                    setSelectedVehicle(v);
                                                    setFormData({
                                                        plate: v.plate,
                                                        type: v.type,
                                                        lastLocation: v.lastLocation,
                                                        assignedDriverId: v.assignedDriverId || ''
                                                    });
                                                    setIsOpen(true);
                                                }}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                                onClick={() => handleDelete(v.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
