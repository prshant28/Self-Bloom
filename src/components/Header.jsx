import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Search, Bell, Sparkles, LayoutDashboard, Calendar, BarChart3, Trophy, BookOpen, BrainCircuit, ListTodo, Eye, Link as LinkIcon, Settings as SettingsIcon, LogOut, BookHeart, DollarSign, LayoutTemplate, MoreHorizontal } from 'lucide-react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/planner', icon: Calendar, label: 'Planner' },
  { to: '/app/todos', icon: ListTodo, label: 'To-Do List' },
  { to: '/app/journal', icon: BookHeart, label: 'Journal' },
  { to: '/app/finance', icon: DollarSign, label: 'Finance' },
  { to: '/app/goals', icon: BrainCircuit, label: 'Goals' },
  { to: '/app/templates', icon: LayoutTemplate, label: 'Templates' },
  { to: '/app/vision-board', icon: Eye, label: 'Vision Board' },
  { to: '/app/quick-links', icon: LinkIcon, label: 'Quick Links' },
  { to: '/app/progress', icon: BarChart3, label: 'Progress' },
  { to: '/app/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/app/knowledge-hub', icon: BookOpen, label: 'Knowledge Hub' },
  { to: '/app/support', icon: BookHeart, label: 'Support Us' },
];

const Header = ({ isAuthPage = false }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  // Split nav items for responsive header
  const mainNavItems = navItems.slice(0, 7);
  const moreNavItems = navItems.slice(7);

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle() to prevent error on no rows

      if (error) {
        throw error;
      }
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        variant: "destructive",
        title: "Error fetching profile",
        description: "Could not fetch your profile data. Please try again later.",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
        fetchProfile();
    }
    // Listen for profile updates
    const channel = supabase.channel('realtime-profile-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${user?.id}`
      }, (payload) => {
        setProfile(payload.new);
      }).subscribe();
      
    return () => {
        supabase.removeChannel(channel);
    }

  }, [user, fetchProfile]);

  const handleCommandSelect = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  if (isAuthPage) {
    return (
      <motion.header 
        className="absolute top-0 left-0 right-0 bg-transparent p-4 sm:p-6 z-40"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center justify-center space-x-2">
            <Sparkles className="w-7 h-7 text-primary text-glow" />
            <span className="font-display text-2xl text-foreground">Self<span className="text-glow">Bloom</span></span>
          </Link>
        </div>
      </motion.header>
    );
  }

  return (
    <>
      <motion.header 
        className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm p-3 z-40 border-b border-border"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <Link to="/app/dashboard" className="inline-flex items-center justify-center space-x-2">
            <Sparkles className="w-7 h-7 text-primary text-glow" />
            <span className="hidden md:inline font-display text-2xl text-foreground">Self<span className="text-glow">Bloom</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <TooltipProvider>
              {mainNavItems.map(item => (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center p-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`
                      }
                    >
                      <item.icon size={20} />
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {moreNavItems.length > 0 && (
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center p-3 rounded-lg transition-colors hover:bg-accent relative z-50">
                          <MoreHorizontal size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>More</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="start" className="z-[60]">
                    {moreNavItems.map(item => (
                      <DropdownMenuItem key={item.to} onClick={() => navigate(item.to)}>
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TooltipProvider>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
              <Search size={18} />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => toast({ title: "🔔 Notifications", description: "You have no new notifications.", duration: 3000 })}>
              <Bell className="text-muted-foreground" />
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full z-50">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || 'User'} />
                            <AvatarFallback>{profile?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[60]">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
              {navItems.map(item => (
                <CommandItem key={`cmd-${item.to}`} onSelect={() => handleCommandSelect(item.to)}>{item.label}</CommandItem>
              ))}
              <CommandItem onSelect={() => handleCommandSelect('/app/settings')}>Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default Header;