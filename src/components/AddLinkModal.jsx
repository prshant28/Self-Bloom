import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AddLinkModal = ({ isOpen, setIsOpen, link, onSuccess, existingCategories = [] }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ title: '', url: '', category: '', icon_url: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (link) {
            setFormData({
                title: link.title || '',
                url: link.url || '',
                category: link.category || '',
                icon_url: link.icon_url || '',
            });
        } else {
            setFormData({ title: '', url: '', category: '', icon_url: '' });
        }
    }
  }, [link, isOpen]);
  
  const handleValueChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      return;
    }
    if (!formData.url || !formData.title) {
        toast({ title: 'URL and Title are required', variant: 'destructive' });
        return;
    }

    setLoading(true);
    
    const linkData = {
      ...formData,
      category: (formData.category?.trim() === 'uncategorized' || !formData.category?.trim()) ? null : formData.category.trim(),
      user_id: user.id,
    };

    if (!link) {
        const { data: existingLink, error: checkError } = await supabase
            .from('quick_links')
            .select('id')
            .eq('user_id', user.id)
            .eq('url', linkData.url)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            setLoading(false);
            toast({ title: 'Error checking for duplicates', description: checkError.message, variant: 'destructive' });
            return;
        }

        if (existingLink) {
            setLoading(false);
            toast({ title: 'Link already exists!', description: 'You have already saved this URL.', variant: 'destructive' });
            return;
        }
    }

    let error;
    if (link) {
      ({ error } = await supabase.from('quick_links').update(linkData).eq('id', link.id));
    } else {
      ({ error } = await supabase.from('quick_links').insert(linkData));
    }

    setLoading(false);

    if (error) {
      toast({ title: 'Error saving link', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `✅ Link ${link ? 'updated' : 'added'}!` });
      onSuccess();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{link ? 'Edit Quick Link' : 'Add New Quick Link'}</DialogTitle>
          <DialogDescription>
            Save a link for easy access from your dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" value={formData.url} onChange={(e) => handleValueChange('url', e.target.value)} placeholder="https://example.com" required />
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={(e) => handleValueChange('title', e.target.value)} placeholder="e.g., ChatGPT" required />
          </div>
          <div>
            <Label>Category (Optional)</Label>
            <Select value={formData.category || 'uncategorized'} onValueChange={(value) => handleValueChange('category', value === 'uncategorized' ? '' : value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    {existingCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="icon_url">Icon URL (Optional)</Label>
            <Input id="icon_url" name="icon_url" value={formData.icon_url} onChange={(e) => handleValueChange('icon_url', e.target.value)} placeholder="https://example.com/icon.png" />
            <p className="text-xs text-muted-foreground mt-1">If left blank, the website's favicon will be used.</p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {link ? 'Save Changes' : 'Add Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLinkModal;