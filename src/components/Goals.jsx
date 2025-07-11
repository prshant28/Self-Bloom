import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Save, Target, MoreVertical, Brain, Sparkles, Shuffle, Upload, Palette } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useLocation, useNavigate } from 'react-router-dom';
import { goalTemplates } from '@/pages/templates/goalTemplates';

const motivationalQuotes = [
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Become the person you were meant to be, light your inner fire and follow your heart's desire. - Leon Brown",
    "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson",
    "Your identity is your most valuable possession. Protect it. - Elastigirl",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. - Ralph Waldo Emerson"
];

const AffirmationCard = ({ affirmation, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(affirmation.text);

    const handleSave = () => {
        onUpdate(affirmation.id, text);
        setIsEditing(false);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="glass-card p-4 flex flex-col justify-between items-center text-center h-40"
        >
            {isEditing ? (
                <Textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-full bg-transparent border-0 focus-visible:ring-0 resize-none text-center" />
            ) : (
                <p className="text-lg font-medium text-glow">{affirmation.text}</p>
            )}
            <div className="flex gap-2 mt-2">
                {isEditing ? (
                    <Button size="icon" variant="ghost" onClick={handleSave}><Save className="h-4 w-4 text-primary" /></Button>
                ) : (
                    <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4" /></Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => onDelete(affirmation.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
        </motion.div>
    );
};

const Goals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [profile, setProfile] = useState({ identity_description: '', background_url: '' });
  const [affirmations, setAffirmations] = useState([]);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [quote, setQuote] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [goalsRes, profileRes, affirmationsRes] = await Promise.all([
        supabase.from('goals').select('*, todos(completed)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('user_profiles').select('identity_description, background_url').eq('id', user.id).single(),
        supabase.from('affirmations').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);
    
    if (goalsRes.error) toast({ title: "Error fetching goals", variant: "destructive" });
    else setGoals(goalsRes.data);

    if (profileRes.error) console.error("Error fetching profile", profileRes.error);
    else setProfile(profileRes.data || { identity_description: '', background_url: '' });

    if (affirmationsRes.error) toast({ title: "Error fetching affirmations", variant: "destructive" });
    else setAffirmations(affirmationsRes.data);

  }, [user, toast]);

  const handleApplyTemplate = useCallback(async (templateKey) => {
    const template = goalTemplates[templateKey];
    if (!template) return;

    const newGoals = template.goals.map(goal => ({
      ...goal,
      user_id: user.id,
    }));

    const { error } = await supabase.from('goals').insert(newGoals);
    if (error) {
      toast({ title: "Error applying template", description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `🚀 Template "${template.name}" applied!` });
      fetchData();
    }
  }, [user, toast, fetchData]);

  useEffect(() => {
    fetchData();
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    
    if (location.state?.templateToApply) {
      handleApplyTemplate(location.state.templateToApply);
      // Clear state to prevent re-applying on refresh
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.newGoalFromIdea) {
      const { idea } = location.state;
      if (idea) { // Add a check to ensure idea exists
        setEditingGoal({
            title: idea.title,
            description: idea.description,
            is_core_goal: idea.status === 'core_plan',
            source_idea_id: idea.id,
            target_date: idea.target_start_date || null
        });
        setIsModalOpen(true);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [fetchData, location.state, handleApplyTemplate, navigate, location.pathname]);

  const handleSaveIdentity = async () => {
    const { error } = await supabase.from('user_profiles').update({ identity_description: profile.identity_description }).eq('id', user.id);
    if (error) toast({ title: "Error saving identity", variant: "destructive" });
    else toast({ title: "✅ Identity Updated!" });
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const goalData = {
      title: formData.get('title'),
      description: formData.get('description'),
      target_date: formData.get('target_date') || null,
      is_core_goal: formData.get('is_core_goal') === 'on',
      source_idea_id: editingGoal?.source_idea_id || null,
    };

    if (goalData.target_date === '') {
        goalData.target_date = null;
    }

    const { error } = editingGoal && editingGoal.id
      ? await supabase.from('goals').update(goalData).eq('id', editingGoal.id)
      : await supabase.from('goals').insert({ ...goalData, user_id: user.id });

    if (error) toast({ title: 'Error saving goal', variant: 'destructive' });
    else {
      toast({ title: `✅ Goal ${editingGoal ? 'Updated' : 'Added'}!` });
      fetchData();
      setIsModalOpen(false);
      setEditingGoal(null);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    await supabase.from('todos').delete().eq('goal_id', goalId);
    const { error } = await supabase.from('goals').delete().eq('id', goalId);
    if (error) toast({ title: 'Error deleting goal', variant: 'destructive' });
    else {
      toast({ title: '🗑️ Goal Deleted' });
      fetchData();
    }
  };

  const handleAddAffirmation = async () => {
    if (!newAffirmation.trim()) return;
    const { error } = await supabase.from('affirmations').insert({ user_id: user.id, text: newAffirmation });
    if (error) toast({ title: "Error adding affirmation", variant: "destructive" });
    else {
      setNewAffirmation('');
      fetchData();
    }
  };

  const handleUpdateAffirmation = async (id, text) => {
    const { error } = await supabase.from('affirmations').update({ text }).eq('id', id);
    if (error) toast({ title: "Error updating affirmation", variant: "destructive" });
    else fetchData();
  };

  const handleDeleteAffirmation = async (id) => {
    const { error } = await supabase.from('affirmations').delete().eq('id', id);
    if (error) toast({ title: "Error deleting affirmation", variant: "destructive" });
    else fetchData();
  };

  const shuffleAffirmations = () => {
    setAffirmations([...affirmations].sort(() => Math.random() - 0.5));
  };

  const getGoalProgress = (goal) => {
    if (!goal.todos || goal.todos.length === 0) return 0;
    const completedTodos = goal.todos.filter(todo => todo.completed).length;
    return (completedTodos / goal.todos.length) * 100;
  };

  const coreGoals = goals.filter(g => g.is_core_goal);

  return (
    <>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-glow mb-2">Self & Goals</h1>
          <p className="text-lg opacity-75">Define who you are becoming and the goals that will get you there.</p>
        </motion.div>

        {/* Identity Section */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="font-display text-2xl font-bold text-glow flex items-center mb-4"><Brain className="mr-3" /> Who I Want to Become</h2>
            <Textarea
                placeholder="Describe the version of yourself you're becoming..."
                className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-lg min-h-[100px]"
                value={profile.identity_description}
                onChange={(e) => setProfile(p => ({...p, identity_description: e.target.value}))}
                onBlur={handleSaveIdentity}
            />
            <p className="text-center text-muted-foreground italic mt-4">"{quote}"</p>
        </motion.div>

        {/* Affirmations Section */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-2xl font-bold text-glow flex items-center"><Sparkles className="mr-3" /> Daily Affirmations</h2>
                <Button variant="ghost" size="icon" onClick={shuffleAffirmations}><Shuffle className="h-5 w-5" /></Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                <AnimatePresence>
                    {affirmations.map(aff => <AffirmationCard key={aff.id} affirmation={aff} onUpdate={handleUpdateAffirmation} onDelete={handleDeleteAffirmation} />)}
                </AnimatePresence>
            </div>
            <div className="flex gap-2">
                <Input value={newAffirmation} onChange={(e) => setNewAffirmation(e.target.value)} placeholder="Add a new affirmation..." onKeyPress={e => e.key === 'Enter' && handleAddAffirmation()} />
                <Button onClick={handleAddAffirmation}><Plus /></Button>
            </div>
        </motion.div>

        {/* Goals Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-2xl font-bold text-glow flex items-center"><Target className="mr-3" /> Life Goals</h2>
                <Button onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> New Goal</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {goals.map(goal => (
                    <motion.div
                        key={goal.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`glass-card p-6 flex flex-col justify-between ${goal.status === 'completed' ? 'opacity-60' : ''}`}
                    >
                        <div>
                            <div className="flex justify-between items-start">
                                <h2 className={`font-display text-xl font-bold text-glow mb-2 ${goal.status === 'completed' ? 'line-through' : ''}`}>{goal.title}</h2>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => { setEditingGoal(goal); setIsModalOpen(true); }}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteGoal(goal.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {goal.is_core_goal && <p className="text-xs font-bold text-yellow-400 mb-2">🔥 CORE IDENTITY GOAL</p>}
                            <p className="text-muted-foreground mb-4 text-sm">{goal.description}</p>
                            {goal.target_date && <p className="text-xs text-primary mb-4">Target: {new Date(goal.target_date).toLocaleDateString()}</p>}
                        </div>
                        <div>
                            <div className="w-full h-2 bg-input rounded-full overflow-hidden mb-2">
                                <motion.div className="h-full bg-gradient-to-r from-primary to-purple-400" initial={{ width: 0 }} animate={{ width: `${getGoalProgress(goal)}%` }} />
                            </div>
                            <div className="flex items-center justify-end text-xs">
                                <span>{Math.round(getGoalProgress(goal))}%</span>
                            </div>
                        </div>
                    </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
            <DialogDescription>Set a clear and motivating goal for yourself.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveGoal} className="grid gap-4 py-4">
            <div><Label htmlFor="title">Goal Title</Label><Input id="title" name="title" defaultValue={editingGoal?.title} required /></div>
            <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" defaultValue={editingGoal?.description} /></div>
            <div><Label htmlFor="target_date">Target Date (Optional)</Label><Input id="target_date" name="target_date" type="date" defaultValue={editingGoal?.target_date} /></div>
            <div className="flex items-center space-x-2"><Switch id="is_core_goal" name="is_core_goal" defaultChecked={editingGoal?.is_core_goal} /><Label htmlFor="is_core_goal">🔥 Core Identity Goal</Label></div>
            <DialogFooter><Button type="submit">{editingGoal?.id ? 'Save Changes' : 'Create Goal'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Goals;