import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MotivationalModal = ({ isOpen, onClose }) => {
  const [confetti, setConfetti] = useState([]);

  const motivationalQuotes = [
    {
      quote: "The future depends on what you do today.",
      author: "Mahatma Gandhi",
      category: "motivation"
    },
    {
      quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "perseverance"
    },
    {
      quote: "Your body can stand almost anything. It's your mind that you have to convince.",
      author: "Unknown",
      category: "fitness"
    },
    {
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "productivity"
    },
    {
      quote: "Wellness is not a destination, it's a journey.",
      author: "Unknown",
      category: "wellness"
    }
  ];

  const [currentQuote] = useState(
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  const createConfetti = () => {
    const newConfetti = [];
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        color: ['#814AC8', '#9d5bd8', '#ff6b6b', '#4ecdc4', '#45b7d1'][Math.floor(Math.random() * 5)]
      });
    }
    setConfetti(newConfetti);
  };

  useEffect(() => {
    if (isOpen) {
      createConfetti();
      const timer = setTimeout(() => {
        setConfetti([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Confetti */}
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            className="confetti absolute w-2 h-2 rounded-full"
            style={{
              left: `${piece.left}%`,
              backgroundColor: piece.color
            }}
            initial={{ y: -100, rotate: 0 }}
            animate={{ y: window.innerHeight + 100, rotate: 720 }}
            transition={{ duration: 3, delay: piece.delay, ease: "linear" }}
          />
        ))}

        <motion.div
          className="glass-card p-8 max-w-md w-full text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <i className="fas fa-star text-3xl text-white"></i>
          </motion.div>

          <motion.h2
            className="font-alegreya text-2xl font-bold glow-text mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            You're Doing Amazing! 🌟
          </motion.h2>

          <motion.blockquote
            className="font-mooxy text-lg italic mb-4 opacity-90"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            "{currentQuote.quote}"
          </motion.blockquote>

          <motion.p
            className="font-mooxy text-sm opacity-75 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            — {currentQuote.author}
          </motion.p>

          <motion.div
            className="space-y-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <i className="fas fa-fire text-orange-400"></i>
                <span>Keep the streak alive!</span>
              </div>
              <div className="flex items-center space-x-1">
                <i className="fas fa-heart text-red-400"></i>
                <span>You've got this!</span>
              </div>
            </div>

            <motion.button
              onClick={onClose}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-mooxy font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="fas fa-rocket mr-2"></i>
              Let's Keep Going!
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MotivationalModal;