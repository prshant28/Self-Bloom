import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const WishlistModal = ({ isOpen, setIsOpen, onSuccess, item }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if(item) {
            setFormData({
                name: item.name || '',
                category: item.category || '',
                price: item.price || '',
                url: item.url || '',
            });
        } else {
            setFormData({ name: '', category: '', price: '', url: '' });
        }
    }, [item]);
    
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = { ...formData, user_id: user.id };
        
        const { error } = item 
            ? await supabase.from('wishlist_items').update(payload).eq('id', item.id)
            : await supabase.from('wishlist_items').insert(payload);
        
        if (error) {
            toast({ title: `Error ${item ? 'updating' : 'adding'} item`, description: error.message, variant: 'destructive' });
        } else {
            toast({ title: `✅ Wishlist ${item ? 'Updated' : 'Added'}!` });
            onSuccess();
            setIsOpen(false);
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{item ? 'Edit' : 'Add to'} Wishlist</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <Input name="name" placeholder="Item Name" value={formData.name || ''} onChange={handleChange} required />
                    <Input name="category" placeholder="Category (e.g., Gadget, Travel)" value={formData.category || ''} onChange={handleChange} required />
                    <Input name="price" type="number" step="0.01" placeholder="Price" value={formData.price || ''} onChange={handleChange} />
                    <Input name="url" placeholder="Item URL (e.g., https://amazon.com/...)" value={formData.url || ''} onChange={handleChange} />
                    <DialogFooter><Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Save'}</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default WishlistModal;