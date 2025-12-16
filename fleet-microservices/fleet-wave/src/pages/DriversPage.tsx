import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, User, Star, MapPin, Edit2 } from 'lucide-react';
import { api, type Driver } from '@/lib/api';
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

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true); // Added missing state
    const [isOpen, setIsOpen] = useState(false);
    const [isLocOpen, setIsLocOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [formData, setFormData] = useState({ id: '', name: '', licenseClass: 'C', rating: 5 });
    const [locData, setLocData] = useState({ location: '', destination: '' });

    const fetchDrivers = async () => {
        try {
            const data = await api.drivers.list();
            setDrivers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
        const interval = setInterval(fetchDrivers, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSave = async () => {
        if (selectedDriver && isOpen) {
            // Update
            await api.drivers.updateDetails(selectedDriver.id, formData);

            // Fix: Also update Auth credentials in case they are out of sync
            // This ensures Password always equals Driver ID
            try {
                await api.auth.provisionDriver({
                    username: formData.name.replace(/\s+/g, '').toLowerCase(),
                    passwordHash: selectedDriver.id, // Ensure password matches ID
                    driverId: selectedDriver.id
                });
                alert("Credentials updated successfully! Login with ID: " + selectedDriver.id);
            } catch (e) {
                console.error("Failed to sync credentials", e);
                alert("Failed to sync credentials. Please try again.");
            }
        } else {
            // Create Driver & Provision User
            if (!formData.id.trim()) {
                alert("Driver ID is mandatory.");
                return;
            }

            // 1. Create Driver (with custom ID)
            await api.drivers.create({
                id: formData.id, // Custom ID from Admin
                name: formData.name,
                licenseClass: formData.licenseClass,
                rating: formData.rating,
                availability: true
            });

            // 2. Provision Login (Username = Name, Password = DriverID)
            try {
                await api.auth.provisionDriver({
                    username: formData.name.replace(/\s+/g, '').toLowerCase(), // Normalize username
                    passwordHash: formData.id, // ID as password
                    driverId: formData.id
                });
            } catch (e) {
                console.error("Failed to provision auth user", e);
                alert("Driver created, but login provisioning failed. ID might be duplicates.");
            }
        }
        setIsOpen(false);
        setFormData({ id: '', name: '', licenseClass: 'C', rating: 5 });
        setSelectedDriver(null);
        fetchDrivers();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Terminate contract?")) return;
        await api.drivers.delete(id);
        fetchDrivers();
    };

    const handleUpdateLocation = async () => {
        if (selectedDriver) {
            await api.drivers.updateLocation(selectedDriver.id, locData.location, locData.destination);
            setIsLocOpen(false);
            setLocData({ location: '', destination: '' });
            fetchDrivers();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-heading">Driver Roster</h1>

                {/* Recruit Driver Dialog */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <Button
                        variant="glow"
                        className="gap-2"
                        onClick={() => {
                            setSelectedDriver(null);
                            setFormData({ id: '', name: '', licenseClass: 'C', rating: 5 });
                            setIsOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4" /> Recruit Driver
                    </Button>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedDriver ? 'Edit Driver' : 'New Driver Contract'}</DialogTitle>
                            <DialogDescription>Enter driver credentials.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Driver ID (Login Password) <span className="text-red-400">*</span></Label>
                                <Input
                                    placeholder="e.g. D-101"
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    disabled={!!selectedDriver}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Full Name (Username)</Label>
                                <Input
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>License Class</Label>
                                <Input
                                    placeholder="A, B, C..."
                                    value={formData.licenseClass}
                                    onChange={(e) => setFormData({ ...formData, licenseClass: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}>{selectedDriver ? 'Update Contract' : 'Sign Contract'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Update Location Dialog */}
                <Dialog open={isLocOpen} onOpenChange={setIsLocOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Location</DialogTitle>
                            <DialogDescription>Update current position and destination for {selectedDriver?.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Current Location</Label>
                                <Input
                                    placeholder="e.g. Depot A"
                                    value={locData.location}
                                    onChange={(e) => setLocData({ ...locData, location: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Destination</Label>
                                <Input
                                    placeholder="e.g. Zone 5"
                                    value={locData.destination}
                                    onChange={(e) => setLocData({ ...locData, destination: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpdateLocation}>Update Status</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search drivers..." className="pl-9 bg-slate-900/50 border-white/10" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map((d) => (
                    <motion.div
                        key={d.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="p-6 space-y-4 relative overflow-hidden group glass-card">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:bg-blue-500/10" onClick={() => {
                                        setSelectedDriver(d);
                                        setFormData({ id: d.id, name: d.name || '', licenseClass: d.licenseClass || '', rating: d.rating || 5 });
                                        setIsOpen(true);
                                    }}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(d.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center relative">
                                    <User className="h-8 w-8 text-muted-foreground" />
                                    <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-slate-900 ${d.availability ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{d.name}</h3>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Badge variant="outline" className="text-xs">{d.licenseClass}</Badge>
                                        <span className="flex items-center text-yellow-500">
                                            <Star className="h-3 w-3 fill-current mr-1" /> {d.rating}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge variant={d.availability ? 'success' : 'warning'}>
                                    {d.status || (d.availability ? 'AVAILABLE' : 'BUSY')}
                                </Badge>
                            </div>

                            {/* Location Info */}
                            {(d.location || d.destination) && (
                                <div className="text-xs text-muted-foreground space-y-1">
                                    {d.location && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Loc: {d.location}</div>}
                                    {d.destination && <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-cyan-400" /> Dest: {d.destination}</div>}
                                </div>
                            )}

                            {/* V2 Actions */}
                            <div className="flex flex-col gap-2 pt-2">
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-xs border-amber-500/50 hover:bg-amber-500/10 text-amber-500"
                                        onClick={async () => {
                                            if (!confirm("Mark as On Leave?")) return;
                                            await api.drivers.applyLeave(d.id);
                                            fetchDrivers();
                                        }}
                                    >
                                        Leave
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-xs border-red-500/50 hover:bg-red-500/10 text-red-500"
                                        onClick={async () => {
                                            if (!confirm("RAISE EMERGENCY?")) return;
                                            await api.drivers.raiseEmergency(d.id);
                                            fetchDrivers();
                                        }}
                                    >
                                        Emergency
                                    </Button>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="w-full text-xs"
                                    onClick={() => {
                                        setSelectedDriver(d);
                                        setIsLocOpen(true);
                                    }}
                                >
                                    Update Location
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
