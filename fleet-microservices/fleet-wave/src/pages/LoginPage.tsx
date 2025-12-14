import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '@/services/auth';
import { Lock, User, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LoginPage = () => {
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'admin';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (role === 'driver') {
            setUsername('driver');
            setPassword('driver');
        } else {
            setUsername('admin@fleetwave.io');
            setPassword('admin123');
        }
    }, [role]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const finalUsername = role === 'driver' ? username.replace(/\s+/g, '').toLowerCase() : username;
            const response = await login({ username: finalUsername, password });
            if (role === 'driver') {
                // Store the actual driverId returned by the backend
                localStorage.setItem('driverId', response.driverId);
                navigate('/driver');
            } else {
                navigate('/admin');
            }
        } catch (err) {
            setError('Invalid credentials. Try admin@fleetwave.io/admin123');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[url('https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=3432&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />

            <div className="relative z-10 w-full max-w-md p-8 space-y-6 glass-panel rounded-2xl animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                        {role === 'driver' ? <Truck className="w-6 h-6 text-emerald-400" /> : <Shield className="w-6 h-6 text-blue-400" />}
                    </div>
                    <h1 className="text-3xl font-bold font-heading">
                        {role === 'driver' ? 'Driver Portal' : 'Command Center'}
                    </h1>
                    <p className="text-slate-400">Sign in to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-900 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-10 bg-slate-800/50 border-white/10"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 bg-slate-800/50 border-white/10"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className={`w-full font-bold ${role === 'driver' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                        Access Dashboard
                    </Button>

                    <div className="text-center text-xs text-slate-500 mt-4">
                        <button type="button" onClick={() => navigate('/')} className="hover:text-white underline">
                            &larr; Back to Landing
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
