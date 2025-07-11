import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Play, Pause, Headphones, Music, Film, Plus, UploadCloud, Trash2, MoreVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const AudioLearning = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [mediaContent, setMediaContent] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [isYouTube, setIsYouTube] = useState(false);

  const categories = [
    { id: 'all', label: 'All Media', icon: <Headphones size={18} /> },
    { id: 'audio', label: 'Audio', icon: <Music size={18} /> },
    { id: 'video', label: 'Video', icon: <Film size={18} /> }
  ];

  const fetchMediaContent = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('audio_content').select('*').or(`user_id.eq.${user.id},user_id.is.null`);
    if (error) {
      toast({ title: 'Error fetching content', description: error.message, variant: 'destructive' });
    } else {
      setMediaContent(data);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchMediaContent();
  }, [fetchMediaContent]);

  useEffect(() => {
    if (audioElement) {
      audioElement.onplay = () => setIsPlaying(true);
      audioElement.onpause = () => setIsPlaying(false);
      audioElement.onended = () => {
        setIsPlaying(false);
        setCurrentTrack(null);
      };
    }
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  const handlePlay = (track) => {
    if (track.content_type === 'video') {
        setCurrentTrack(track);
        setIsVideoPreviewOpen(true);
        return;
    }

    if (currentTrack && currentTrack.id === track.id) {
      if (track.content_type === 'audio' && audioElement) {
        if (isPlaying) audioElement.pause();
        else audioElement.play();
      }
    } else {
      if (audioElement) audioElement.pause();
      setCurrentTrack(track);
      const newAudio = new Audio(track.url);
      setAudioElement(newAudio);
      newAudio.play();
    }
  };
  
  const getYouTubeVideoId = (url) => {
    let videoId = null;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
        videoId = match[1];
    }
    return videoId;
  };

  const handleSaveTrack = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    let url = formData.get('url');
    let thumbnailUrl = null;
    const isYouTubeVideo = formData.get('is_youtube') === 'on';

    if (isYouTubeVideo) {
        const videoId = getYouTubeVideoId(url);
        if (videoId) {
            url = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        } else {
            toast({ title: 'Invalid YouTube URL', description: 'Please provide a valid YouTube video link.', variant: 'destructive' });
            return;
        }
    }

    const trackData = {
      title: formData.get('title'),
      author: formData.get('author'),
      category: formData.get('category'),
      content_type: isYouTubeVideo ? 'video' : formData.get('content_type'),
      url: url,
      duration: formData.get('duration'),
      thumbnail_url: thumbnailUrl,
    };

    const payload = { ...trackData, user_id: user.id };
    let error;

    if (editingTrack) {
        ({ error } = await supabase.from('audio_content').update(payload).eq('id', editingTrack.id));
    } else {
        ({ error } = await supabase.from('audio_content').insert(payload));
    }

    if (error) {
        toast({ title: 'Error saving content', description: error.message, variant: 'destructive' });
    } else {
        toast({ title: `✅ Content ${editingTrack ? 'updated' : 'added'}!` });
        fetchMediaContent();
        setIsModalOpen(false);
        setEditingTrack(null);
    }
  };

  const handleDeleteTrack = async (trackId) => {
    const { error } = await supabase.from('audio_content').delete().eq('id', trackId);
    if (error) {
        toast({ title: 'Error deleting content', description: error.message, variant: 'destructive' });
    } else {
        toast({ title: '🗑️ Content Deleted' });
        fetchMediaContent();
    }
  };
  
  const filteredContent = selectedCategory === 'all'
    ? mediaContent
    : mediaContent.filter(item => item.content_type === selectedCategory);

  return (
    <>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div className="text-left">
            <h1 className="font-display text-4xl font-bold text-glow mb-2">Media Hub</h1>
            <p className="text-lg opacity-75">Your personal library of audio and video.</p>
          </div>
          <Button onClick={() => { setEditingTrack(null); setIsYouTube(false); setIsModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Media</Button>
        </motion.div>

        <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <motion.button key={c.id} onClick={() => setSelectedCategory(c.id)} className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${selectedCategory === c.id ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {c.icon} {c.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        {currentTrack && currentTrack.content_type === 'audio' && (
          <motion.div className="glass-card p-4 sticky bottom-20 md:bottom-6 z-40" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <div className="flex items-center space-x-4">
               <div className="w-16 h-16 rounded-lg object-cover bg-primary flex items-center justify-center">
                 <Music className="text-primary-foreground" size={32} />
               </div>
               <div className="flex-1">
                 <h3 className="font-semibold text-foreground">{currentTrack.title}</h3>
                 <p className="text-sm text-muted-foreground">{currentTrack.author}</p>
               </div>
               <button onClick={() => handlePlay(currentTrack)} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                 {isPlaying ? <Pause /> : <Play />}
               </button>
             </div>
          </motion.div>
        )}

        <AnimatePresence>
          {filteredContent.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item, index) => (
                <motion.div key={item.id} className="glass-card overflow-hidden group" layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.05 }} whileHover={{y: -5}}>
                  <div className="relative">
                    {item.thumbnail_url ? (
                      <img-replace src={item.thumbnail_url} alt={item.title} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 object-cover bg-accent flex items-center justify-center">
                        {item.content_type === 'video' ? <Film size={48} className="text-primary" /> : <Music size={48} className="text-primary" />}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <button onClick={() => handlePlay(item)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Play ${item.title}`}>
                      <Play />
                    </button>
                    {item.user_id === user.id && (
                        <div className="absolute top-2 right-2">
                            <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 bg-black/30 hover:bg-black/50"><MoreVertical className="h-4 w-4 text-white" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete this media item.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteTrack(item.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-foreground mb-1 truncate">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.author}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-muted-foreground">{item.duration}</span>
                      <span className="px-2 py-1 text-xs rounded bg-accent text-muted-foreground capitalize">{item.category}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
             <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16 glass-card">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">Your Media Hub is empty</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add your first audio or video to get started.</p>
              <Button className="mt-6" onClick={() => { setEditingTrack(null); setIsYouTube(false); setIsModalOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Media
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingTrack ? 'Edit Media' : 'Add New Media'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveTrack} className="space-y-4">
            <div><Label htmlFor="title">Title</Label><Input id="title" name="title" defaultValue={editingTrack?.title} required /></div>
            <div><Label htmlFor="author">Author/Creator</Label><Input id="author" name="author" defaultValue={editingTrack?.author} /></div>
            <div><Label htmlFor="category">Category</Label><Input id="category" name="category" defaultValue={editingTrack?.category} placeholder="e.g., Productivity, Wellness" /></div>
            <div className="flex items-center space-x-2">
                <Checkbox id="is_youtube" name="is_youtube" checked={isYouTube} onCheckedChange={setIsYouTube} />
                <Label htmlFor="is_youtube">Is this a YouTube video?</Label>
            </div>
            {!isYouTube && (
                <div><Label htmlFor="content_type">Type</Label><Select name="content_type" defaultValue={editingTrack?.content_type || 'audio'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="audio">Audio</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent></Select></div>
            )}
            <div><Label htmlFor="url">URL</Label><Input id="url" name="url" defaultValue={editingTrack?.url} placeholder={isYouTube ? "YouTube video link" : "https://..."} required /></div>
            <div><Label htmlFor="duration">Duration</Label><Input id="duration" name="duration" defaultValue={editingTrack?.duration} placeholder="e.g., 45:30" /></div>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AnimatePresence>
        {isVideoPreviewOpen && currentTrack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsVideoPreviewOpen(false)}
          >
            <motion.div 
              className="relative w-full max-w-4xl aspect-video"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <iframe 
                src={currentTrack.url} 
                title={currentTrack.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
                className="w-full h-full rounded-lg shadow-2xl shadow-primary/30"
              ></iframe>
               <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
                onClick={() => setIsVideoPreviewOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AudioLearning;