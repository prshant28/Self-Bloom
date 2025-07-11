import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const IdeaModal = ({ isOpen, setIsOpen, idea, onSuccess }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (idea) {
            setFormData({
                title: idea.title || '',
                tag: idea.tag || '',
                description: idea.description || '',
                potential: idea.potential || '',
                difficulty: idea.difficulty || '',
                plan_to_start: idea.plan_to_start || false,
                target_start_date: idea.target_start_date || '',
            });
        } else {
            setFormData({ title: '', tag: '', description: '', potential: '', difficulty: '', plan_to_start: false, target_start_date: '' });
        }
    }, [idea]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value }));
    }
    
    const handleSelectChange = (name, value) => {
        setFormData(prev => ({...prev, [name]: value}));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = { ...formData, user_id: user.id };
        if (!payload.target_start_date) {
            delete payload.target_start_date;
        }

        const { error } = idea
            ? await supabase.from('income_ideas').update(payload).eq('id', idea.id)
            : await supabase.from('income_ideas').insert(payload);
        
        if (error) {
            toast({ title: `Error ${idea ? 'updating' : 'saving'} idea`, description: error.message, variant: 'destructive' });
        } else {
            toast({ title: `💡 Idea ${idea ? 'updated' : 'saved'}!` });
            onSuccess();
            setIsOpen(false);
        }
        setLoading(false);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{idea ? 'Edit' : 'New'} Income Idea</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <Input name="title" placeholder="Idea Title (e.g., Start a YouTube channel)" value={formData.title} onChange={handleChange} required />
                    <Input name="tag" placeholder="Tag (e.g., Freelancing, Passive)" value={formData.tag} onChange={handleChange} />
                    <Textarea name="description" placeholder="Describe the idea..." value={formData.description} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-4">
                        <Select name="potential" onValueChange={(v) => handleSelectChange('potential', v)} value={formData.potential}>
                            <SelectTrigger><SelectValue placeholder="Est. Potential" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="< ₹1000">&lt; ₹1000</SelectItem>
                                <SelectItem value="₹1k–₹10k">₹1k – ₹10k</SelectItem>
                                <SelectItem value="₹10k+">₹10k+</SelectItem>
                            </SelectContent>
                        </Select>
                         <Select name="difficulty" onValueChange={(v) => handleSelectChange('difficulty', v)} value={formData.difficulty}>
                            <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="plan_to_start" name="plan_to_start" checked={formData.plan_to_start} onCheckedChange={(c) => handleSelectChange('plan_to_start', c)} />
                        <Label htmlFor="plan_to_start">Plan to Start?</Label>
                    </div>
                    {formData.plan_to_start && <Input name="target_start_date" type="date" value={formData.target_start_date || ''} onChange={handleChange} />}
                    <DialogFooter><Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Save Idea'}</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default IdeaModal;