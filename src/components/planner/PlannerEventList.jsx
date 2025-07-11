import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BellRing, Clock, Edit, Trash2 } from 'lucide-react';
import { plannerTemplates } from '@/components/planner/plannerTemplates';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PlannerEventList = ({ events, onEdit, onDelete, onApplyTemplate }) => {
  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 smooth-scrollbar">
      <AnimatePresence>
        {events.length > 0 ? (
          events.map((event) => (
            <motion.div 
              key={event.id} 
              layout 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              className={`p-3 rounded-lg border-l-4 ${event.color || 'border-l-primary'} bg-background/50`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {event.reminder_enabled ? <BellRing className="text-yellow-300" /> : <Clock />}
                  <div>
                    <div className="font-semibold">{event.activity}</div>
                    <div className="text-sm opacity-75">{event.start_time.substring(0,5)} - {event.end_time.substring(0,5)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20" onClick={() => onEdit(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20" onClick={() => onDelete(event.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center py-8 text-muted-foreground">
            <p>No events scheduled for this day.</p>
            <div className='mt-4'>
              <p className="mb-2 font-semibold">Start with a template:</p>
              <div className='flex justify-center gap-2 flex-wrap'>
                {Object.entries(plannerTemplates).map(([key, template]) => (
                  <Button key={key} variant="secondary" onClick={() => onApplyTemplate(key)}>{template.name}</Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlannerEventList;