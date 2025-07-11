import React from 'react';
import { motion } from 'framer-motion';
import { Film, Music, File as FileIcon, FileText, Brain, Image as ImageIcon } from 'lucide-react';

const mediaCategories = [
  { id: 'all', label: 'All Media', icon: <Brain size={18} /> },
  { id: 'video', label: 'Video', icon: <Film size={18} /> },
  { id: 'image', label: 'Image', icon: <ImageIcon size={18} /> },
  { id: 'audio', label: 'Audio', icon: <Music size={18} /> },
  { id: 'pdf', label: 'PDF', icon: <FileIcon size={18} /> },
  { id: 'note', label: 'Note', icon: <FileText size={18} /> },
];

const MediaCategories = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="flex flex-wrap gap-2">
        {mediaCategories.map((c) => (
          <motion.button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${selectedCategory === c.id ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {c.icon} {c.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default MediaCategories;