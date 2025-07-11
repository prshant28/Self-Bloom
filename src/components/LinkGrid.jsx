import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Link as LinkIcon, Loader2, Search, FolderPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LinkCard from '@/components/LinkCard';
import AddLinkModal from '@/components/AddLinkModal';
import { Link } from 'react-router-dom';
import CategoryManager from './CategoryManager';

const LinkGrid = ({ isDashboardCard = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchLinksAndCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('quick_links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching links', description: error.message, variant: 'destructive' });
    } else {
      setLinks(data || []);
      const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories.sort());
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchLinksAndCategories();
    }
  }, [user, fetchLinksAndCategories]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('realtime-quicklinks-grid')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quick_links', filter: `user_id=eq.${user?.id}`},
      (payload) => {
        fetchLinksAndCategories();
      }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [user, fetchLinksAndCategories]);

  const handleAddLink = () => {
    setEditingLink(null);
    setIsModalOpen(true);
  };

  const handleEditLink = (link) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };

  const handleDeleteLink = async (linkId) => {
    const { error } = await supabase.from('quick_links').delete().eq('id', linkId);
    if (error) {
      toast({ title: 'Error deleting link', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '🗑️ Link deleted' });
      // No need to call fetchLinks, realtime subscription will handle it
    }
  };

  const handleCategoriesUpdate = async (updatedCategories, action, item) => {
    setCategories(updatedCategories.sort());
    if (action === 'delete') {
        const { error } = await supabase
            .from('quick_links')
            .update({ category: null })
            .eq('user_id', user.id)
            .eq('category', item);
        if (error) {
            toast({ title: 'Error un-categorizing links', description: error.message, variant: 'destructive' });
        } else {
            fetchLinksAndCategories();
        }
    }
  };

  const categoryFilterOptions = useMemo(() => ['all', ...categories, 'Uncategorized'], [categories]);
  
  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      let linkCategory = link.category || 'Uncategorized';
      if (selectedCategory === 'all') return true;
      return linkCategory === selectedCategory;
    }).filter(link => {
      return searchTerm === '' || link.title.toLowerCase().includes(searchTerm.toLowerCase()) || link.url.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [links, selectedCategory, searchTerm]);

  const groupedLinks = useMemo(() => {
    return filteredLinks.reduce((acc, link) => {
      const category = link.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(link);
      return acc;
    }, {});
  }, [filteredLinks]);

  const cardLimit = isDashboardCard ? 8 : Infinity;

  return (
    <>
      <motion.div className="glass-card p-4 sm:p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-glow flex items-center shrink-0">
            <LinkIcon className="mr-3" /> Quick Links
          </h2>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search links..."
                    className="pl-9 h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px] h-9">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={() => setCategoryManagerOpen(true)} size="sm" variant="outline" className="h-9 shrink-0">
              <FolderPlus className="mr-2 h-4 w-4" /> Manage
            </Button>
            <Button onClick={handleAddLink} size="sm" className="h-9 shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin" /></div>
        ) : Object.keys(groupedLinks).length > 0 ? (
          <div className="space-y-6 max-h-[500px] overflow-y-auto smooth-scrollbar pr-2">
            <AnimatePresence>
            {Object.entries(groupedLinks).sort(([a], [b]) => a.localeCompare(b)).map(([category, linksInCategory]) => (
              <motion.div 
                key={category}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h3 className="font-bold text-lg mb-3 text-primary">{category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {linksInCategory.slice(0, cardLimit).map(link => (
                    <LinkCard key={link.id} link={link} onEdit={handleEditLink} onDelete={handleDeleteLink} />
                  ))}
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No links found.</p>
            {searchTerm || selectedCategory !== 'all' ? (
                <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>Clear filters</Button>
            ) : (
                <p className="text-sm">Add your first quick link to get started!</p>
            )}
          </div>
        )}
        {isDashboardCard && links.length > cardLimit && (
            <div className="text-center mt-4">
                <Link to="/quick-links">
                    <Button variant="outline">View all {links.length} links</Button>
                </Link>
            </div>
        )}
      </motion.div>
      <AddLinkModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        link={editingLink}
        onSuccess={fetchLinksAndCategories}
        existingCategories={categories}
      />
      <CategoryManager
        isOpen={isCategoryManagerOpen}
        setIsOpen={setCategoryManagerOpen}
        title="Manage Link Categories"
        description="Add or remove categories for your quick links."
        existingItems={categories}
        onUpdate={handleCategoriesUpdate}
        itemTypeLabel="category"
       />
    </>
  );
};

export default LinkGrid;