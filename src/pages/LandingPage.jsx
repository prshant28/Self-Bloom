import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Sun, BookOpen, HeartPulse, Mic, ChevronDown, Menu, X, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BackgroundAnimation = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
        script.async = true;
        script.onload = () => {
            if (window.particlesJS) {
                window.particlesJS('bg-animation', {
                    "particles": {
                        "number": { "value": 50, "density": { "enable": true, "value_area": 800 } },
                        "color": { "value": "#814AC8" },
                        "shape": { "type": "circle" },
                        "opacity": { "value": 0.6, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
                        "size": { "value": 4, "random": true, "anim": { "enable": false } },
                        "line_linked": { "enable": false },
                        "move": { "enable": true, "speed": 1, "direction": "top", "random": true, "straight": false, "out_mode": "out", "bounce": false }
                    },
                    "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": false }, "onclick": { "enable": false }, "resize": true } },
                    "retina_detect": true
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            const pjs = document.getElementById('bg-animation');
            if (pjs) pjs.innerHTML = '';
        }
    }, []);

    return <div id="bg-animation" className="absolute top-0 left-0 w-full h-full z-0" />;
};

const ScrollAnimatedSection = ({ children, ...props }) => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="py-24 px-4"
            {...props}
        >
            {children}
        </motion.section>
    );
};

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Routine", href: "#routine" },
    { name: "Features", href: "#features" },
  ];
  
  const pageLinks = [
      {name: "Sign In", path: "/signin"},
      {name: "Sign Up", path: "/signup"},
  ]

  const routineCards = [
      { icon: <Sun className="w-8 h-8 text-primary" />, title: "Morning Flow", description: "Workout, Skincare, & Mindful Start" },
      { icon: <BookOpen className="w-8 h-8 text-primary" />, title: "Study Zone", description: "Deep work on DSA & Python" },
      { icon: <HeartPulse className="w-8 h-8 text-primary" />, title: "Mindful Breaks", description: "Meditate, Stretch, & Recharge" },
      { icon: <Mic className="w-8 h-8 text-primary" />, title: "Journal & Reflection", description: "Evening thoughts & gratitude" },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <BackgroundAnimation />
      <div className="relative min-h-screen overflow-x-hidden">
        
        <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl p-2 sm:p-3 flex items-center justify-between z-50 glass-nav rounded-full">
          <Link to="/" className="flex items-center space-x-2 pl-4">
            <Sparkles className="w-7 h-7 text-primary text-glow" />
            <span className="font-display text-2xl text-foreground">Self<span className="text-glow">Bloom</span></span>
          </Link>
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map(item => <a key={item.name} href={item.href} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">{item.name}</a>)}
             <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors outline-none">
                    Pages <ChevronDown className="w-4 h-4 ml-1" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {pageLinks.map(link => (
                      <Link to={link.path} key={link.name}>
                        <DropdownMenuItem>{link.name}</DropdownMenuItem>
                      </Link>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          <div className="hidden lg:block pr-2">
            <Link to="/signup">
                <Button variant="glow" className="rounded-full">
                    Let's Begin
                </Button>
            </Link>
          </div>
          <button onClick={toggleMenu} className="lg:hidden z-50 text-foreground pr-4">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </header>

        {isMenuOpen && (
            <motion.div 
              className="lg:hidden fixed inset-0 bg-background/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {navItems.map(item => <a key={item.name} href={item.href} onClick={toggleMenu} className="font-display text-4xl text-foreground hover:text-primary transition-colors">{item.name}</a>)}
               <Link to="/signup" onClick={toggleMenu}>
                    <Button variant="glow" size="lg" className="rounded-full">
                        Let's Begin
                    </Button>
                </Link>
            </motion.div>
        )}

        <main className="relative">
          <section id="home" className="min-h-screen flex items-center justify-center pt-40 pb-20 px-4 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-display text-6xl md:text-8xl text-foreground leading-tight tracking-wide">
                Grow Every Day — From Within.
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-foreground/70 font-light tracking-wide">
                Your personal space for healing, progress, and balance.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button variant="glow" size="lg" className="rounded-full w-full sm:w-auto">
                    Start My Day
                  </Button>
                </Link>
                <a href="#routine">
                    <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto">
                        View Features
                    </Button>
                </a>
              </div>
            </motion.div>
          </section>

          <ScrollAnimatedSection id="routine">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="font-display text-5xl md:text-6xl text-primary text-glow mb-6">Design Your Day</h2>
                <p className="text-lg text-muted-foreground mb-16">
                    Structure your time with intention. From morning flows to evening reflections, every block is a step toward a more balanced you.
                </p>
            </div>
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {routineCards.map((card, index) => (
                  <motion.div 
                    key={card.title}
                    className="p-8 text-center glass-card hover:border-primary/50 hover:-translate-y-2 transition-all duration-300 shadow-2xl shadow-primary/10"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                  >
                    <div className="inline-block p-4 bg-primary/10 rounded-full mb-6 border border-primary/20">
                      {card.icon}
                    </div>
                    <h3 className="text-2xl font-display text-foreground mb-3">{card.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{card.description}</p>
                  </motion.div>
                ))}
             </div>
          </ScrollAnimatedSection>

          <ScrollAnimatedSection id="features">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="relative p-8 glass-card shadow-2xl shadow-primary/20">
                        <h3 className="font-display text-3xl text-primary mb-4">Streak Tracker</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg"><span>🧘 Calm Master</span><span className="font-bold text-primary">14 Days</span></div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg"><span>🎯 Focus Champ</span><span className="font-bold text-primary">7 Days</span></div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg"><span>⭐ Consistency Hero</span><span className="font-bold text-primary">30 Days</span></div>
                        </div>
                        <div className="absolute -top-4 -right-4">
                            <Sparkles className="w-12 h-12 text-primary text-glow animate-pulse" />
                        </div>
                    </div>
                </motion.div>
                <div className="text-left">
                    <h2 className="font-display text-5xl md:text-6xl text-primary text-glow mb-6">Gamify Your Growth</h2>
                    <p className="text-foreground/80 text-lg mb-4 leading-relaxed">
                        Unlock achievements and build streaks to stay motivated. Celebrate every milestone on your journey to self-mastery.
                    </p>
                    <p className="text-muted-foreground text-md">
                        And for those tough days, the "I Woke Up Late" button instantly re-calibrates your schedule, keeping you on track without the stress.
                    </p>
                </div>
            </div>
          </ScrollAnimatedSection>
        </main>
        
        <footer className="relative bg-secondary/50 pt-24 pb-8 px-4 mt-16 footer-grid-bg">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
                <div className="md:col-span-1">
                    <Link to="/" className="flex items-center justify-center sm:justify-start space-x-2 mb-4">
                        <Sparkles className="w-7 h-7 text-primary text-glow" />
                        <span className="font-display text-2xl text-foreground">Self<span className="text-glow">Bloom</span></span>
                    </Link>
                    <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} selfbloom.prshant.dev</p>
                </div>
                 <div>
                    <h4 className="font-display text-lg mb-4 text-foreground">Wellness Tools</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#routine" className="text-muted-foreground hover:text-primary transition">My Routine</a></li>
                        <li><a href="#features" className="text-muted-foreground hover:text-primary transition">Features</a></li>
                        <li><Link to="/app/dashboard" className="text-muted-foreground hover:text-primary transition">Focus Mode</Link></li>
                        <li><Link to="/app/dashboard" className="text-muted-foreground hover:text-primary transition">Journal</Link></li>
                        <li><Link to="/app/dashboard" className="text-muted-foreground hover:text-primary transition">Knowledge Hub</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-display text-lg mb-4 text-foreground">Connect</h4>
                    <div className="flex justify-center sm:justify-start space-x-4">
                        <a href="#" className="text-muted-foreground hover:text-primary transition"><Twitter className="w-6 h-6" /></a>
                        <a href="#" className="text-muted-foreground hover:text-primary transition"><Linkedin className="w-6 h-6" /></a>
                        <a href="#" className="text-muted-foreground hover:text-primary transition"><Mail className="w-6 h-6" /></a>
                    </div>
                </div>
            </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;