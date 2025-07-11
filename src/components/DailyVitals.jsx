import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Droplets, Smile, Brain, Wind } from 'lucide-react';

const DailyVitals = () => {
  const { user } = useAuth();
  const [vitals, setVitals] = useState({ water: 0, mood: null, focusSessions: 0, meditationSessions: 0 });

  useEffect(() => {
    const fetchVitals = async () => {
      if (!user) return;

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data, error } = await supabase
        .from('user_metrics')
        .select('metric_type, value, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching daily vitals:", error);
        return;
      }

      let totalWater = 0;
      let latestMood = null;
      let focusCount = 0;
      let meditationCount = 0;

      for (const metric of data) {
        if (metric.metric_type === 'water_intake') {
          totalWater += metric.value.amount;
        }
        if (metric.metric_type === 'mood' && !latestMood) {
          latestMood = metric.value.rating;
        }
        if (metric.metric_type === 'focus_session') {
          focusCount++;
        }
        if (metric.metric_type === 'meditation_session') {
          meditationCount++;
        }
      }
      setVitals({ water: totalWater, mood: latestMood, focusSessions: focusCount, meditationSessions: meditationCount });
    };

    fetchVitals();
    
    const channel = supabase.channel('realtime-vitals')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_metrics', filter: `user_id=eq.${user?.id}` }, fetchVitals)
      .subscribe();

    return () => supabase.removeChannel(channel);

  }, [user]);

  const moodEmojis = ['😔', '😕', '😐', '🙂', '😄'];

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="font-display text-2xl font-bold text-glow mb-6">
        Daily Vitals
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
            <Droplets className="text-white" size={24} />
          </div>
          <div className="text-2xl font-bold text-glow">{vitals.water} ml</div>
          <p className="text-sm opacity-75">Water Intake</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
            <Smile className="text-white" size={24} />
          </div>
          <div className="text-4xl">{vitals.mood ? moodEmojis[vitals.mood - 1] : '-'}</div>
          <p className="text-sm opacity-75">Current Mood</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
            <Brain className="text-white" size={24} />
          </div>
          <div className="text-2xl font-bold text-glow">{vitals.focusSessions}</div>
          <p className="text-sm opacity-75">Focus Sessions</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
            <Wind className="text-white" size={24} />
          </div>
          <div className="text-2xl font-bold text-glow">{vitals.meditationSessions}</div>
          <p className="text-sm opacity-75">Meditations</p>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyVitals;