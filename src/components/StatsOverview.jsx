import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Flame, CheckCircle, Target } from 'lucide-react';

const StatsOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    current_streak: 0,
    tasks_completed: 0,
    goals_completed: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('current_streak, tasks_completed')
        .eq('id', user.id)
        .maybeSingle(); 
      
      const { count: goalsCount, error: goalsError } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (error) {
        console.error("Error fetching user profile:", error);
      } else if (data) {
        setStats(prev => ({ ...prev, ...data, goals_completed: goalsCount || 0 }));
      }
    };

    fetchProfile();
    
    const channel = supabase.channel('realtime-profile-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles', filter: `id=eq.${user?.id}` }, (payload) => {
        if (payload.new) {
            setStats(prev => ({...prev, ...payload.new}));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user?.id}`}, () => fetchProfile())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${user?.id}`}, () => fetchProfile())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [user]);

  const statCards = [
    {
      label: 'Current Streak',
      value: `${stats.current_streak || 0} days`,
      icon: Flame,
      color: 'from-red-500 to-pink-500'
    },
    {
      label: 'Tasks Done',
      value: stats.tasks_completed || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-teal-500'
    },
    {
      label: 'Goals Achieved',
      value: stats.goals_completed || 0,
      icon: Target,
      color: 'from-primary to-purple-600'
    }
  ];

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="font-display text-2xl font-bold text-glow mb-6">
        <i className="fas fa-chart-bar mr-3"></i>
        Your Progress
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="glass-card p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
              <stat.icon className="text-white" size={24} />
            </div>
            <motion.div
              className="text-2xl font-bold text-glow"
              key={stat.value}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {stat.value}
            </motion.div>
            <p className="text-sm opacity-75">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StatsOverview;