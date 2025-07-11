import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const MediaViewer = ({ isOpen, setIsOpen, track }) => {
  if (!isOpen || !track) return null;

  const renderContent = () => {
    if (!track.url) {
        if (track.content_type === 'note' && track.text_content) {
            return <div className="p-6 whitespace-pre-wrap">{track.text_content}</div>;
        }
        return <div className="p-6">No content to display.</div>;
    }

    if (track.url.includes('youtube.com')) {
      return <iframe src={track.url} title={track.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>;
    }
    if (track.url.includes('instagram.com')) {
      return <iframe src={track.url} title={track.title} frameBorder="0" scrolling="no" allowTransparency={true} className="w-full h-full"></iframe>;
    }

    switch (track.content_type) {
      case 'video':
        return <video src={track.url} controls autoPlay className="w-full h-full object-contain"></video>;
      case 'audio':
        return <div className="p-6 flex flex-col items-center justify-center h-full"><h2 className="text-2xl font-bold mb-4">{track.title}</h2><audio src={track.url} controls autoPlay className="w-full max-w-md"></audio></div>;
      case 'pdf':
        return <iframe src={track.url} title={track.title} className="w-full h-full"></iframe>;
      case 'image':
        return <img src={track.url} alt={track.title} className="w-full h-full object-contain" />;
      case 'note':
        return <div className="p-6 whitespace-pre-wrap">{track.text_content}</div>;
      default:
        return <div className="p-6">Unsupported content type.</div>;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          className="relative w-full max-w-4xl h-[90vh] bg-background rounded-lg shadow-2xl shadow-primary/30 flex flex-col"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-lg">{track.title}</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}><X className="h-6 w-6" /></Button>
          </div>
          <div className="flex-grow overflow-auto">
            {renderContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MediaViewer;