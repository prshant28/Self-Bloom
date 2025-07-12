import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import FinancialOverview from '@/components/finance/FinancialOverview';
import Charts from '@/components/finance/Charts';
import IncomeIdeas from '@/components/finance/IncomeIdeas';
import Wishlist from '@/components/finance/Wishlist';
import TransactionModal from '@/components/finance/TransactionModal';
import WishlistModal from '@/components/finance/WishlistModal';
import IdeaModal from '@/components/finance/IdeaModal';
import FinanceSettingsModal from '@/components/finance/FinanceSettingsModal';
import CategoryManager from '@/components/CategoryManager';

const FinanceTrackerPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [incomeIdeas, setIncomeIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [isWishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [isIdeaModalOpen, setIdeaModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingIdea, setEditingIdea] = useState(null);
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [itemToLog, setItemToLog] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isEditingIdeaList, setIsEditingIdeaList] = useState(false);
  const [editedIdeaTitle, setEditedIdeaTitle] = useState('');
  const [editingIdeaId, setEditingIdeaId] = useState(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [categoryManagerType, setCategoryManagerType] = useState('expense');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [transactionsRes, wishlistRes, profileRes, ideasRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user.id).order('transaction_date', { ascending: false }),
      supabase.from('wishlist_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('user_profiles').select('preferred_currency').eq('id', user.id).single(),
      supabase.from('income_ideas').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);

    if (transactionsRes.error) toast({ title: 'Error fetching transactions', variant: 'destructive' });
    else setTransactions(transactionsRes.data || []);

    if (wishlistRes.error) toast({ title: 'Error fetching wishlist', variant: 'destructive' });
    else setWishlist(wishlistRes.data || []);
    
    if (ideasRes.error) toast({ title: 'Error fetching income ideas', variant: 'destructive' });
    else setIncomeIdeas(ideasRes.data || []);

    if (profileRes.data) setPreferredCurrency(profileRes.data.preferred_currency || 'USD');
    
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (table, id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) toast({title: "Error deleting item", variant: 'destructive'});
    else {
      toast({title: "🗑️ Item deleted"});
      fetchData();
    }
  };

  const markAsObtained = async (item) => {
    const {error} = await supabase.from('wishlist_items').update({status: 'obtained'}).eq('id', item.id);
    if(error) {
      toast({title: "Error updating item", variant: 'destructive'});
    } else {
      toast({title: "🎉 Congrats on your new item!"});
      setItemToLog(item);
      fetchData();
    }
  };

  const handleLogExpense = () => {
    if(!itemToLog) return;
    setTransactionModalOpen(true);
  }

  const updateIdeaStatus = async (id, status) => {
    const { error } = await supabase.from('income_ideas').update({ status }).eq('id', id);
    if(error) toast({title: "Error updating idea", variant: "destructive"});
    else {
      toast({title: `💡 Idea status updated!`});
      fetchData();
    }
  };
  
  const convertToGoal = (idea) => {
    navigate('/app/goals', { state: { newGoalFromIdea: { ...idea } } });
  };

  const handleUpdateIdeaTitle = async () => {
    if (!editedIdeaTitle.trim() || !editingIdeaId) return;
    const { error } = await supabase.from('income_ideas').update({ title: editedIdeaTitle }).eq('id', editingIdeaId);
    if (error) {
      toast({ title: 'Error updating idea', variant: 'destructive' });
    } else {
      toast({ title: 'Idea updated!' });
      fetchData();
    }
    setEditingIdeaId(null);
    setEditedIdeaTitle('');
  };

  const openCategoryManager = (type) => {
    setCategoryManagerType(type);
    setIsCategoryManagerOpen(true);
  };

  const handleCategoriesUpdate = async (updatedCategories, action, item) => {
    if (action === 'delete') {
        const { error } = await supabase
            .from('transactions')
            .update({ category: null })
            .eq('user_id', user.id)
            .eq('category', item);
        if (error) {
            toast({ title: 'Error un-categorizing transactions', description: error.message, variant: 'destructive' });
        }
    }
    fetchData();
  };
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const existingCategories = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (!acc[t.type]) acc[t.type] = [];
      if (t.category && !acc[t.type].includes(t.category)) {
        acc[t.type].push(t.category);
      }
      return acc;
    }, { income: [], expense: [] });
  }, [transactions]);

  return (
    <div className="space-y-8">
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        setIsOpen={setTransactionModalOpen} 
        onSuccess={fetchData} 
        currency={preferredCurrency}
        existingCategories={existingCategories}
        prefillData={itemToLog ? { 
          type: 'expense', 
          description: itemToLog.name, 
          category: itemToLog.category,
          amount: itemToLog.price
        } : null}
        onClose={() => setItemToLog(null)}
      />
      <WishlistModal 
        isOpen={isWishlistModalOpen || !!editingItem} 
        setIsOpen={() => { setWishlistModalOpen(false); setEditingItem(null); }} 
        onSuccess={fetchData} 
        item={editingItem} 
      />
      <IdeaModal 
        isOpen={isIdeaModalOpen || !!editingIdea} 
        setIsOpen={() => { setIdeaModalOpen(false); setEditingIdea(null); }} 
        onSuccess={fetchData} 
        idea={editingIdea} 
      />
      <FinanceSettingsModal
        isOpen={isSettingsModalOpen}
        setIsOpen={setSettingsModalOpen}
        preferredCurrency={preferredCurrency}
        setPreferredCurrency={setPreferredCurrency}
        transactions={transactions}
        onCategoriesUpdate={fetchData}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-glow mb-2">Finance Management</h1>
          <p className="text-md md:text-lg opacity-75">Your personal command center for financial wellness.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSettingsModalOpen(true)} size="sm"><Settings className="md:mr-2 h-4 w-4" /><span className="hidden md:inline">Settings</span></Button>
            <Button variant="outline" onClick={() => openCategoryManager('expense')} size="sm">📁 Expense</Button>
            <Button variant="outline" onClick={() => openCategoryManager('income')} size="sm">📁 Income</Button>
            <Button onClick={() => setTransactionModalOpen(true)} size="sm"><Plus className="md:mr-2 h-4 w-4" /><span className="hidden md:inline">Add Transaction</span></Button>
        </div>
      </motion.div>
      
      <FinancialOverview 
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        currency={preferredCurrency}
      />
      
      <Charts 
        transactions={transactions}
        currency={preferredCurrency}
      />
      
      <IncomeIdeas 
        ideas={incomeIdeas}
        onAdd={() => setIdeaModalOpen(true)}
        onEdit={(idea) => setEditingIdea(idea)}
        onStatusChange={updateIdeaStatus}
        onConvertToGoal={convertToGoal}
        showArchived={showArchived}
        setShowArchived={setShowArchived}
        onDelete={(id) => handleDelete('income_ideas', id)}
        isEditing={isEditingIdeaList}
        setIsEditing={setIsEditingIdeaList}
        onUpdateTitle={handleUpdateIdeaTitle}
        editedTitle={editedIdeaTitle}
        setEditedTitle={setEditedIdeaTitle}
        editingId={editingIdeaId}
        setEditingId={setEditingIdeaId}
      />

      <Wishlist 
        wishlist={wishlist}
        onAdd={() => setWishlistModalOpen(true)}
        onEdit={(item) => setEditingItem(item)}
        onDelete={(id) => handleDelete('wishlist_items', id)}
        onObtain={markAsObtained}
        currency={preferredCurrency}
        onLogExpense={handleLogExpense}
        itemToLog={itemToLog}
        setItemToLog={setItemToLog}
      />

      <CategoryManager
        isOpen={isCategoryManagerOpen}
        setIsOpen={setIsCategoryManagerOpen}
        title={`Manage ${categoryManagerType.charAt(0).toUpperCase() + categoryManagerType.slice(1)} Categories`}
        description={`Add or remove categories for your ${categoryManagerType} transactions.`}
        existingItems={existingCategories[categoryManagerType] || []}
        onUpdate={handleCategoriesUpdate}
        itemTypeLabel="category"
      />
    </div>
  );
};

export default FinanceTrackerPage;