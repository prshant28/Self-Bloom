import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

const CategoryManager = ({ isOpen, setIsOpen, title, description, existingItems = [], onUpdate, itemTypeLabel = "category" }) => {
  const { toast } = useToast();
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddItem = async () => {
    if (!newItem.trim()) {
      toast({ title: `${itemTypeLabel.charAt(0).toUpperCase() + itemTypeLabel.slice(1)} name cannot be empty`, variant: 'destructive' });
      return;
    }
    if (existingItems.some(item => item.toLowerCase() === newItem.trim().toLowerCase())) {
        toast({ title: `${itemTypeLabel.charAt(0).toUpperCase() + itemTypeLabel.slice(1)} already exists`, variant: 'destructive' });
        return;
    }
    setLoading(true);
    
    const updatedItems = [...existingItems, newItem.trim()];
    await onUpdate(updatedItems, 'add', newItem.trim());
    
    toast({ title: `✅ ${itemTypeLabel.charAt(0).toUpperCase() + itemTypeLabel.slice(1)} "${newItem.trim()}" added.` });
    setNewItem('');
    setLoading(false);
  };
  
  const handleDeleteItem = async (itemToDelete) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the "${itemToDelete}" ${itemTypeLabel}? This action cannot be undone and might affect existing items.`);
    if (isConfirmed) {
      const updatedItems = existingItems.filter(item => item !== itemToDelete);
      await onUpdate(updatedItems, 'delete', itemToDelete);
      toast({ title: `🗑️ ${itemTypeLabel.charAt(0).toUpperCase() + itemTypeLabel.slice(1)} "${itemToDelete}" removed.` });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder={`New ${itemTypeLabel} name...`}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <Button onClick={handleAddItem} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                <p className="text-sm font-medium text-muted-foreground">Existing {itemTypeLabel}s:</p>
                {existingItems.length > 0 ? (
                    <ul className="space-y-1">
                        {existingItems.map((item) => (
                        <li key={item} className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm">
                            <span>{item}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteItem(item)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-center text-muted-foreground py-4">No custom {itemTypeLabel}s yet.</p>
                )}
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager;