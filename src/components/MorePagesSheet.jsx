import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Trophy, BookOpen, Eye, Link as LinkIcon, Settings as SettingsIcon, DollarSign, BookHeart, LayoutTemplate } from 'lucide-react';

const moreNavItems = [
  { to: '/app/journal', icon: BookHeart, label: 'Journal' },
  { to: '/app/finance', icon: DollarSign, label: 'Finance' },
  { to: '/app/templates', icon: LayoutTemplate, label: 'Templates' },
  { to: '/app/vision-board', icon: Eye, label: 'Vision Board' },
  { to: '/app/quick-links', icon: LinkIcon, label: 'Quick Links' },
  { to: '/app/progress', icon: BarChart3, label: 'Progress' },
  { to: '/app/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/app/knowledge-hub', icon: BookOpen, label: 'Knowledge Hub' },
  { to: '/app/support', icon: BookHeart, label: 'Support Us' },
  { to: '/app/settings', icon: SettingsIcon, label: 'Settings' },
];

const MorePagesSheet = ({ onLinkClick }) => {
  return (
    <div className="p-4 grid grid-cols-3 gap-4">
      {moreNavItems.map((item, index) => (
        <motion.div
          key={item.to}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <NavLink
            to={item.to}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-3 rounded-lg aspect-square transition-all ${
                isActive ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground'
              }`
            }
          >
            <item.icon size={28} />
            <span className="text-xs font-medium mt-2 text-center">{item.label}</span>
          </NavLink>
        </motion.div>
      ))}
    </div>
  );
};

export default MorePagesSheet;