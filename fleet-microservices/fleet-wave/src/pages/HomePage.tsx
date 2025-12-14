import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, ShieldCheck, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomePage() {
    const navigate = useNavigate();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-16 py-10">
            {/* Hero Section */}
            <section className="text-center space-y-8 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full -z-10" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        v2.0 Enterprise Release
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl md:text-7xl font-bold font-heading tracking-tight"
                >
                    Enterprise <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-pulse">
                        Fleet Orchestration
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                >
                    Seamlessly coordinate your entire logistics network. From real-time telemetry and automated dispatch assignments to predictive maintenance and driver performance analytics—FleetWave empowers your operations to scale with precision.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-4"
                >
                    <Button size="lg" variant="glow" onClick={() => navigate('/dispatch')} className="h-14 px-8 text-lg gap-2">
                        Launch Console <ArrowRight className="h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="ghost" className="h-14 px-8 text-lg">
                        View Documentation
                    </Button>
                </motion.div>
            </section>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <motion.div variants={item}>
                    <Card className="p-6 space-y-4 hover:-translate-y-2 transition-transform duration-300">
                        <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Globe className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">Live Telemetry</h3>
                            <p className="text-muted-foreground mt-2">Real-time GPS tracking, fuel consumption, and engine diagnostics for 500+ vehicle types.</p>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="p-6 space-y-4 hover:-translate-y-2 transition-transform duration-300">
                        <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">Compliance & Safety</h3>
                            <p className="text-muted-foreground mt-2">Automated HOS (Hours of Service) logging, digital contracts, and incident reporting.</p>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="p-6 space-y-4 hover:-translate-y-2 transition-transform duration-300">
                        <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Activity className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">Intelligent Dispatch</h3>
                            <p className="text-muted-foreground mt-2">AI-driven route optimization and dynamic load balancing for maximum efficiency.</p>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
