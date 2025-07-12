import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Github } from 'lucide-react';

const Footer = () => {
  return (
    <motion.footer
      className="w-full py-6 px-8 text-muted-foreground text-sm bg-secondary/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-sm">
          &copy; {new Date().getFullYear()} SelfBloom. All rights reserved.
        </div>
        <div className="text-sm">
          Made with ❤️ – Crafted by{' '}
          <a 
            href="https://prshant.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Prshant.dev
          </a>
        </div>
        <a 
          href="https://www.buymeacoffee.com/prshant.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:scale-105 transition-transform duration-200"
        >
          <img 
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
            alt="Buy Me A Coffee" 
            className="h-11 w-auto"
            style={{ height: '45px', width: '165px' }}
          />
        </a>
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-primary transition-colors"><Linkedin size={18}/></a>
          <a href="#" className="hover:text-primary transition-colors"><Twitter size={18}/></a>
          <a href="#" className="hover:text-primary transition-colors"><Github size={18}/></a>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;