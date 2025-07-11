import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Plus, UploadCloud, Search, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import MediaGrid from '@/components/media/MediaGrid';
import AddMediaModal from '@/components/media/AddMediaModal';
import MediaViewer from '@/components/media/MediaViewer';
import FolderSidebar from '@/components/media/FolderSidebar';
import TagFilters from '@/components/media/TagFilters';

const MediaHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [mediaContent, setMediaContent] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedFolder, setSelectedFolder] = useState(null); // null for 'All Files'
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const [mediaRes, foldersRes, tagsRes] = await Promise.all([
      supabase.from('media_content').select('*, media_content_tags(tags:media_tags(id, name, color))').or(`user_id.eq.${user.id},user_id.is.null`).order('created_at', { ascending: false }),
      supabase.from('media_folders').select('*').eq('user_id', user.id).order('name'),
      supabase.from('media_tags').select('*').eq('user_id', user.id).order('name')
    ]);

    if (mediaRes.error) toast({ title: 'Error fetching content', description: mediaRes.error.message, variant: 'destructive' });
    else {
        const formattedMedia = mediaRes.data.map(item => ({
            ...item,
            tags: item.media_content_tags.map(t => t.tags)
        }));
        setMediaContent(formattedMedia);
    }

    if (foldersRes.error) toast({ title: 'Error fetching folders', description: foldersRes.error.message, variant: 'destructive' });
    else setFolders(foldersRes.data);

    if (tagsRes.error) toast({ title: 'Error fetching tags', description: tagsRes.error.message, variant: 'destructive' });
    else setTags(tagsRes.data);

    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('realtime-media-hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media_content' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media_folders' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media_tags' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media_content_tags' }, fetchData)
      .subscribe();
    
    return () => supabase.removeChannel(channel);
  }, [fetchData]);

  const handleOpenViewer = (track) => {
    setCurrentTrack(track);
    setIsViewerOpen(true);
  };

  const filteredContent = mediaContent.filter(item => {
    const inFolder = selectedFolder ? item.folder_id === selectedFolder : true;
    const hasTags = selectedTags.length > 0 ? selectedTags.every(tagId => item.tags.some(t => t.id === tagId)) : true;
    const matchesSearch = searchTerm ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return inFolder && hasTags && matchesSearch;
  });

  return (
    <>
      <div className="flex gap-6 h-full">
        <FolderSidebar 
            folders={folders}
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            onRefresh={fetchData}
        />
        <div className="flex-1 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="text-left">
                <h1 className="font-display text-4xl font-bold text-glow mb-2">Knowledge Hub</h1>
                <p className="text-lg opacity-75">Your personal learning library.</p>
              </div>
              <Button onClick={() => setIsModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Media</Button>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search by title..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <TagFilters tags={tags} selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
            </div>

            {loading ? (
              <div className="text-center py-16 glass-card">Loading...</div>
            ) : filteredContent.length > 0 ? (
              <MediaGrid 
                media={filteredContent} 
                onView={handleOpenViewer} 
                onRefresh={fetchData} 
              />
            ) : (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16 glass-card">
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No content found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or add new media.</p>
                <Button className="mt-6" onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Media
                </Button>
              </motion.div>
            )}
        </div>
      </div>

      <AddMediaModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchData}
        folders={folders}
        tags={tags}
      />
      
      <MediaViewer 
        isOpen={isViewerOpen}
        setIsOpen={setIsViewerOpen}
        track={currentTrack}
      />
    </>
  );
};

export default MediaHub;