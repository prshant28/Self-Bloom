import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import LandingPage from '@/pages/LandingPage';
import SignUpPage from '@/pages/SignUpPage';
import SignInPage from '@/pages/SignInPage';
import DashboardLayout from '@/components/DashboardLayout';
import PageTransition from '@/components/PageTransition';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import NotFoundPage from '@/pages/NotFoundPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-background"><div className="text-white">Loading...</div></div>;
  }

  return user ? children : <Navigate to="/signin" />;
};

function App() {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
       setTimeout(() => {
         toast({
            title: "Enable Notifications?",
            description: "We'd like to send you reminders for your scheduled tasks.",
            action: (
              <button
                className="px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-md"
                onClick={() => Notification.requestPermission()}
              >
                Allow
              </button>
            ),
            duration: 10000,
         });
       }, 5000);
    }
  }, [toast]);

  return (
    <>
      <Helmet>
        <title>SelfBloom - Your Personal Growth Companion</title>
        <meta name="description" content="SelfBloom is an all-in-one self-care and productivity app designed to help you build routines, track goals, and cultivate mindfulness. Start your journey to a more balanced and fulfilling life today." />
        <meta name="keywords" content="self-care, productivity, personal growth, goal tracking, journaling, meditation, habit tracker, routine planner" />
        <meta name="author" content="SelfBloom" />
        <meta property="og:title" content="SelfBloom - Your Personal Growth Companion" />
        <meta property="og:description" content="The ultimate app for building a balanced life. Track habits, plan your day, and focus on what matters most." />
        <meta property="og:image" content="https://selfbloom.prshant.dev/og-image.png" />
        <meta property="og:url" content="https://selfbloom.prshant.dev" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" integrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0v4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <style>{`
          html {
            scrollbar-gutter: stable;
          }
        `}</style>
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground font-sans dark-bg">
        <div className="content-wrapper mx-auto w-full">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={user ? <Navigate to="/app/dashboard" /> : <PageTransition><SignUpPage /></PageTransition>} />
              <Route path="/signin" element={user ? <Navigate to="/app/dashboard" /> : <PageTransition><SignInPage /></PageTransition>} />
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
              <Route 
                path="/app/*" 
                element={
                  <PrivateRoute>
                    <DashboardLayout />
                  </PrivateRoute>
                } 
              />
              <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </div>
        <Toaster />
      </div>
    </>
  );
}

export default App;