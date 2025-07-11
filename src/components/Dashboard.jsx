import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Target, CheckCircle, Edit, Save, Plus, X, Zap } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardSchedule from '@/components/DashboardSchedule';
import LinkGrid from '@/components/LinkGrid';
import DailyVitals from '@/components/DailyVitals';
import QuickActions from '@/components/QuickActions';

const motivationalQuotes = [
    "The secret of getting ahead is getting started. - Mark Twain",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it."
];

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [statsKey, setStatsKey] = useState(Date.now());
  const [profile, setProfile] = useState(null);
  const [weeklyFocus, setWeeklyFocus] = useState([]);
  const [isEditingFocus, setIsEditingFocus] = useState(false);
  const [newFocus, setNewFocus] = useState('');
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username, full_name, weekly_focus')
      .eq('id', user.id)
      .maybeSingle();
    if (error) {
      console.error("Error fetching profile for dashboard", error);
    } else if (data) {
      setProfile(data);
      setWeeklyFocus(data.weekly_focus || []);
    }
  }, [user]);

  const fetchSchedule = useCallback(async () => {
    if (!user) return;
    const currentDay = new Date().getDay();
    const { data, error } = await supabase
      .from('schedule')
      .select('*, todos(*)') // Fetch related todos
      .eq('user_id', user.id)
      .eq('day_of_week', currentDay)
      .order('start_time');
    
    if (error) {
      toast({ title: "Error fetching schedule", description: error.message, variant: "destructive" });
      return;
    }

    const formattedSchedule = data.map(item => ({...item}));
    setSchedule(formattedSchedule);
  }, [user, toast]);
  
  useEffect(() => {
    fetchProfile();
    fetchSchedule();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    const profileListener = supabase.channel('realtime-dashboard-profile')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles', filter: `id=eq.${user?.id}`}, 
      (payload) => {
        fetchProfile();
      }).subscribe();
            
    const scheduleChannel = supabase.channel('realtime-schedule-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule', filter: `user_id=eq.${user?.id}`},
      () => {
        fetchSchedule();
      }).subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(profileListener);
      supabase.removeChannel(scheduleChannel);
    };
  }, [user, fetchSchedule, fetchProfile]);

  const handleUpdate = () => {
    fetchSchedule();
    setStatsKey(Date.now());
  };
  
  const updateFocusInDb = async (newFocusList) => {
    if (!user) return;
    const { error } = await supabase.from('user_profiles').update({ weekly_focus: newFocusList }).eq('id', user.id);
    if (error) {
        toast({ title: "Error saving focus list", description: error.message, variant: "destructive" });
    }
  }

  const handleSaveFocus = async () => {
    await updateFocusInDb(weeklyFocus);
    toast({ title: "✅ Focus list updated!" });
    setIsEditingFocus(false);
  };

  const addFocusItem = () => {
    if (newFocus.trim() && !weeklyFocus.includes(newFocus.trim())) {
      const updatedFocus = [...weeklyFocus, newFocus.trim()];
      setWeeklyFocus(updatedFocus);
      updateFocusInDb(updatedFocus);
      setNewFocus('');
    }
  };

  const removeFocusItem = (index) => {
    const updatedFocus = weeklyFocus.filter((_, i) => i !== index);
    setWeeklyFocus(updatedFocus);
    updateFocusInDb(updatedFocus);
  };
  
  const getCurrentTimeSlot = () => {
    if (schedule.length === 0) return null;
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    
    return schedule.find(s => {
       const [startHour, startMinute] = s.start_time.split(':');
       const [endHour, endMinute] = s.end_time.split(':');
       const start = parseInt(startHour) + parseInt(startMinute) / 60;
       const end = parseInt(endHour) + parseInt(endMinute) / 60;
       return currentHour >= start && currentHour < end;
    });
  };
  
  const currentTask = getCurrentTimeSlot();

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Explorer';

  return (
    <div className="space-y-8 flex flex-col h-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-display text-white mb-2 capitalize">
            {getGreeting()}, {displayName}!
          </h1>
        </div>
        {currentTask ? (
          <p className="text-lg text-muted-foreground">
            Current Focus: <span className="text-primary font-semibold text-glow">{currentTask.activity}</span>
          </p>
        ) : (
           <p className="text-lg text-muted-foreground">
            Nothing scheduled right now. Ready to <Link to="/app/planner"><Button variant="link" className="p-0 h-auto text-lg text-primary">plan your day?</Button></Link>
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        <div className="lg:col-span-2 space-y-8">
            <DashboardSchedule schedule={schedule} currentTime={currentTime} onUpdate={fetchSchedule}/>
            <LinkGrid isDashboardCard={true} />
        </div>
        
        <div className="space-y-8">
          <QuickActions key={`quick-actions-${statsKey}`} onUpdate={handleUpdate} />
          <DailyVitals key={`daily-vitals-${statsKey}`} />

          <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl font-bold text-glow flex items-center"><Target className="mr-2" /> Weekly Focus</h3>
              {isEditingFocus ? (
                <Button size="icon" variant="ghost" onClick={handleSaveFocus}><Save className="h-5 w-5 text-primary" /></Button>
              ) : (
                <Button size="icon" variant="ghost" onClick={() => setIsEditingFocus(true)}><Edit className="h-5 w-5" /></Button>
              )}
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {weeklyFocus.map((focus, index) => (
                <li key={index} className="flex items-center text-sm">
                  {isEditingFocus ? (
                    <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={() => removeFocusItem(index)}><X className="h-4 w-4 text-destructive" /></Button>
                  ) : (
                    <CheckCircle size={16} className="text-primary mr-3 flex-shrink-0" />
                  )}
                  <span>{focus}</span>
                </li>
              ))}
              {weeklyFocus.length === 0 && !isEditingFocus && (
                <p className="text-sm text-muted-foreground text-center py-2">Click edit to add your weekly focus.</p>
              )}
            </ul>
             {isEditingFocus && (
              <div className="flex items-center gap-2 pt-2">
                <Input value={newFocus} onChange={(e) => setNewFocus(e.target.value)} placeholder="New focus item..." className="h-8" onKeyPress={(e) => e.key === 'Enter' && addFocusItem()} />
                <Button size="icon" className="h-8 w-8" onClick={addFocusItem}><Plus className="h-4 w-4" /></Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div 
        className="mt-8 text-center glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Zap className="mx-auto h-8 w-8 text-yellow-400 mb-2" />
        <p className="text-lg italic text-muted-foreground">"{quote}"</p>
      </motion.div>
    </div>
  );
};

export default Dashboard;