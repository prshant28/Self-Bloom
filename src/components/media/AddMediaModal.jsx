import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Link, Upload, Tag, FolderPlus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import CategoryManager from '@/components/CategoryManager';

const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  return match ? match[1] : null;
};

const getInstagramId = (url) => {
    if (!url) return null;
    const instaRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/;
    const match = url.match(instaRegex);
    return match ? match[1] : null;
}

const AddMediaModal = ({ isOpen, setIsOpen, onSuccess, folders, tags: allTags, onTagsUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMediaType, setNewMediaType] = useState('video');
  const [uploading, setUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    url: '',
    text_content: '',
    add_method: 'link',
    file: null,
    folder_id: null,
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form on open
      setFormData({ title: '', author: '', url: '', text_content: '', add_method: 'link', file: null, folder_id: null });
      setSelectedTags([]);
    }
  }, [isOpen]);

  const handleValueChange = (name, value, files = null) => {
    if (name === 'file') {
      setFormData(prev => ({ ...prev, file: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => 
        prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSaveTrack = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Authentication Error', variant: 'destructive' });
      return;
    }
    setUploading(true);

    let trackData = {
      title: formData.title,
      author: formData.author,
      content_type: newMediaType,
      user_id: user.id,
      url: formData.url,
      folder_id: formData.folder_id === 'uncategorized' ? null : formData.folder_id,
    };

    try {
      if (newMediaType === 'video') {
        if (formData.add_method === 'link') {
          const youtubeId = getYouTubeVideoId(formData.url);
          const instagramId = getInstagramId(formData.url);

          if (youtubeId) {
            trackData.url = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
            trackData.thumbnail_url = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
          } else if (instagramId) {
            trackData.url = `https://www.instagram.com/p/${instagramId}/embed`;
          } else {
             trackData.url = formData.url;
          }
        } else {
          if (!formData.file) {
            toast({ title: 'No video file selected', variant: 'destructive' });
            setUploading(false); return;
          }
          const filePath = `${user.id}/${Date.now()}-${formData.file.name}`;
          const { error: uploadError } = await supabase.storage.from('files-upload').upload(filePath, formData.file);
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from('files-upload').getPublicUrl(filePath);
          trackData.url = data.publicUrl;
        }
      } else if (newMediaType === 'image') {
          if (formData.add_method === 'link') {
              trackData.url = formData.url;
              trackData.thumbnail_url = formData.url;
          } else {
             if (!formData.file) {
                toast({ title: `No image file selected`, variant: 'destructive' });
                setUploading(false); return;
              }
              const filePath = `${user.id}/${Date.now()}-${formData.file.name}`;
              const { error: uploadError } = await supabase.storage.from('files-upload').upload(filePath, formData.file);
              if (uploadError) throw uploadError;
              const { data } = supabase.storage.from('files-upload').getPublicUrl(filePath);
              trackData.url = data.publicUrl;
              trackData.thumbnail_url = data.publicUrl;
          }
      } else if (newMediaType === 'audio' || newMediaType === 'pdf') {
        if (!formData.file) {
          toast({ title: `No ${newMediaType} file selected`, variant: 'destructive' });
          setUploading(false); return;
        }
        const filePath = `${user.id}/${Date.now()}-${formData.file.name}`;
        const { error: uploadError } = await supabase.storage.from('files-upload').upload(filePath, formData.file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('files-upload').getPublicUrl(filePath);
        trackData.url = data.publicUrl;
      } else if (newMediaType === 'note') {
        trackData.text_content = formData.text_content;
      }

      const { data: newMedia, error } = await supabase.from('media_content').insert(trackData).select().single();
      if (error) throw error;

      if (selectedTags.length > 0) {
          const tagsToLink = selectedTags.map(tagId => ({
              media_id: newMedia.id,
              tag_id: tagId
          }));
          const { error: tagError } = await supabase.from('media_content_tags').insert(tagsToLink);
          if (tagError) {
              toast({ title: 'Error linking tags', description: tagError.message, variant: 'destructive' });
          }
      }

      toast({ title: `✅ Content added!`, description: "Your Knowledge Hub has been updated." });
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      toast({ title: 'Error saving content', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleTagManagerUpdate = async (updatedTags, action, item) => {
    if (action === 'add') {
        const { data, error } = await supabase.from('media_tags').insert({ name: item, user_id: user.id }).select().single();
        if (error) {
            toast({ title: 'Error creating tag', description: error.message, variant: 'destructive' });
        }
    } else if (action === 'delete') {
        const tagToDelete = allTags.find(t => t.name === item);
        if (tagToDelete) {
            // Deleting from media_content_tags is handled by RLS cascade delete on media_tags
            const { error } = await supabase.from('media_tags').delete().eq('id', tagToDelete.id);
            if (error) {
                toast({ title: 'Error deleting tag', description: error.message, variant: 'destructive' });
            }
        }
    }
    onTagsUpdate(); // This will trigger a refetch in the parent
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add New Media</DialogTitle></DialogHeader>
        <form onSubmit={handleSaveTrack} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Content Type</Label>
              <Select onValueChange={setNewMediaType} defaultValue={newMediaType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="note">Custom Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newMediaType === 'video' && (
              <Tabs defaultValue="link" className="w-full" onValueChange={(value) => handleValueChange('add_method', value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="link"><Link className="mr-2 h-4 w-4" />Link</TabsTrigger>
                  <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" />Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="link" className="pt-4">
                  <Label htmlFor="url">Video URL (YouTube, Instagram, etc.)</Label>
                  <Input id="url" name="url" value={formData.url} onChange={(e) => handleValueChange('url', e.target.value)} placeholder="https://..." />
                </TabsContent>
                <TabsContent value="upload" className="pt-4">
                  <Label htmlFor="file">Video File</Label>
                  <Input id="file" name="file" type="file" accept="video/*" onChange={(e) => handleValueChange('file', e.target.name, e.target.files)} />
                </TabsContent>
              </Tabs>
            )}

            <div><Label htmlFor="title">Title</Label><Input id="title" name="title" value={formData.title} onChange={(e) => handleValueChange('title', e.target.value)} required /></div>
            <div><Label htmlFor="author">Author/Creator</Label><Input id="author" name="author" value={formData.author} onChange={(e) => handleValueChange('author', e.target.value)} /></div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Folder</Label>
                    <Select onValueChange={(value) => handleValueChange('folder_id', value)} defaultValue="uncategorized">
                        <SelectTrigger><SelectValue placeholder="Uncategorized" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="uncategorized">Uncategorized</SelectItem>
                            {folders.map(folder => (
                                <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Tags</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start font-normal">
                                <Tag className="mr-2 h-4 w-4" />
                                {selectedTags.length > 0 ? `${selectedTags.length} selected` : "Select tags"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                                {allTags.length > 0 ? allTags.map(tag => (
                                    <div key={tag.id} className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer" onClick={(e) => { e.preventDefault(); handleTagToggle(tag.id); }}>
                                        <Checkbox id={`tag-${tag.id}`} checked={selectedTags.includes(tag.id)} onCheckedChange={() => handleTagToggle(tag.id)} />
                                        <label htmlFor={`tag-${tag.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">{tag.name}</label>
                                    </div>
                                )) : <p className="p-2 text-xs text-center text-muted-foreground">No tags created yet.</p>}
                            </div>
                            <div className="p-2 border-t">
                                <Button variant="ghost" className="w-full justify-start" onClick={() => setIsTagManagerOpen(true)}>
                                    <FolderPlus className="mr-2 h-4 w-4" /> Manage Tags
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            
            {newMediaType === 'image' && (
               <Tabs defaultValue="link" className="w-full" onValueChange={(value) => handleValueChange('add_method', value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="link"><Link className="mr-2 h-4 w-4" />Link</TabsTrigger>
                  <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" />Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="link" className="pt-4">
                  <Label htmlFor="url">Image URL</Label>
                  <Input id="url" name="url" value={formData.url} onChange={(e) => handleValueChange('url', e.target.value)} placeholder="https://..." />
                </TabsContent>
                <TabsContent value="upload" className="pt-4">
                  <Label htmlFor="file">Image File</Label>
                  <Input id="file" name="file" type="file" accept="image/*" onChange={(e) => handleValueChange('file', e.target.name, e.target.files)} />
                </TabsContent>
              </Tabs>
            )}
            {newMediaType === 'audio' && <div><Label htmlFor="file">Audio File</Label><Input id="file" name="file" type="file" accept="audio/*" onChange={(e) => handleValueChange('file', e.target.name, e.target.files)} required /></div>}
            {newMediaType === 'pdf' && <div><Label htmlFor="file">PDF File</Label><Input id="file" name="file" type="file" accept=".pdf" onChange={(e) => handleValueChange('file', e.target.name, e.target.files)} required /></div>}
            {newMediaType === 'note' && <div><Label htmlFor="text_content">Note</Label><Textarea id="text_content" name="text_content" value={formData.text_content} onChange={(e) => handleValueChange('text_content', e.target.value)} placeholder="Your notes here..." required /></div>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={uploading}>
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <CategoryManager
        isOpen={isTagManagerOpen}
        setIsOpen={setIsTagManagerOpen}
        title="Manage Media Tags"
        description="Add or remove tags for your media content."
        existingItems={allTags.map(t => t.name)}
        onUpdate={handleTagManagerUpdate}
        itemTypeLabel="tag"
    />
    </>
  );
};

export default AddMediaModal;