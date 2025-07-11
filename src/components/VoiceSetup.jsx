import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Plus, Mic, Play, Save, Edit, Trash2, Loader2, Pause } from 'lucide-react';

const taskTypes = [
  { value: 'Morning Boost', label: 'Morning Boost' },
  { value: 'Meditation', label: 'Guided Meditation' },
  { value: 'Focus Boost', label: 'Focus Boost' },
  { value: 'DSA Reminder', label: 'DSA Reminder' },
  { value: 'Evening Reflection', label: 'Evening Reflection' },
];

const voices = [
  { value: 'Rachel', label: 'Rachel (Calm)' },
  { value: 'Adam', label: 'Adam (Energetic)' },
  { value: 'Bella', label: 'Bella (Warm)' },
  { value: 'Antoni', label: 'Antoni (Deep)' },
];

const tones = [
  { value: 'Motivational', label: 'Motivational' },
  { value: 'Calm', label: 'Calm' },
  { value: 'Focused', label: 'Focused' },
  { value: 'Reflective', label: 'Reflective' },
];

const pluginLocations = [
  { value: 'Dashboard', label: 'Dashboard Popup' },
  { value: 'Meditation Tab', label: 'Meditation Tab' },
  { value: 'Study Mode', label: 'Study Mode' },
  { value: 'Morning Launcher', label: 'Morning Launcher' },
];

const scriptTemplates = {
    'Morning Boost': "Good morning. [pause 1s] Today is a new opportunity to grow. [pause 2s] Let's start with a clear mind and a positive intention. You are capable. You are ready. Let's make today count.",
    'Meditation': "Welcome. [pause 2s] Find a comfortable position. Close your eyes. [pause 3s] Take a deep breath in... and slowly release it. [pause 3s] Let go of any tension. Just be present in this moment.",
    'Focus Boost': "It's time to focus. [pause 1s] Eliminate all distractions. [pause 2s] For the next block of time, give your full attention to the task at hand. You have the power to concentrate deeply. Let's begin.",
    'DSA Reminder': "A quick reminder. [pause 1s] Consistent practice is key to mastering Data Structures and Algorithms. [pause 2s] Today, focus on understanding one new concept or solving one challenging problem. Every step forward counts.",
    'Evening Reflection': "As the day comes to a close... [pause 2s] take a moment to reflect. What went well today? [pause 3s] What did you learn? [pause 3s] Be grateful for your efforts. Rest well, and prepare for a new day tomorrow."
};

const VoiceSetup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState([]);
  const [currentWorkflow, setCurrentWorkflow] = useState({
    title: '', task_type: '', voice: '', tone: '', plugin_location: '', script: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('voice_workflows').select('*').eq('user_id', user.id);
    if (error) {
      toast({ title: 'Error fetching workflows', description: error.message, variant: 'destructive' });
    } else {
      setWorkflows(data);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);
  
  const handleInputChange = (field, value) => {
    let newScript = currentWorkflow.script;
    if (field === 'task_type' && scriptTemplates[value]) {
      newScript = scriptTemplates[value];
    }
    setCurrentWorkflow(prev => ({ ...prev, [field]: value, script: newScript }));
  };

  const handleSaveWorkflow = async () => {
    if (!currentWorkflow.title || !currentWorkflow.task_type || !currentWorkflow.voice) {
        toast({ title: 'Missing Fields', description: 'Please fill out title, task type, and voice.', variant: 'destructive' });
        return;
    }
    
    const payload = { ...currentWorkflow, user_id: user.id };
    delete payload.id; 
    let error;

    if (editingId) {
        ({ error } = await supabase.from('voice_workflows').update(payload).eq('id', editingId));
    } else {
        ({ error } = await supabase.from('voice_workflows').insert(payload));
    }

    if (error) {
        toast({ title: 'Error saving workflow', description: error.message, variant: 'destructive' });
    } else {
        toast({ title: `✅ Workflow ${editingId ? 'Updated' : 'Created'}!` });
        resetForm();
        fetchWorkflows();
    }
  };
  
  const handleDeleteWorkflow = async (id) => {
    const { error } = await supabase.from('voice_workflows').delete().eq('id', id);
    if(error){
        toast({ title: 'Error deleting workflow', description: error.message, variant: 'destructive' });
    } else {
        toast({ title: '🗑️ Workflow Deleted' });
        fetchWorkflows();
    }
  };

  const resetForm = () => {
    setCurrentWorkflow({ title: '', task_type: '', voice: '', tone: '', plugin_location: '', script: '' });
    setEditingId(null);
  }
  
  const selectForEdit = (workflow) => {
    setEditingId(workflow.id);
    setCurrentWorkflow(workflow);
  }

  const playPreview = async () => {
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    if (!currentWorkflow.script || !currentWorkflow.voice) {
        toast({ title: 'Missing script or voice', variant: 'destructive' });
        return;
    }
    setIsLoadingAudio(true);
    try {
        const { data, error } = await supabase.functions.invoke('text-to-speech', {
            body: { text: currentWorkflow.script, voice: currentWorkflow.voice },
        });

        if (error) throw new Error(error.message);
        
        const audioBlob = new Blob([new Uint8Array(Object.values(data))], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const newAudio = new Audio(audioUrl);
        setAudio(newAudio);
        newAudio.play();
        newAudio.onplay = () => setIsPlaying(true);
        newAudio.onpause = () => setIsPlaying(false);
        newAudio.onended = () => setIsPlaying(false);

    } catch (error) {
        toast({ title: 'Audio Preview Error', description: `Failed to generate audio. ${error.message}`, variant: 'destructive' });
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-4xl font-bold text-glow mb-2">Voice Workflow Assistant</h1>
        <p className="text-lg opacity-75">Create personalized voice-guided actions for your daily routines.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="lg:col-span-2 glass-card p-6 space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="font-display text-2xl font-bold text-glow">{editingId ? 'Edit Workflow' : 'Create New Workflow'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="title">Workflow Title</Label>
                <Input id="title" placeholder="e.g., Morning Focus Voice" value={currentWorkflow.title} onChange={(e) => handleInputChange('title', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="task_type">Task Type</Label>
              <Select value={currentWorkflow.task_type} onValueChange={(v) => handleInputChange('task_type', v)}>
                <SelectTrigger><SelectValue placeholder="Select a task type..." /></SelectTrigger>
                <SelectContent>{taskTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="voice">Voice</Label>
              <Select value={currentWorkflow.voice} onValueChange={(v) => handleInputChange('voice', v)}>
                <SelectTrigger><SelectValue placeholder="Select a voice..." /></SelectTrigger>
                <SelectContent>{voices.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={currentWorkflow.tone} onValueChange={(v) => handleInputChange('tone', v)}>
                <SelectTrigger><SelectValue placeholder="Select a tone..." /></SelectTrigger>
                <SelectContent>{tones.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="plugin_location">Where should this play?</Label>
              <Select value={currentWorkflow.plugin_location} onValueChange={(v) => handleInputChange('plugin_location', v)}>
                <SelectTrigger><SelectValue placeholder="Select a location..." /></SelectTrigger>
                <SelectContent>{pluginLocations.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="script">Voice Script</Label>
            <Textarea id="script" placeholder="Enter the text to be spoken..." rows={6} value={currentWorkflow.script} onChange={(e) => handleInputChange('script', e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">Use [pause 1s] for pauses.</p>
          </div>

          <div className="flex justify-between items-center">
            <Button onClick={playPreview} variant="outline" disabled={isLoadingAudio}>
                {isLoadingAudio ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />)}
                {isLoadingAudio ? 'Loading...' : (isPlaying ? 'Pause' : 'Preview')}
            </Button>
            <div className="flex gap-2">
                {editingId && <Button onClick={resetForm} variant="ghost">Cancel</Button>}
                <Button onClick={handleSaveWorkflow}><Save className="mr-2 h-4 w-4" />{editingId ? 'Update' : 'Save'} Workflow</Button>
            </div>
          </div>
        </motion.div>

        <motion.div className="glass-card p-6 space-y-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="font-display text-2xl font-bold text-glow">My Workflows</h2>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {workflows.map(wf => (
                    <div key={wf.id} className="p-4 rounded-lg bg-background/50 flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{wf.title}</p>
                            <p className="text-sm text-muted-foreground">{wf.task_type} - {wf.voice}</p>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => selectForEdit(wf)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteWorkflow(wf.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </div>
                ))}
                {workflows.length === 0 && <p className="text-muted-foreground text-center py-4">No workflows created yet.</p>}
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VoiceSetup;