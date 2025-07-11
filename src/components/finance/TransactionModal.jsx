import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const defaultCategories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Food', 'Travel', 'Subscription', 'Shopping', 'Utilities', 'Rent', 'Entertainment', 'Other']
};

const TransactionModal = ({ isOpen, setIsOpen, onSuccess, currency, prefillData, onClose, existingCategories }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'expense',
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        amount: ''
    });

    useEffect(() => {
        if (isOpen) {
            const initialData = {
                type: 'expense',
                transaction_date: new Date().toISOString().split('T')[0],
                description: '',
                category: '',
                amount: '',
                ...prefillData
            };
            setFormData(initialData);
        }
    }, [prefillData, isOpen]);
    
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    const handleSelectChange = (name, value) => {
        if (name === 'type') {
            setFormData(prev => ({...prev, type: value, category: ''}));
        } else {
            setFormData(prev => ({...prev, [name]: value}));
        }
    }

    const handleClose = () => {
        setIsOpen(false);
        if(onClose) onClose();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.from('transactions').insert({ 
            ...formData, 
            category: (formData.category?.trim() === 'uncategorized' || !formData.category?.trim()) ? null : formData.category.trim(),
            user_id: user.id, 
            currency: currency 
        });
        if (error) {
            toast({ title: 'Error saving transaction', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: '✅ Transaction Added!' });
            onSuccess();
            handleClose();
        }
        setLoading(false);
    };

    const categoryOptions = useMemo(() => {
        const type = formData.type || 'expense';
        return existingCategories?.[type] || [];
    }, [formData.type, existingCategories]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Transaction</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="type">Type</Label>
                        <Select name="type" onValueChange={(v) => handleSelectChange('type', v)} value={formData.type || 'expense'} required>
                            <SelectTrigger id="type"><SelectValue placeholder="Select Type"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" name="description" placeholder="e.g., Coffee with a friend" value={formData.description || ''} onChange={handleChange} required />
                    </div>
                    
                    <div>
                        <Label>Category (Optional)</Label>
                        <Select value={formData.category || 'uncategorized'} onValueChange={(value) => handleSelectChange('category', value === 'uncategorized' ? '' : value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                                {categoryOptions.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" value={formData.amount || ''} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="transaction_date">Date</Label>
                        <Input id="transaction_date" name="transaction_date" type="date" value={formData.transaction_date || ''} onChange={handleChange} required />
                    </div>
                    <DialogFooter><Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Save Transaction'}</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default TransactionModal;