import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const Achievements = ({ achievements }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const achievementData = [
    {
      id: 'morningMaster', title: 'Morning Master', description: 'Complete morning routine 7 days in a row',
      icon: 'fas fa-sun', category: 'routine', rarity: 'common', xpReward: 100, color: 'from-orange-400 to-yellow-400'
    },
    {
      id: 'perfectDay', title: 'Perfect Day', description: 'Complete all tasks in a single day',
      icon: 'fas fa-star', category: 'completion', rarity: 'rare', xpReward: 250, color: 'from-yellow-400 to-amber-400'
    },
    {
      id: 'deepWorkWizard', title: 'Deep Work Wizard', description: 'Complete 10 focused work sessions',
      icon: 'fas fa-brain', category: 'productivity', rarity: 'epic', xpReward: 500, color: 'from-purple-400 to-violet-400'
    },
    {
      id: 'streakWarrior', title: 'Streak Warrior', description: 'Maintain a 30-day consistency streak',
      icon: 'fas fa-fire', category: 'consistency', rarity: 'legendary', xpReward: 1000, color: 'from-red-400 to-pink-400'
    },
    {
      id: 'wellnessGuru', title: 'Wellness Guru', description: 'Complete 50 wellness activities',
      icon: 'fas fa-heart', category: 'wellness', rarity: 'epic', xpReward: 750, color: 'from-pink-400 to-rose-400'
    },
    {
      id: 'learningMachine', title: 'Learning Machine', description: 'Complete 25 study sessions',
      icon: 'fas fa-book', category: 'learning', rarity: 'rare', xpReward: 300, color: 'from-blue-400 to-indigo-400'
    }
  ];

  const categories = [
    { id: 'all', label: 'All', icon: 'fas fa-trophy' }, { id: 'routine', label: 'Routine', icon: 'fas fa-clock' },
    { id: 'completion', label: 'Completion', icon: 'fas fa-check-circle' }, { id: 'productivity', label: 'Productivity', icon: 'fas fa-rocket' },
    { id: 'consistency', label: 'Consistency', icon: 'fas fa-fire' }, { id: 'wellness', label: 'Wellness', icon: 'fas fa-heart' },
    { id: 'learning', label: 'Learning', icon: 'fas fa-brain' }
  ];

  const getRarityColor = (rarity) => ({
    common: 'from-gray-500 to-gray-600', rare: 'from-blue-500 to-indigo-500',
    epic: 'from-purple-500 to-violet-500', legendary: 'from-yellow-500 to-orange-500'
  })[rarity] || 'from-gray-500 to-gray-600';

  const filteredAchievements = selectedCategory === 'all' 
    ? achievementData 
    : achievementData.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements ? achievementData.filter(a => achievements[a.id]?.unlocked).length : 0;
  const totalXP = achievements ? achievementData.filter(a => achievements[a.id]?.unlocked).reduce((sum, a) => sum + a.xpReward, 0) : 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-alegreya text-4xl font-bold text-foreground mb-2">Achievement Gallery</h1>
        <p className="font-mooxy text-lg text-muted-foreground">Unlock badges and earn XP on your journey.</p>
      </motion.div>
      
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {[
          { icon: 'fa-trophy', value: unlockedCount, label: 'Unlocked', color: 'from-yellow-500 to-orange-500' },
          { icon: 'fa-star', value: totalXP, label: 'Total XP', color: 'from-primary to-purple-600' },
          { icon: 'fa-percentage', value: `${achievementData.length > 0 ? Math.round((unlockedCount / achievementData.length) * 100) : 0}%`, label: 'Completion', color: 'from-green-500 to-teal-500' }
        ].map(stat => (
          <div key={stat.label} className="card-dark p-6 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
              <i className={`fas ${stat.icon} text-2xl text-white`}></i>
            </div>
            <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            <p className="font-mooxy text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div className="card-dark p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <motion.button key={c.id} onClick={() => setSelectedCategory(c.id)} className={`px-4 py-2 rounded-lg font-mooxy font-medium transition-all ${selectedCategory === c.id ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <i className={`${c.icon} mr-2`}></i> {c.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={selectedCategory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {filteredAchievements.map((achievement, index) => {
            const isUnlocked = achievements && achievements[achievement.id]?.unlocked;
            const progress = achievements && achievements[achievement.id]?.progress || 0;
            const target = achievements && achievements[achievement.id]?.target || 1;
            const progressPercentage = (progress / target) * 100;
            return (
              <motion.div key={achievement.id} className={`card-dark p-6 ${isUnlocked ? '' : 'opacity-60'}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.02, transition: { duration: 0.1 } }}>
                <div className="text-center mb-4">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${isUnlocked ? achievement.color : 'from-gray-600 to-gray-700'} flex items-center justify-center relative`}>
                    <i className={`${achievement.icon} text-3xl text-white`}></i>
                    {isUnlocked && <motion.div className="absolute -top-1 -right-1 w-7 h-7 bg-green-400 rounded-full flex items-center justify-center border-2 border-card" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="text-white h-4 w-4" /></motion.div>}
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-mooxy font-semibold mb-2 bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}>{achievement.rarity.toUpperCase()}</div>
                </div>
                <h3 className="font-alegreya text-xl font-bold text-foreground text-center mb-2">{achievement.title}</h3>
                <p className="font-mooxy text-sm text-muted-foreground text-center mb-4">{achievement.description}</p>
                {!isUnlocked && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2"><span className="font-mooxy text-sm">Progress</span><span className="font-mooxy text-sm">{progress}/{target}</span></div>
                    <div className="w-full h-2 bg-input rounded-full overflow-hidden"><motion.div className={`h-full bg-gradient-to-r ${achievement.color}`} initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} /></div>
                  </div>
                )}
                <div className="text-center"><div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-mooxy ${isUnlocked ? 'bg-green-500/20 text-green-400' : 'bg-accent'}`}><i className="fas fa-star mr-1"></i> {achievement.xpReward} XP</div></div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Achievements;