import React from 'react';
import { Button } from '@/components/ui/button';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PlannerDayTabs = ({ selectedDay, setSelectedDay }) => {
  return (
    <div className="flex justify-center gap-2 flex-wrap">
      {daysOfWeek.map((day, index) => (
        <Button 
          key={day} 
          variant={selectedDay === index ? 'glow' : 'outline'} 
          onClick={() => setSelectedDay(index)}
        >
          {day}
        </Button>
      ))}
    </div>
  );
};

export default PlannerDayTabs;