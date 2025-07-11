import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BellRing, CheckCircle, Circle, Check, ListChecks, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DashboardSchedule = ({ schedule, currentTime, onUpdate }) => {
  const { toast } = useToast();
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
  
  const allDayEvents = schedule; // Show all events, remove the slice limit

  const handleCheckIn = async (eventId, currentStatus) => {
    const { error } = await supabase
      .from('schedule')
      .update({ completed: !currentStatus })
      .eq('id', eventId);
    
    if (error) {
      toast({ title: 'Error updating event', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Event status updated!' });
      if (onUpdate) onUpdate(); // Re-fetch schedule
    }
  };

  const handleCheckInAll = async () => {
    const uncompletedIds = allDayEvents.filter(e => !e.completed).map(e => e.id);
    if (uncompletedIds.length === 0) {
        toast({ title: "Everything is already checked in!" });
        return;
    }
    const { error } = await supabase
      .from('schedule')
      .update({ completed: true })
      .in('id', uncompletedIds);

    if (error) {
      toast({ title: 'Error checking in all events', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ All visible events checked in!' });
      if (onUpdate) onUpdate();
    }
  };

  const getEventColor = (type) => {
    const colors = {
      'body-care': 'border-orange-500', 'shop': 'border-blue-500',
      'break': 'border-green-500', 'study': 'border-primary',
      'skill-dev': 'border-indigo-500', 'content': 'border-pink-500',
      'personal': 'border-violet-500'
    };
    return colors[type] || 'border-gray-500';
  };
  
  const isEventCurrent = (event) => {
      const [startHour, startMinute] = event.start_time.split(':');
      const eventStart = parseInt(startHour) + parseInt(startMinute) / 60;
      const [endHour, endMinute] = event.end_time.split(':');
      const eventEnd = parseInt(endHour) + parseInt(endMinute) / 60;
      return currentHour >= eventStart && currentHour < eventEnd;
  }

  const EventTooltipContent = ({ event }) => (
    <div className="p-2 max-w-xs text-left">
        <p className="font-bold text-base">{event.activity}</p>
        <p className="text-sm text-muted-foreground capitalize">{event.category}</p>
        
        {event.details && (
             <div className="mt-2 pt-2 border-t border-border">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-1"><FileText size={16}/> Details:</h4>
                <p className="text-sm whitespace-pre-wrap">{event.details}</p>
            </div>
        )}

        {event.todos && event.todos.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-1"><ListChecks size={16}/> Sub-tasks:</h4>
                <ul className="list-disc list-inside space-y-1">
                    {event.todos.map(todo => (
                        <li key={todo.id} className={`${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {todo.task}
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
  );

  return (
    <motion.div
      className="glass-card p-6 flex flex-col"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="font-display text-2xl font-bold text-glow">
          Today's Schedule
        </h2>
        <div className="flex items-center gap-2">
            {allDayEvents.filter(e => !e.completed).length > 0 && (
                <Button variant="outline" size="sm" onClick={handleCheckInAll}>
                    <Check className="mr-2 h-4 w-4" /> Check-in All
                </Button>
            )}
            <Link to="/app/planner">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
        </div>
      </div>
      <div className="space-y-3 flex-grow overflow-y-auto max-h-[400px] smooth-scrollbar pr-2">
        <TooltipProvider delayDuration={100}>
            {allDayEvents.length > 0 ? (
              allDayEvents.map((event, index) => (
                <Tooltip key={event.id}>
                    <TooltipTrigger asChild>
                        <motion.div
                          className={`relative flex items-center space-x-4 p-3 rounded-lg bg-background/50 border-l-4 transition-all ${event.color || getEventColor(event.category)} ${event.completed ? 'opacity-50' : ''} ${isEventCurrent(event) ? 'ring-2 ring-primary' : ''}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="text-sm text-muted-foreground w-16 text-center">
                            {event.start_time.substring(0, 5)}
                          </div>
                          <div className="flex-grow">
                            <p className={`font-semibold ${event.completed ? 'line-through' : ''}`}>{event.activity}</p>
                            <p className="text-xs capitalize text-muted-foreground">{event.category}</p>
                          </div>
                          {event.reminder_enabled && !event.completed && <BellRing className="h-4 w-4 text-yellow-400" />}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCheckIn(event.id, event.completed)}>
                            {event.completed ? <CheckCircle className="h-5 w-5 text-green-400" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                          </Button>
                        </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center" className="bg-background/80 backdrop-blur-sm border-primary/20 text-foreground z-50">
                        <EventTooltipContent event={event} />
                    </TooltipContent>
                </Tooltip>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center h-full">
                <p>No events scheduled for today.</p>
                <Link to="/app/planner">
                  <Button variant="link" className="mt-2">Go to Planner</Button>
                </Link>
              </div>
            )}
        </TooltipProvider>
      </div>
    </motion.div>
  );
};

export default DashboardSchedule;