import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Folder, FolderPlus, File, Trash2, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
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

const FolderSidebar = ({ folders, selectedFolder, setSelectedFolder, onRefresh }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [editingFolderName, setEditingFolderName] = useState('');

    const handleAddFolder = async () => {
        if (!newFolderName.trim()) return;
        const { error } = await supabase.from('media_folders').insert({ name: newFolderName.trim(), user_id: user.id });
        if (error) {
            toast({ title: 'Error adding folder', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Folder created!' });
            setNewFolderName('');
            setIsAdding(false);
            onRefresh();
        }
    };

    const handleDeleteFolder = async (folderId) => {
        // First, un-categorize media items in this folder
        await supabase.from('media_content').update({ folder_id: null }).eq('folder_id', folderId);
        // Then, delete the folder
        const { error } = await supabase.from('media_folders').delete().eq('id', folderId);
        if (error) {
            toast({ title: 'Error deleting folder', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Folder deleted' });
            if (selectedFolder === folderId) {
                setSelectedFolder(null);
            }
            onRefresh();
        }
    };

    const handleUpdateFolder = async (folderId) => {
        if (!editingFolderName.trim()) return;
        const { error } = await supabase.from('media_folders').update({ name: editingFolderName.trim() }).eq('id', folderId);
        if (error) {
            toast({ title: 'Error updating folder', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Folder updated!' });
            setEditingFolderId(null);
            setEditingFolderName('');
            onRefresh();
        }
    };

    const startEditing = (folder) => {
        setEditingFolderId(folder.id);
        setEditingFolderName(folder.name);
    };

    return (
        <motion.div 
            className="w-64 h-full glass-card p-4 flex-col hidden md:flex"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className="font-display text-xl font-bold text-glow mb-4">Library</h2>
            <div className="flex-grow space-y-1 overflow-y-auto smooth-scrollbar pr-2">
                <button
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${!selectedFolder ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                    onClick={() => setSelectedFolder(null)}
                >
                    <File size={18} />
                    <span>All Files</span>
                </button>
                {folders.map(folder => (
                    <div key={folder.id} className="group">
                        {editingFolderId === folder.id ? (
                            <div className="flex items-center gap-2 p-2">
                                <Input value={editingFolderName} onChange={(e) => setEditingFolderName(e.target.value)} className="h-8" />
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUpdateFolder(folder.id)}><Check size={16} /></Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingFolderId(null)}><X size={16} /></Button>
                            </div>
                        ) : (
                            <button
                                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${selectedFolder === folder.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                onClick={() => setSelectedFolder(folder.id)}
                            >
                                <Folder size={18} />
                                <span className="flex-grow truncate">{folder.name}</span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); startEditing(folder); }}><Edit size={14} /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={(e) => e.stopPropagation()}><Trash2 size={14} /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Delete "{folder.name}"?</AlertDialogTitle><AlertDialogDescription>This will not delete the media inside, but will move them to "Uncategorized".</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteFolder(folder.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-4">
                {isAdding ? (
                    <div className="space-y-2">
                        <Input placeholder="New folder name..." value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                        <div className="flex gap-2">
                            <Button className="flex-1" onClick={handleAddFolder}>Add</Button>
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
                        <FolderPlus className="mr-2 h-4 w-4" /> Create Folder
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

export default FolderSidebar;