import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Check, Trash2, ExternalLink } from 'lucide-react';
import { currencies } from '@/lib/finance';
import { getFaviconUrl } from '@/lib/utils';

const Wishlist = ({ wishlist, onAdd, onEdit, onDelete, onObtain, currency }) => {
    const currencySymbol = currencies.find(c => c.value === currency)?.label.split(' ')[0] || '$';

    return (
        <div className="glass-card p-4 md:p-6">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-glow">🎁 My Wishlist</h2>
                <Button onClick={onAdd} size="sm"><Plus className="md:mr-2 h-4 w-4" /><span className="hidden md:inline">Add Item</span></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map(item => (
                    <div key={item.id} className={`p-4 rounded-lg bg-background/50 ${item.status === 'obtained' ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <img src={getFaviconUrl(item.url)} alt="" className="w-8 h-8 rounded-md bg-muted" />
                                <div>
                                    <p className="font-bold text-sm md:text-base">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.category}</p>
                                </div>
                            </div>
                            {item.price && <p className="font-bold text-primary text-sm md:text-base">{currencySymbol}{parseFloat(item.price).toFixed(2)}</p>}
                        </div>
                        <div className="flex gap-2 mt-4 justify-end">
                            {item.url && <Button asChild size="sm" variant="outline"><a href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14}/></a></Button>}
                            {item.status === 'pending' && <Button size="sm" variant="outline" onClick={() => onEdit(item)}><Edit size={14}/></Button>}
                            {item.status === 'pending' && <Button size="sm" onClick={() => onObtain(item)}><Check size={14} /></Button>}
                            <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}><Trash2 size={14} /></Button>
                        </div>
                    </div>
                ))}
                {wishlist.length === 0 && <p className='text-center text-muted-foreground py-16 col-span-full'>Your wishlist is empty.</p>}
            </div>
        </div>
    );
};

export default Wishlist;