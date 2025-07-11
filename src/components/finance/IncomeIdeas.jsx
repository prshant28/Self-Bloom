import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Archive, Target, Eye, EyeOff, Trash2, Check, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const IncomeIdeas = ({ 
    ideas, 
    onAdd, 
    onEdit, 
    onStatusChange, 
    onConvertToGoal, 
    showArchived, 
    setShowArchived,
    onDelete,
    isEditing,
    setIsEditing,
    onUpdateTitle,
    editedTitle,
    setEditedTitle,
    editingId,
    setEditingId
}) => {
    const visibleIdeas = showArchived ? ideas : ideas.filter(i => i.status !== 'archived');
    
    const startEditing = (idea) => {
        setEditingId(idea.id);
        setEditedTitle(idea.title);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditedTitle('');
    };

    return (
        <section className="glass-card p-4 md:p-6">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
              <h2 className="font-display text-xl md:text-2xl font-bold text-glow">💡 Future Income Sources & Ideas</h2>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}><Edit size={16} /></Button>
                <div className="flex items-center space-x-2">
                    <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
                    <Label htmlFor="show-archived" className="flex items-center gap-1 cursor-pointer">
                        {showArchived ? <EyeOff size={14}/> : <Eye size={14} />}
                        <span className="hidden sm:inline">Archived</span>
                    </Label>
                </div>
                <Button onClick={onAdd} size="sm"><Plus className="md:mr-2 h-4 w-4" /><span className="hidden md:inline">Log Idea</span></Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                {visibleIdeas.map(idea => (
                    <motion.div layout key={idea.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`p-4 rounded-lg bg-background/50 flex flex-col justify-between ${idea.status === 'archived' ? 'opacity-50' : ''}`}>
                        <div>
                            <div className="flex justify-between items-start">
                                {editingId === idea.id ? (
                                    <div className="flex-grow flex items-center gap-2">
                                        <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="h-8" />
                                        <Button size="icon" variant="ghost" onClick={onUpdateTitle} className="h-8 w-8"><Check size={16} /></Button>
                                        <Button size="icon" variant="ghost" onClick={cancelEditing} className="h-8 w-8"><X size={16} /></Button>
                                    </div>
                                ) : (
                                    <h3 className="font-bold text-base mb-1">{idea.title}</h3>
                                )}
                                {idea.status === 'core_plan' && <span className="text-xs font-bold text-yellow-400">🔥 Core</span>}
                            </div>
                             {idea.tag && <p className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full inline-block mb-2">{idea.tag}</p>}
                             <p className="text-sm text-muted-foreground mb-2">{idea.description}</p>
                             <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                                <span>Potential: {idea.potential || 'N/A'}</span>
                                <span>Difficulty: {idea.difficulty || 'N/A'}</span>
                             </div>
                             {idea.plan_to_start && <p className="text-xs text-primary mt-1">Target: {idea.target_start_date || 'Not set'}</p>}
                        </div>
                        <div className="flex gap-2 mt-4 justify-end">
                            {isEditing ? (
                                <>
                                    <Button size="sm" variant="ghost" onClick={() => startEditing(idea)}><Edit size={14}/></Button>
                                    <Button size="sm" variant="destructive" onClick={() => onDelete(idea.id)}><Trash2 size={14}/></Button>
                                </>
                            ) : (
                                <>
                                    <Button size="sm" variant="ghost" onClick={() => onEdit(idea)}><Edit size={14}/></Button>
                                    <Button size="sm" variant="ghost" onClick={() => onStatusChange(idea.id, idea.status === 'archived' ? 'idea' : 'archived')}><Archive size={14}/></Button>
                                    {idea.status !== 'core_plan' && idea.status !== 'archived' && <Button size="sm" variant="outline" onClick={() => onStatusChange(idea.id, 'core_plan')}>Set Core</Button>}
                                    <Button size="sm" onClick={() => onConvertToGoal(idea)}><Target size={14} className="mr-1" /> To Goal</Button>
                                </>
                            )}
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
                 {visibleIdeas.length === 0 && <p className='text-center text-muted-foreground py-16 col-span-full'>No income ideas to show.</p>}
            </div>
        </section>
    );
};

export default IncomeIdeas;