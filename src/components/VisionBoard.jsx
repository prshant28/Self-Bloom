import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Save, Eye, Code, Plus, Loader2, Trash2, Expand, X } from 'lucide-react';
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

const VisionBoard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [boards, setBoards] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [htmlContent, setHtmlContent] = useState('');
    const [title, setTitle] = useState('');
    const [viewMode, setViewMode] = useState('preview');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const iframeRef = useRef(null);

    const fetchBoards = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase.from('vision_boards').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (error) {
            toast({ title: "Error fetching vision boards", description: error.message, variant: "destructive" });
        } else {
            setBoards(data);
            if (data.length > 0 && !selectedBoard) {
                selectBoard(data[0]);
            } else if (data.length === 0) {
                handleCreateNew();
            }
        }
        setLoading(false);
    }, [user, toast]);

    useEffect(() => {
        if(user) fetchBoards();
    }, [user, fetchBoards]);

    const handleSave = async () => {
        if (!title) {
            toast({ title: "Title is required", variant: "destructive" });
            return;
        }
        setSaving(true);

        if (isNew) {
            const { data, error } = await supabase
                .from('vision_boards')
                .insert({ title, html_content: htmlContent, user_id: user.id })
                .select()
                .single();
            
            if (error) {
                toast({ title: "Error creating vision board", description: error.message, variant: "destructive" });
            } else {
                toast({ title: "✅ Vision Board Created!", description: "Your new vision is saved." });
                setBoards(prev => [data, ...prev]);
                selectBoard(data);
            }
        } else if (selectedBoard) {
            const { data, error } = await supabase.from('vision_boards').update({ title, html_content: htmlContent }).eq('id', selectedBoard.id).select().single();
            if (error) {
                toast({ title: "Error saving vision board", description: error.message, variant: "destructive" });
            } else {
                toast({ title: "✅ Vision Board Saved!", description: "Your vision has been updated." });
                setBoards(prev => prev.map(b => b.id === selectedBoard.id ? data : b));
            }
        }
        setSaving(false);
    };

    const handleCreateNew = () => {
        setIsNew(true);
        setSelectedBoard(null);
        setTitle("New Vision Board");
        setHtmlContent("<!-- Start building your vision with HTML! Use any styling you want. -->\n<div style=\"padding: 2rem; background-color: #1a1a1a; border-radius: 8px; color: white;\">\n  <h1 style=\"font-size: 2.25rem; font-weight: bold;\">My Future Goal</h1>\n  <p style=\"margin-top: 0.5rem; font-size: 1.125rem; color: #d1d5db;\">A short description of what I want to achieve.</p>\n  <img src=\"https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600\" alt=\"inspirational landscape\" style=\"width:100%; height:auto; margin-top:1rem; border-radius:8px;\"/>\n</div>");
    };

    const handleDelete = async (boardId) => {
        const { error } = await supabase.from('vision_boards').delete().eq('id', boardId);
        if (error) {
            toast({ title: "Error deleting board", description: error.message, variant: 'destructive' });
        } else {
            toast({ title: "🗑️ Board Deleted" });
            const newBoards = boards.filter(b => b.id !== boardId);
            setBoards(newBoards);
            if (selectedBoard?.id === boardId) {
                if (newBoards.length > 0) {
                    selectBoard(newBoards[0]);
                } else {
                    handleCreateNew();
                }
            }
        }
    };
    
    const selectBoard = (board) => {
        setSelectedBoard(board);
        setTitle(board.title);
        setHtmlContent(board.html_content || '');
        setIsNew(false);
    }
    
    const VisionPreview = ({ content }) => (
        <iframe
          ref={iframeRef}
          srcDoc={content}
          title="Vision Board Preview"
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full border-0"
        />
    );


    return (
        <>
        <div className="flex flex-col md:flex-row h-[calc(100vh-10rem)] gap-6">
            <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full md:w-1/4 flex flex-col glass-card p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-glow">My Visions</h2>
                    <Button size="icon" variant="ghost" onClick={handleCreateNew}><Plus /></Button>
                </div>
                {loading ? <Loader2 className="animate-spin mx-auto" /> : (
                    <div className="space-y-2 overflow-y-auto">
                        {boards.map(board => (
                            <div key={board.id} onClick={() => selectBoard(board)} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${selectedBoard?.id === board.id && !isNew ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                                <span className="font-medium truncate">{board.title}</span>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this vision board.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(board.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                         {isNew && (
                            <div className={`p-3 rounded-lg cursor-pointer flex justify-between items-center bg-primary text-primary-foreground`}>
                                <span className="font-medium truncate">{title}</span>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full md:w-3/4 flex flex-col">
                {(selectedBoard || isNew) ? (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vision Board Title" className="text-2xl font-bold !bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"/>
                            <div className="flex gap-2 self-end sm:self-center">
                                <Button variant="outline" size="icon" onClick={() => setIsFullScreen(true)}><Expand className="h-4 w-4" /></Button>
                                <Button variant={viewMode === 'code' ? 'default' : 'outline'} onClick={() => setViewMode('code')}><Code className="mr-2 h-4 w-4" />Code</Button>
                                <Button variant={viewMode === 'preview' ? 'default' : 'outline'} onClick={() => setViewMode('preview')}><Eye className="mr-2 h-4 w-4" />Preview</Button>
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />} Save
                                </Button>
                            </div>
                        </div>
                        <div className="flex-grow grid grid-cols-1 h-full min-h-0">
                            {viewMode === 'code' ? (
                                <Textarea
                                    value={htmlContent}
                                    onChange={(e) => setHtmlContent(e.target.value)}
                                    placeholder="<!-- Your HTML vision here -->"
                                    className="h-full font-mono bg-background/50 resize-none"
                                />
                            ) : (
                                <div className="p-4 bg-background/50 rounded-lg overflow-auto h-full">
                                    <VisionPreview content={htmlContent} />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center glass-card p-8">
                        <Eye className="h-16 w-16 text-primary" />
                        <h2 className="mt-6 text-2xl font-bold">Create Your Vision</h2>
                        <p className="mt-2 text-muted-foreground">Click 'New Vision' to start crafting your future goals with HTML.</p>
                        <Button className="mt-6" onClick={handleCreateNew}><Plus className="mr-2"/> Create New Vision Board</Button>
                    </div>
                )}
            </motion.div>
        </div>
        <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsFullScreen(false)}
          >
            <motion.div 
              className="relative w-full max-w-6xl h-[90vh] bg-background rounded-lg shadow-2xl shadow-primary/30 flex flex-col"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-bold text-lg">{title}</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(false)}><X className="h-6 w-6" /></Button>
              </div>
              <div className="flex-grow overflow-auto p-4">
                 <VisionPreview content={htmlContent} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
    );
};

export default VisionBoard;