import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Headphones, Coffee } from 'lucide-react';

const AiScheduler = ({ currentTime, schedule, weeklyFocus }) => {
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
  const currentDay = currentTime.getDay();
  const currentSlot = schedule.find(s => currentHour >= s.start && currentHour < s.end) || { title: 'Rest Time', suggestion: 'Time to recharge. You\'ve earned it.' };
  const todayFocus = weeklyFocus[currentDay];

  const suggestions = [
    {
      icon: <Lightbulb className="text-yellow-400" />,
      title: 'Task Suggestion',
      text: `${currentSlot.suggestion} Today's main focus is ${todayFocus}.`,
    },
    {
      icon: <Headphones className="text-sky-400" />,
      title: 'Audio Suggestion',
      text: 'Try a podcast on AI ethics or a Lo-fi beats playlist to stay in the zone.',
    },
    {
      icon: <Coffee className="text-orange-400" />,
      title: 'Break Suggestion',
      text: 'Feeling stuck? A 5-minute walk and some deep breaths can do wonders.',
    },
  ];

  return (
    <motion.div
      className="glass-card p-6 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="font-display text-xl font-bold text-glow">AI Assistant</h2>
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={index}
          className="flex items-start space-x-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * (index + 1) }}
        >
          <div className="p-2 bg-background rounded-lg mt-1">{suggestion.icon}</div>
          <div>
            <h3 className="font-semibold text-foreground">{suggestion.title}</h3>
            <p className="text-sm text-muted-foreground">{suggestion.text}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AiScheduler;