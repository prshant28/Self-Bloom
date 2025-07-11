import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MobileNav from '@/components/MobileNav';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Dashboard from '@/components/Dashboard';
import Planner from '@/components/Planner';
import Progress from '@/components/Progress';
import Achievements from '@/components/Achievements';
import MediaHub from '@/components/MediaHub';
import Settings from '@/components/Settings';
import Goals from '@/components/Goals';
import TodoPage from '@/components/TodoPage';
import PageTransition from '@/components/PageTransition';
import VisionBoard from '@/components/VisionBoard';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import QuickLinksPage from '@/components/QuickLinksPage';
import JournalPage from '@/pages/JournalPage';
import FinanceTrackerPage from '@/pages/FinanceTrackerPage';
import TemplatesPage from '@/pages/TemplatesPage';
import NotFoundPage from '@/pages/NotFoundPage';

const DashboardLayout = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuth();

  const checkReminders = useCallback(() => {
    if (!user || Notification.permission !== 'granted') return;

    const now = new Date();
    const currentDay = now.getDay();
    const currentTimeStr = now.toTimeString().slice(0, 5);

    supabase
      .from('schedule')
      .select('activity, start_time')
      .eq('user_id', user.id)
      .eq('day_of_week', currentDay)
      .eq('reminder_enabled', true)
      .eq('start_time', currentTimeStr)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching reminders:', error);
          return;
        }
        data.forEach(event => {
          new Notification('Task Reminder', {
            body: `It's time for: ${event.activity}`,
            icon: '/logo.png' 
          });
        });
      });
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      checkReminders();
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [checkReminders]);

  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <main className="flex-1 flex flex-col pt-16 md:pt-20">
        <div className="flex-grow p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 w-full max-w-screen-2xl mx-auto">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
              <Route path="planner" element={<PageTransition><Planner /></PageTransition>} />
              <Route path="progress" element={<PageTransition><Progress /></PageTransition>} />
              <Route path="achievements" element={<PageTransition><Achievements /></PageTransition>} />
              <Route path="knowledge-hub" element={<PageTransition><MediaHub /></PageTransition>} />
              <Route path="settings" element={<PageTransition><Settings /></PageTransition>} />
              <Route path="goals" element={<PageTransition><Goals /></PageTransition>} />
              <Route path="todos" element={<PageTransition><TodoPage /></PageTransition>} />
              <Route path="vision-board" element={<PageTransition><VisionBoard /></PageTransition>} />
              <Route path="quick-links" element={<PageTransition><QuickLinksPage /></PageTransition>} />
              <Route path="journal" element={<PageTransition><JournalPage /></PageTransition>} />
              <Route path="finance" element={<PageTransition><FinanceTrackerPage /></PageTransition>} />
              <Route path="templates" element={<PageTransition><TemplatesPage /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default DashboardLayout;