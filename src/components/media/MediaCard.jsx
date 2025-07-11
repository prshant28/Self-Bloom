import React from 'react';
import { motion } from 'framer-motion';
import { Play, Music, Film, FileText, File as FileIcon, Brain, CheckCircle, Star, Share2, Trash2, Download, Tag, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const getIconForType = (type, size = 48) => {
  const className = "text-primary";
  switch (type) {
    case 'video': return <Film size={size} className={className} />;
    case 'audio': return <Music size={size} className={className} />;
    case 'pdf': return <FileIcon size={size} className={className} />;
    case 'note': return <FileText size={size} className={className} />;
    case 'image': return <FileIcon size={size} className={className} />;
    default: return <Brain size={size} className={className} />;
  }
};

const MediaCard = ({ item, onView, onRefresh }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDelete = async () => {
    await supabase.from('media_content_tags').delete().eq('media_id', item.id);
    const { error } = await supabase.from('media_content').delete().eq('id', item.id);
    if (error) {
      toast({ title: 'Error deleting content', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '🗑️ Content Deleted' });
      onRefresh();
    }
  };

  const handleToggle = async (field) => {
    const { error } = await supabase.from('media_content').update({ [field]: !item[field] }).eq('id', item.id);
    if (error) {
      toast({ title: `Error updating ${field}`, description: error.message, variant: 'destructive' });
    } else {
      onRefresh();
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: item.title,
      text: `Check out this content from SelfBloom: ${item.title}`,
      url: item.url,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({title: "Shared successfully!"});
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast({title: "Sharing failed", description: "Could not share at this time.", variant: "destructive"});
        }
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(item.url);
        toast({
          title: "Link Copied!",
          description: "Sharing not available, so the link was copied to your clipboard.",
          action: <Copy className="h-4 w-4" />,
        });
      } catch (err) {
        toast({title: "Copy Failed", description: "Could not copy the link.", variant: "destructive"});
      }
    } else {
      toast({title: "Sharing not supported", description: "Cannot share or copy on this browser.", variant: "destructive"});
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = item.url;
    link.setAttribute('download', item.title || 'download'); 
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      className="glass-card overflow-hidden group flex flex-col"
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: item.index * 0.05 }}
      whileHover={{ y: -5 }}
    >
      <div className="relative aspect-video bg-accent cursor-pointer" onClick={() => onView(item)}>
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getIconForType(item.content_type, 64)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        {item.content_type === 'video' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Play ${item.title}`}>
            <Play />
          </div>
        )}
        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs flex items-center gap-1">
          {getIconForType(item.content_type, 14)}
          <span className='capitalize'>{item.content_type}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">{item.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{item.author}</p>
          {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map(tag => (
                      <div key={tag.id} className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary font-semibold flex items-center gap-1">
                          <Tag size={12} /> {tag.name}
                      </div>
                  ))}
              </div>
          )}
        </div>
        <div className="border-t border-white/10 pt-3 mt-auto">
          <div className="flex justify-around items-center text-muted-foreground">
            {item.user_id === user?.id ? (
              <>
                <Button variant="ghost" size="icon" className={`h-8 w-8 ${item.is_completed ? 'text-green-400' : ''}`} onClick={() => handleToggle('is_completed')}><CheckCircle size={18} /></Button>
                <Button variant="ghost" size="icon" className={`h-8 w-8 ${item.is_favorite ? 'text-yellow-400' : ''}`} onClick={() => handleToggle('is_favorite')}><Star size={18} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}><Download size={18} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare}><Share2 size={18} /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive"><Trash2 size={18} /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete this media item.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <Button variant="outline" size="sm" className="w-full" onClick={() => onView(item)}>
                <ExternalLink className="mr-2 h-4 w-4" /> Open
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MediaCard;