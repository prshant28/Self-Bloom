import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const TimeBlockScheduler = ({ currentTime, schedule, onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState([]);

  const getSlotStatus = (slot, currentTime) => {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    if (slot.completed) return 'completed';
    if (slot.end <= currentHour) return 'missed';
    if (currentHour >= slot.start && currentHour < slot.end) return 'active';
    return 'pending';
  };
  
  const getCategoryColor = (category) => {
    const colors = {
      'body-care': 'from-orange-500 to-yellow-500', 'shop': 'from-blue-500 to-indigo-500',
      'break': 'from-green-500 to-teal-500', 'study': 'from-primary to-purple-600',
      'skill-dev': 'from-indigo-500 to-purple-500', 'content': 'from-pink-500 to-red-500',
      'personal': 'from-violet-500 to-purple-400'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  useEffect(() => {
    const generatedSlots = schedule.map((slot) => ({
      ...slot,
      status: getSlotStatus(slot, currentTime),
      time: slot.start_time.substring(0, 5)
    }));
    setTimeSlots(generatedSlots);
  }, [currentTime, schedule]);

  const handleCheckIn = async (slotId) => {
    const { error } = await supabase
      .from('schedule')
      .update({ completed: true })
      .eq('id', slotId);

    if (error) {
      toast({ title: "Error checking in", description: error.message, variant: "destructive" });
    } else {
      await supabase.rpc('increment_user_stat', { user_id_in: user.id, xp_in: 15, tasks_in: 1 });
      toast({ title: "🎉 Checked In!", description: "+15 XP earned for staying on schedule!" });
      if (onUpdate) onUpdate();
    }
  };

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-glow">
          <i className="fas fa-clock mr-3"></i>
          Today's Schedule
        </h2>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {timeSlots.map((slot, index) => (
          <motion.div
            key={slot.id}
            className={`p-4 rounded-lg transition-all flex items-center justify-between
              ${slot.status === 'active' ? 'ring-2 ring-primary bg-primary/20' : ''}
              ${slot.status === 'completed' ? 'bg-white/10 opacity-70' : ''}
              ${slot.status === 'missed' ? 'bg-red-500/10 opacity-60' : ''}
              ${slot.status === 'pending' ? 'bg-white/5' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-12 rounded-lg bg-gradient-to-r ${getCategoryColor(slot.category)} flex items-center justify-center font-bold text-white text-sm`}>
                {slot.time}
              </div>
              <div>
                <h3 className="font-semibold">{slot.title}</h3>
                <p className="text-sm opacity-75 capitalize">{slot.category}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {slot.status === 'completed' && <CheckCircle className="text-green-400" />}
              {slot.status === 'missed' && <XCircle className="text-red-400" />}
              {slot.status === 'active' && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}><PlayCircle className="text-primary" /></motion.div>}
              {slot.status === 'active' && <Button size="sm" onClick={() => handleCheckIn(slot.id)}>Check-in</Button>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TimeBlockScheduler;