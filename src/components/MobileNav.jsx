import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Calendar, ListTodo, BrainCircuit, CircleEllipsis as Ellipsis } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import MorePagesSheet from '@/components/MorePagesSheet';

const mainNavItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/planner', icon: Calendar, label: 'Planner' },
  { to: '/app/todos', icon: ListTodo, label: 'To-Do' },
  { to: '/app/goals', icon: BrainCircuit, label: 'Goals' },
];

const MobileNav = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
    <motion.div 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-2 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="flex justify-around items-center">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 rounded-lg w-16 transition-all ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <item.icon size={24} />
            <span className="text-xs font-medium mt-1">{item.label}</span>
          </NavLink>
        ))}
        <Drawer open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <DrawerTrigger asChild>
            <button className="flex flex-col items-center justify-center p-2 rounded-lg w-16 text-muted-foreground">
              <Ellipsis size={24} />
              <span className="text-xs font-medium mt-1">More</span>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Explore More</DrawerTitle>
            </DrawerHeader>
            <MorePagesSheet onLinkClick={() => setIsMoreOpen(false)} />
          </DrawerContent>
        </Drawer>
      </div>
    </motion.div>
    </>
  );
};

export default MobileNav;