import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Lock, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SignUpPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await signUp(email, password);
        if (!error) {
            toast({
                title: "Account Created!",
                description: "Please check your email to verify your account.",
            });
            navigate('/signin');
        }
        setLoading(false);
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col">
                <Header isAuthPage={true} />
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="w-full max-w-md" style={{ zIndex: 10 }}>
                        <motion.div
                            className="glass-card p-8 rounded-2xl border-primary/20 shadow-2xl shadow-primary/10"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-display text-white mt-4">Create Your Sanctuary</h1>
                                <p className="text-muted-foreground">Begin your journey of self-growth today.</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-muted-foreground">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input id="email" type="email" placeholder="you@example.com" required className="pl-10 bg-black/30 border-white/10 focus:border-primary focus:ring-primary" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-muted-foreground">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input id="password" type="password" placeholder="•••••••• (6+ characters)" required className="pl-10 bg-black/30 border-white/10 focus:border-primary focus:ring-primary" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full font-display tracking-wider" variant="glow" disabled={loading}>
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                    {!loading && <ArrowUpRight className="w-5 h-5 ml-2" />}
                                </Button>
                            </form>
                            <p className="mt-8 text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link to="/signin" className="font-semibold text-primary hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </motion.div>
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
};

export default SignUpPage;