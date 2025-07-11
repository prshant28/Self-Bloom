import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, Check, X, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import CategoryManager from '@/components/CategoryManager';

const TagFilters = ({ tags, selectedTags, setSelectedTags, onTagsUpdate }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

    const handleTagClick = (tagId) => {
        setSelectedTags(prev => 
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    const handleTagManagerUpdate = async (updatedTags, action, item) => {
        if (action === 'add') {
            const { error } = await supabase.from('media_tags').insert({ name: item, user_id: user.id });
            if (error) {
                toast({ title: 'Error creating tag', description: error.message, variant: 'destructive' });
            }
        } else if (action === 'delete') {
            const tagToDelete = tags.find(t => t.name === item);
            if (tagToDelete) {
                const { error } = await supabase.from('media_tags').delete().eq('id', tagToDelete.id);
                if (error) {
                    toast({ title: 'Error deleting tag', description: error.message, variant: 'destructive' });
                }
            }
        }
        onTagsUpdate();
    };

    return (
        <>
        <div className="flex flex-wrap gap-2 items-center">
            {tags.map(tag => (
                <motion.button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.id)}
                    className={`px-3 py-1.5 rounded-full font-medium text-sm transition-all flex items-center gap-2 border-2 ${selectedTags.includes(tag.id) ? 'bg-primary border-primary text-primary-foreground' : 'bg-accent border-transparent hover:bg-accent/80'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Tag size={14} /> {tag.name}
                </motion.button>
            ))}
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setIsTagManagerOpen(true)}>
                <FolderPlus size={16} className="mr-2" /> Manage Tags
            </Button>
        </div>
        <CategoryManager
            isOpen={isTagManagerOpen}
            setIsOpen={setIsTagManagerOpen}
            title="Manage Media Tags"
            description="Add or remove tags for your media content."
            existingItems={tags.map(t => t.name)}
            onUpdate={handleTagManagerUpdate}
            itemTypeLabel="tag"
        />
        </>
    );
};

export default TagFilters;