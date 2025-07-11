import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Trophy,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  ListTodo,
  Eye,
  Link as LinkIcon
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/planner', icon: <Calendar size={20} />, label: 'Planner' },
  { to: '/todos', icon: <ListTodo size={20} />, label: 'To-Do List' },
  { to: '/goals', icon: <BrainCircuit size={20} />, label: 'Goals' },
  { to: '/vision-board', icon: <Eye size={20} />, label: 'Vision Board' },
  { to: '/quick-links', icon: <LinkIcon size={20} />, label: 'Quick Links' },
  { to: '/progress', icon: <BarChart3 size={20} />, label: 'Progress' },
  { to: '/achievements', icon: <Trophy size={20} />, label: 'Achievements' },
  { to: '/knowledge-hub', icon: <BookOpen size={20} />, label: 'Knowledge Hub' },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();

  const sidebarVariants = {
    expanded: { width: '16rem' },
    collapsed: { width: '5rem' },
  };

  const navItemVariants = {
    expanded: { opacity: 1, x: 0, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
    collapsed: { opacity: 0, x: -10 },
  };

  return (
    <motion.div
      variants={sidebarVariants}
      initial={false}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden md:flex flex-col h-screen bg-card border-r border-border fixed"
    >
      <div className="p-4 flex items-center justify-between mb-6 shrink-0">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <img  alt="SelfBloom Logo" className="h-8 w-8" src="https://images.unsplash.com/photo-1590934897845-8d9b0956d75f" />
            <span className="font-display text-2xl text-glow">SelfBloom</span>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:inline-flex"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <div className="flex-grow overflow-y-auto px-4">
        <nav className="flex-1 flex flex-col space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              {item.icon}
              {!collapsed && (
                <motion.span
                  variants={navItemVariants}
                  className="ml-4 font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-4 pb-4 shrink-0">
        <NavLink
            to="/settings"
            className={({ isActive }) =>
            `flex items-center p-3 rounded-lg transition-colors ${
                isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            } ${collapsed ? 'justify-center' : ''}`
            }
        >
            <Settings size={20} />
            {!collapsed && (
            <motion.span
                variants={navItemVariants}
                className="ml-4 font-medium"
            >
                Settings
            </motion.span>
            )}
        </NavLink>
      </div>
    </motion.div>
  );
};

export default Sidebar;