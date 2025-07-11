import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Brain, Droplets, Wind, Smile, X, Pause, Play, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const TimerDisplay = ({ seconds, title, instructions, onPause, onResume, onQuit, isPaused }) => (
    <div className="text-center flex flex-col h-full">
        <div className="flex-grow">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground mb-6">{instructions}</p>
            <div className="text-8xl font-bold font-mono text-primary text-glow">
                {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
            </div>
        </div>
        <div className="flex justify-center items-center space-x-4 mt-8">
            <Button variant="outline" size="icon" onClick={isPaused ? onResume : onPause} className="w-16 h-16 rounded-full">
                {isPaused ? <Play size={24} /> : <Pause size={24} />}
            </Button>
            <Button variant="destructive" size="icon" onClick={onQuit} className="w-16 h-16 rounded-full">
                <X size={24} />
            </Button>
        </div>
    </div>
);

const QuickActions = ({ onUpdate }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [modal, setModal] = useState(null);
    const [waterAmount, setWaterAmount] = useState(250);
    const [mood, setMood] = useState(3);
    const [timer, setTimer] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const [sessionType, setSessionType] = useState(null);
    const [focusState, setFocusState] = useState('work');
    const [sessionSettings, setSessionSettings] = useState({
        focus: 45,
        break: 5,
        meditation: 10,
    });
    const [tempSettings, setTempSettings] = useState(sessionSettings);
    const timerIntervalRef = useRef(null);

    const fetchSettings = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase.from('user_profiles')
            .select('custom_focus_duration, custom_break_duration, custom_meditation_duration')
            .eq('id', user.id).single();
        if (data) {
            const newSettings = {
                focus: data.custom_focus_duration || 45,
                break: data.custom_break_duration || 5,
                meditation: data.custom_meditation_duration || 10,
            };
            setSessionSettings(newSettings);
            setTempSettings(newSettings);
        }
    }, [user]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const stopTimer = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    };
    
    const handleTimerEnd = useCallback(async () => {
        setIsTimerActive(false);
        if (sessionType === 'meditation') {
            await handleLogMetric('meditation_session', { duration: sessionSettings.meditation });
            toast({ title: "🧘‍♀️ Session Complete!", description: `You've completed a ${sessionSettings.meditation}-minute meditation.` });
            setModal(null);
        } else if (sessionType === 'focus' && focusState === 'work') {
            setFocusState('break');
            setTimer(sessionSettings.break * 60);
            setIsTimerActive(true);
            toast({ title: "🎉 Work Session Complete!", description: `Time for a ${sessionSettings.break}-minute break.` });
        } else if (sessionType === 'focus' && focusState === 'break') {
            await handleLogMetric('focus_session', { duration: sessionSettings.focus });
            toast({ title: "⚡ Focus Session Logged!", description: `Great work! You completed a ${sessionSettings.focus}-minute focus session.` });
            setModal(null);
        }
        if (onUpdate) onUpdate();
    }, [sessionType, sessionSettings, focusState, onUpdate, toast]);

    useEffect(() => {
        if (isTimerActive && !isTimerPaused) {
            timerIntervalRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        stopTimer();
                        handleTimerEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            stopTimer();
        }
        return stopTimer;
    }, [isTimerActive, isTimerPaused, handleTimerEnd]);

    const handleLogMetric = async (metric_type, value) => {
        if (!user) return;
        const { error } = await supabase.from('user_metrics').insert({ user_id: user.id, metric_type, value });
        if (error) {
            toast({ title: `Error logging ${metric_type.replace('_', ' ')}`, description: error.message, variant: 'destructive' });
        } else {
            toast({ title: `✅ ${metric_type.replace('_', ' ')} logged!` });
            setModal(null);
            if (onUpdate) onUpdate();
        }
    };

    const startTimer = (type) => {
        setSessionType(type);
        setModal('timer');
        setIsTimerPaused(false);
        if (type === 'meditation') {
            setTimer(sessionSettings.meditation * 60);
        } else if (type === 'focus') {
            setFocusState('work');
            setTimer(sessionSettings.focus * 60);
        }
        setIsTimerActive(true);
    };

    const quitSession = () => {
        setIsTimerActive(false);
        setTimer(0);
        setModal(null);
        toast({ title: 'Session cancelled', variant: 'destructive' });
    };

    const handleSaveSettings = async () => {
        if (!user) return;
        const { error } = await supabase.from('user_profiles').update({
            custom_focus_duration: tempSettings.focus,
            custom_break_duration: tempSettings.break,
            custom_meditation_duration: tempSettings.meditation,
        }).eq('id', user.id);

        if (error) {
            toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
        } else {
            setSessionSettings(tempSettings);
            setModal(null);
            toast({ title: '✅ Settings Saved!' });
        }
    };

    const actions = [
        { label: 'Start Focus Session', icon: Brain, color: 'from-blue-500 to-indigo-500', action: () => startTimer('focus') },
        { label: 'Log Water Intake', icon: Droplets, color: 'from-cyan-500 to-blue-500', action: () => setModal('water') },
        { label: 'Quick Meditation', icon: Wind, color: 'from-green-500 to-teal-500', action: () => startTimer('meditation') },
        { label: 'Mood Check-in', icon: Smile, color: 'from-yellow-500 to-orange-500', action: () => setModal('mood') }
    ];

    const moodEmojis = ['😔', '😕', '😐', '🙂', '😄'];

    const getTimerContent = () => {
        if (sessionType === 'meditation') return { title: `${sessionSettings.meditation}-Minute Meditation`, instructions: 'Close your eyes. Focus on your breath, in and out. If your mind wanders, gently bring it back.' };
        if (sessionType === 'focus' && focusState === 'work') return { title: `${sessionSettings.focus}-Minute Focus Session`, instructions: 'Eliminate distractions. Concentrate on your most important task. You can do this!' };
        if (sessionType === 'focus' && focusState === 'break') return { title: `${sessionSettings.break}-Minute Break`, instructions: 'Step away from your screen. Stretch, get some water, or look out a window.' };
        return { title: '', instructions: '' };
    };

    return (
        <>
            <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-display text-2xl font-bold text-glow">Quick Actions</h2>
                    <Button variant="ghost" size="icon" onClick={() => setModal('settings')}><Settings className="h-5 w-5" /></Button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar">
                    {actions.map((action, index) => (
                        <motion.button key={action.label} onClick={action.action} className={`w-full p-4 rounded-lg bg-gradient-to-r ${action.color} text-white font-medium flex items-center space-x-3 hover:shadow-lg transition-all`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <action.icon size={20} />
                            <span>{action.label}</span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            <Dialog open={modal === 'timer'} onOpenChange={(open) => !open && quitSession()}>
                <DialogContent className="h-[350px]">
                    <TimerDisplay seconds={timer} title={getTimerContent().title} instructions={getTimerContent().instructions} onPause={() => setIsTimerPaused(true)} onResume={() => setIsTimerPaused(false)} onQuit={quitSession} isPaused={isTimerPaused} />
                </DialogContent>
            </Dialog>

            <Dialog open={modal === 'water'} onOpenChange={() => setModal(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Log Water Intake</DialogTitle><DialogDescription>How much water did you drink?</DialogDescription></DialogHeader>
                    <div className="py-4 text-center"><div className="text-4xl font-bold text-primary mb-4">{waterAmount} ml</div><Slider defaultValue={[250]} max={1000} step={50} onValueChange={(value) => setWaterAmount(value[0])} /></div>
                    <DialogFooter><Button onClick={() => handleLogMetric('water_intake', { amount: waterAmount })}>Log Water</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={modal === 'mood'} onOpenChange={() => setModal(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Mood Check-in</DialogTitle><DialogDescription>How are you feeling right now?</DialogDescription></DialogHeader>
                    <div className="py-4 text-center"><div className="text-6xl mb-4">{moodEmojis[mood - 1]}</div><Slider defaultValue={[3]} min={1} max={5} step={1} onValueChange={(value) => setMood(value[0])} /></div>
                    <DialogFooter><Button onClick={() => handleLogMetric('mood', { rating: mood })}>Log Mood</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={modal === 'settings'} onOpenChange={() => { setModal(null); fetchSettings(); }}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Session Settings</DialogTitle><DialogDescription>Customize your session durations (in minutes).</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div><Label htmlFor="focus_duration">Focus Duration</Label><Input id="focus_duration" type="number" value={tempSettings.focus} onChange={(e) => setTempSettings(s => ({ ...s, focus: parseInt(e.target.value) || 0 }))} /></div>
                        <div><Label htmlFor="break_duration">Break Duration</Label><Input id="break_duration" type="number" value={tempSettings.break} onChange={(e) => setTempSettings(s => ({ ...s, break: parseInt(e.target.value) || 0 }))} /></div>
                        <div><Label htmlFor="meditation_duration">Meditation Duration</Label><Input id="meditation_duration" type="number" value={tempSettings.meditation} onChange={(e) => setTempSettings(s => ({ ...s, meditation: parseInt(e.target.value) || 0 }))} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveSettings}>Save Settings</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default QuickActions;