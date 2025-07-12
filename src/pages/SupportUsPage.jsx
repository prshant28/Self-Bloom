import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Coffee, Star, Gift } from 'lucide-react';
import { Helmet } from 'react-helmet';

const SupportUsPage = () => {
  return (
    <>
      <Helmet>
        <title>Support Us - SelfBloom</title>
        <meta name="description" content="Support the development of SelfBloom - a free, open-source personal growth platform." />
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <motion.div 
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="space-y-4">
              <motion.div
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Heart className="w-10 h-10 text-white" />
              </motion.div>
              
              <h1 className="font-display text-4xl md:text-6xl font-bold text-glow">
                Support SelfBloom
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Help us keep this platform free and accessible for everyone
              </p>
            </div>

            {/* Main Message */}
            <motion.div 
              className="glass-card p-8 md:p-12 space-y-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="space-y-6 text-lg leading-relaxed">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Gift className="w-8 h-8 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-glow">Completely Free Forever</h2>
                </div>
                
                <p className="text-foreground/90">
                  <strong>SelfBloom is completely free for everyone.</strong> There are no ads, no subscriptions, and no hidden costs. 
                  The person behind this project, <span className="text-primary font-semibold">Prashant</span>, believes in open and accessible tools for all.
                </p>
                
                <div className="border-t border-border pt-6">
                  <p className="text-foreground/80">
                    However, if you want to support the future of this app — including more advanced features, 
                    regular updates, and better performance — please consider supporting the developer. 
                    <span className="text-primary font-semibold"> Every contribution helps sustain and improve this platform.</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Support Buttons */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Coffee className="w-6 h-6 text-yellow-500" />
                <h3 className="font-display text-xl font-bold">Buy Me a Coffee</h3>
              </div>
              
              {/* Primary Button */}
              <div className="flex justify-center">
                <script 
                  type="text/javascript" 
                  src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" 
                  data-name="bmc-button" 
                  data-slug="prshant.dev" 
                  data-color="#FFDD00" 
                  data-emoji="" 
                  data-font="Cookie" 
                  data-text="Buy me a coffee" 
                  data-outline-color="#000000" 
                  data-font-color="#000000" 
                  data-coffee-color="#ffffff"
                ></script>
              </div>
              
              {/* Backup Button */}
              <div className="flex justify-center">
                <a href="https://www.buymeacoffee.com/prshant.dev" target="_blank" rel="noopener noreferrer">
                  <img 
                    src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
                    alt="Buy Me A Coffee" 
                    className="h-15 w-auto hover:scale-105 transition-transform duration-200"
                    style={{ height: '60px', width: '217px' }}
                  />
                </a>
              </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {[
                {
                  icon: <Star className="w-8 h-8 text-yellow-500" />,
                  title: "Premium Features",
                  description: "Help us build advanced AI integrations and smart automation"
                },
                {
                  icon: <Coffee className="w-8 h-8 text-orange-500" />,
                  title: "Regular Updates",
                  description: "Support continuous development and new feature releases"
                },
                {
                  icon: <Heart className="w-8 h-8 text-red-500" />,
                  title: "Better Performance",
                  description: "Enable us to optimize and enhance the user experience"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="glass-card p-6 text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Thank You Message */}
            <motion.div 
              className="mt-16 p-6 bg-primary/10 rounded-lg border border-primary/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <p className="text-lg font-medium text-primary">
                Thank you for being part of the SelfBloom community! 🌱
              </p>
              <p className="text-muted-foreground mt-2">
                Your support means the world to us and helps keep this platform free for everyone.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SupportUsPage;