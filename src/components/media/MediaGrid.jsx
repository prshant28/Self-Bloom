import React from 'react';
import { AnimatePresence } from 'framer-motion';
import MediaCard from './MediaCard';

const MediaGrid = ({ media, onView, onRefresh }) => {
  return (
    <AnimatePresence>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {media.map((item, index) => (
          <MediaCard 
            key={item.id} 
            item={{...item, index: index}} 
            onView={onView} 
            onRefresh={onRefresh} 
          />
        ))}
      </div>
    </AnimatePresence>
  );
};

export default MediaGrid;