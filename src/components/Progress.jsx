import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { CheckSquare, Brain, Droplets, Smile, Clock, BookOpen, Target, CalendarCheck2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const Progress = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tasks_completed: 0, focus_sessions_completed: 0, total_focus_minutes: 0, media_completed: 0, goals_completed: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [waterData, setWaterData] = useState([]);
  const [mediaTypeData, setMediaTypeData] = useState([]);
  const [scheduleCompletionData, setScheduleCompletionData] = useState([]);
  const [categoryFocusData, setCategoryFocusData] = useState([]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const fetchProgressData = useCallback(async () => {
    if (!user) return;

    const today = new Date();
    const sevenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // --- Overall Stats ---
    const { data: profileData } = await supabase.from('user_profiles').select('tasks_completed, focus_sessions_completed, total_focus_minutes').eq('id', user.id).single();
    const { count: mediaCount } = await supabase.from('media_content').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_completed', true);
    const { count: goalsCount } = await supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed');
    if (profileData) setStats(prev => ({ ...prev, ...profileData, media_completed: mediaCount || 0, goals_completed: goalsCount || 0 }));

    // --- Weekly Performance (Todos & Focus) ---
    let performance = Array(7).fill(0).map((_, i) => {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        return { name: daysOfWeek[d.getDay()], 'Tasks Completed': 0, 'Focus Hours': 0 };
    });
    const { data: todoData } = await supabase.from('todos').select('completed_at').eq('user_id', user.id).eq('completed', true).gte('completed_at', sevenDaysAgo.toISOString());
    if (todoData) {
        todoData.forEach(task => {
            const dayIndex = new Date(task.completed_at).getDay();
            const performanceIndex = performance.findIndex(p => p.name === daysOfWeek[dayIndex]);
            if(performanceIndex > -1) performance[performanceIndex]['Tasks Completed'] += 1;
        });
    }
    const { data: focusData } = await supabase.from('focus_sessions').select('completed_at, duration_minutes').eq('user_id', user.id).gte('completed_at', sevenDaysAgo.toISOString());
    if(focusData) {
      focusData.forEach(session => {
        const dayIndex = new Date(session.completed_at).getDay();
        const performanceIndex = performance.findIndex(p => p.name === daysOfWeek[dayIndex]);
        if(performanceIndex > -1) performance[performanceIndex]['Focus Hours'] += session.duration_minutes / 60;
      });
    }
    setWeeklyData(performance);

    // --- Metrics (Mood & Water) ---
    const { data: metricsData } = await supabase.from('user_metrics').select('metric_type, value, created_at').eq('user_id', user.id).gte('created_at', sevenDaysAgo.toISOString());
    if (metricsData) {
      const moodCounts = [{ name: '😔', value: 0 }, { name: '😕', value: 0 }, { name: '😐', value: 0 }, { name: '🙂', value: 0 }, { name: '😄', value: 0 }];
      const dailyWater = {};
      metricsData.forEach(metric => {
        const date = new Date(metric.created_at).toLocaleDateString('en-CA');
        if (metric.metric_type === 'mood') moodCounts[metric.value.rating - 1].value += 1;
        if (metric.metric_type === 'water_intake') {
          if (!dailyWater[date]) dailyWater[date] = 0;
          dailyWater[date] += metric.value.amount;
        }
      });
      setMoodData(moodCounts.filter(m => m.value > 0));
      setWaterData(Object.entries(dailyWater).map(([date, amount]) => ({ date, amount })));
    }

    // --- Media Consumption ---
    const { data: mediaTypes } = await supabase.from('media_content').select('category').eq('user_id', user.id).eq('is_completed', true);
    if (mediaTypes) {
        const counts = mediaTypes.reduce((acc, { category }) => {
            const cat = category || 'Uncategorized';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});
        setMediaTypeData(Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));
    }

    // --- Schedule Completion ---
    const { data: scheduleData } = await supabase.from('schedule').select('completed').eq('user_id', user.id);
    if (scheduleData) {
        const completed = scheduleData.filter(s => s.completed).length;
        const pending = scheduleData.length - completed;
        setScheduleCompletionData([{ name: 'Completed', value: completed }, { name: 'Pending', value: pending }]);
    }

    // --- Focus Area by Category ---
    const { data: scheduleCategories } = await supabase.from('schedule').select('category, start_time, end_time').eq('user_id', user.id);
    if (scheduleCategories) {
        const categoryDurations = scheduleCategories.reduce((acc, event) => {
            const start = new Date(`1970-01-01T${event.start_time}Z`);
            const end = new Date(`1970-01-01T${event.end_time}Z`);
            const duration = (end - start) / (1000 * 60); // duration in minutes
            const cat = event.category || 'Uncategorized';
            acc[cat] = (acc[cat] || 0) + duration;
            return acc;
        }, {});
        setCategoryFocusData(Object.entries(categoryDurations).map(([subject, value]) => ({ subject, A: value, fullMark: 240 })));
    }

  }, [user]);

  useEffect(() => {
    fetchProgressData();
    const channel = supabase.channel('realtime-progress')
      .on('postgres_changes', { event: '*', schema: 'public' }, fetchProgressData)
      .subscribe();
    
    return () => supabase.removeChannel(channel);
  }, [user, fetchProgressData]);

  const overallStats = [
    { label: 'Tasks Done', value: stats.tasks_completed, icon: <CheckSquare /> },
    { label: 'Focus Sessions', value: stats.focus_sessions_completed, icon: <Clock /> },
    { label: 'Media Finished', value: stats.media_completed, icon: <BookOpen /> },
    { label: 'Goals Achieved', value: stats.goals_completed, icon: <Target /> }
  ];

  const MOOD_COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#5f27cd'];
  const MEDIA_COLORS = ['#814AC8', '#4ecdc4', '#ff9f43', '#f368e0', '#0abde3'];
  const SCHEDULE_COLORS = ['#1dd1a1', '#ff6b6b'];
  
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-4xl font-bold text-glow mb-2">Progress Analytics</h1>
        <p className="text-lg opacity-75">Track your wellness journey with detailed insights</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {overallStats.map((stat, index) => (
          <motion.div key={stat.label} className="glass-card p-6 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.05 }}>
            <div className="text-primary mb-2">{React.cloneElement(stat.icon, { size: 32 })}</div>
            <div className="text-3xl font-bold text-glow">{stat.value}</div>
            <p className="text-sm opacity-75">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="glass-card p-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="font-display text-2xl font-bold text-glow mb-6">Weekly Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(23, 23, 25, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
              <Legend />
              <Line type="monotone" dataKey="Tasks Completed" stroke="#814AC8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Focus Hours" stroke="#4ecdc4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        
        <motion.div className="glass-card p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="font-display text-2xl font-bold text-glow mb-6 flex items-center"><Droplets className="mr-2"/>Hydration Tracker</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(23, 23, 25, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
              <Bar dataKey="amount" fill="#4ecdc4" name="Water (ml)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card p-6 flex flex-col items-center" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="font-display text-2xl font-bold text-glow mb-6 flex items-center"><Smile className="mr-2"/>Mood Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={moodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {moodData.map((entry, index) => <Cell key={`cell-${index}`} fill={MOOD_COLORS[index % MOOD_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(23, 23, 25, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card p-6 flex flex-col items-center" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="font-display text-2xl font-bold text-glow mb-6 flex items-center"><BookOpen className="mr-2"/>Content Consumption</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={mediaTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                {mediaTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={MEDIA_COLORS[index % MEDIA_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(23, 23, 25, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card p-6 flex flex-col items-center" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="font-display text-2xl font-bold text-glow mb-6 flex items-center"><CalendarCheck2 className="mr-2"/>Schedule Adherence</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={scheduleCompletionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {scheduleCompletionData.map((entry, index) => <Cell key={`cell-${index}`} fill={SCHEDULE_COLORS[index % SCHEDULE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(23, 23, 25, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card p-6 flex flex-col items-center" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="font-display text-2xl font-bold text-glow mb-6 flex items-center"><Brain className="mr-2"/>Focus Areas (Time Allocation)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryFocusData}>
              <PolarGrid stroke="rgba(255,255,255,0.2)" />
              <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.7)" />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 60']} tick={false} axisLine={false} />
              <Radar name="Time (minutes)" dataKey="A" stroke="#814AC8" fill="#814AC8" fillOpacity={0.6} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(23, 23, 25, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default Progress;