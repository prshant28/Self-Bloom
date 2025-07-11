import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle as TriangleAlert } from 'lucide-react';

const EmergencyMode = ({ setEmergencyMode }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { toast } = useToast();

  const emergencyScenarios = [
    {
      id: 'late-wake',
      title: 'Late Wake Up',
      description: 'Woke up past 6:00 AM',
      icon: 'fas fa-bed',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'missed-blocks',
      title: 'Missed Time Blocks',
      description: 'Behind schedule by 2+ hours',
      icon: 'fas fa-clock',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'high-stress',
      title: 'High Stress Day',
      description: 'Feeling overwhelmed',
      icon: 'fas fa-exclamation-triangle',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'low-energy',
      title: 'Low Energy',
      description: 'Feeling tired or unmotivated',
      icon: 'fas fa-battery-quarter',
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  const backupPlans = {
    'late-wake': {
      title: 'Quick Start Protocol',
      tasks: [
        { task: 'Skip extended morning routine', duration: '5 min', priority: 'high' },
        { task: 'Quick shower + coffee', duration: '10 min', priority: 'high' },
        { task: 'Review top 3 priorities', duration: '5 min', priority: 'high' },
        { task: 'Start with most important task', duration: '30 min', priority: 'high' },
        { task: 'Compress lunch break', duration: '20 min', priority: 'medium' }
      ]
    },
    'missed-blocks': {
      title: 'Catch-Up Strategy',
      tasks: [
        { task: 'Identify critical tasks only', duration: '10 min', priority: 'high' },
        { task: 'Eliminate non-essential activities', duration: '5 min', priority: 'high' },
        { task: 'Use Pomodoro technique', duration: '25 min', priority: 'high' },
        { task: 'Batch similar tasks', duration: '45 min', priority: 'medium' },
        { task: 'Reschedule tomorrow', duration: '10 min', priority: 'low' }
      ]
    },
    'high-stress': {
      title: 'Stress Relief Protocol',
      tasks: [
        { task: '5-minute breathing exercise', duration: '5 min', priority: 'high' },
        { task: 'Write down 3 priorities', duration: '5 min', priority: 'high' },
        { task: 'Take a 10-minute walk', duration: '10 min', priority: 'medium' },
        { task: 'Hydrate and eat something', duration: '10 min', priority: 'medium' },
        { task: 'Start with easiest task', duration: '20 min', priority: 'low' }
      ]
    },
    'low-energy': {
      title: 'Energy Boost Plan',
      tasks: [
        { task: 'Drink water + light snack', duration: '5 min', priority: 'high' },
        { task: '2-minute energizing stretch', duration: '2 min', priority: 'high' },
        { task: 'Listen to upbeat music', duration: '3 min', priority: 'medium' },
        { task: 'Start with engaging task', duration: '25 min', priority: 'medium' },
        { task: 'Plan power nap if needed', duration: '20 min', priority: 'low' }
      ]
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'from-red-500 to-pink-500',
      medium: 'from-yellow-500 to-orange-500',
      low: 'from-green-500 to-teal-500'
    };
    return colors[priority] || colors.medium;
  };

  const activateBackupPlan = (planId) => {
    setSelectedPlan(planId);
    toast({
      title: "🚨 Backup Plan Activated",
      description: `Emergency protocol for ${emergencyScenarios.find(s => s.id === planId)?.title} is now active!`,
      duration: 3000,
    });
  };

  const deactivateEmergencyMode = () => {
    setEmergencyMode(false);
    toast({
      title: "✅ Emergency Mode Deactivated",
      description: "Back to normal schedule. Great job adapting!",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <TriangleAlert className="h-10 w-10 text-white" />
        </motion.div>
        
        <h1 className="font-alegreya text-4xl font-bold glow-text mb-2">
          Emergency Mode
        </h1>
        <p className="font-mooxy text-lg opacity-75">
          Disruption detected. Choose your backup strategy.
        </p>
      </motion.div>

      {!selectedPlan ? (
        <>
          {/* Emergency Scenarios */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="font-alegreya text-2xl font-bold glow-text mb-6">
              <i className="fas fa-list-alt mr-3"></i>
              Select Emergency Scenario
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyScenarios.map((scenario, index) => (
                <motion.button
                  key={scenario.id}
                  onClick={() => activateBackupPlan(scenario.id)}
                  className={`p-6 rounded-lg bg-gradient-to-r ${scenario.color} text-white text-left`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <i className={`${scenario.icon} text-2xl`}></i>
                    </div>
                    <div>
                      <h3 className="font-alegreya text-xl font-bold">{scenario.title}</h3>
                      <p className="font-mooxy opacity-90">{scenario.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-alegreya text-2xl font-bold glow-text mb-6">
              <i className="fas fa-bolt mr-3"></i>
              Quick Emergency Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                className="p-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-mooxy font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toast({
                  title: "🧘 Quick Calm",
                  description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
                  duration: 3000,
                })}
              >
                <i className="fas fa-leaf mb-2 text-xl block"></i>
                Quick Calm (2 min)
              </motion.button>

              <motion.button
                className="p-4 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-mooxy font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toast({
                  title: "⚡ Energy Boost",
                  description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
                  duration: 3000,
                })}
              >
                <i className="fas fa-bolt mb-2 text-xl block"></i>
                Energy Boost
              </motion.button>

              <motion.button
                className="p-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-mooxy font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toast({
                  title: "🎯 Focus Reset",
                  description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
                  duration: 3000,
                })}
              >
                <i className="fas fa-target mb-2 text-xl block"></i>
                Focus Reset
              </motion.button>
            </div>
          </motion.div>
        </>
      ) : (
        /* Backup Plan Details */
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-alegreya text-2xl font-bold glow-text">
              {backupPlans[selectedPlan]?.title}
            </h2>
            <button
              onClick={() => setSelectedPlan(null)}
              className="p-2 rounded-lg glass-card hover:pulse-glow"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
          </div>

          <div className="space-y-4">
            {backupPlans[selectedPlan]?.tasks.map((task, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-4 p-4 glass-card rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getPriorityColor(task.priority)} flex items-center justify-center text-white font-bold`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-mooxy font-semibold">{task.task}</h3>
                  <div className="flex items-center space-x-4 text-sm opacity-75">
                    <span>
                      <i className="fas fa-clock mr-1"></i>
                      {task.duration}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <motion.button
                  className="w-10 h-10 rounded-full glass-card hover:pulse-glow flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toast({
                    title: "✅ Task Started",
                    description: `Started: ${task.task}`,
                    duration: 2000,
                  })}
                >
                  <i className="fas fa-play text-sm"></i>
                </motion.button>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <motion.button
              onClick={deactivateEmergencyMode}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-mooxy font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-check mr-2"></i>
              Exit Emergency Mode
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EmergencyMode;