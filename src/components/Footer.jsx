import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Github } from 'lucide-react';

const Footer = () => {
  return (
    <motion.footer
      className="w-full py-6 px-8 text-muted-foreground text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="hidden md:inline">&copy; {new Date().getFullYear()} SelfBloom. All Rights Reserved.</span>
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