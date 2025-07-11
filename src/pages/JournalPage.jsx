import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Book, Calendar, Settings, Download, Bell, History, Mic, MicOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const useSpeechRecognition = (onResult) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.error("Speech recognition not supported");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            onResult(finalTranscript, interimTranscript);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, [onResult]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsListening(!isListening);
    };

    return { isListening, toggleListening };
};

const JournalPage = () => {
  const { toast } = useToast();
  const [entry, setEntry] = useState({ learn: '', achieve: '', notWell: '', improve: '' });
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('today');
  const [editingEntry, setEditingEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settings, setSettings] = useState({ reminders: false, reminderTime: '22:00' });
  const [activeMic, setActiveMic] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  const handleSpeechResult = useCallback((finalTranscript, interimTranscript) => {
    if (activeMic && finalTranscript) {
        setEntry(prev => ({...prev, [activeMic]: prev[activeMic] + finalTranscript + ' '}));
    }
  }, [activeMic]);

  const { isListening, toggleListening } = useSpeechRecognition(handleSpeechResult);

  const handleMicClick = (field) => {
    if (isListening && activeMic === field) {
        toggleListening();
        setActiveMic(null);
    } else {
        if(isListening) toggleListening(); // stop previous
        setActiveMic(field);
        setTimeout(toggleListening, 100); // start new
    }
  };

  const getLocalStorageKey = (date) => `journal_${date}`;

  const loadEntry = useCallback(() => {
    const savedEntry = localStorage.getItem(getLocalStorageKey(today));
    if (savedEntry) {
      setEntry(JSON.parse(savedEntry));
    } else {
      setEntry({ learn: '', achieve: '', notWell: '', improve: '' });
    }
  }, [today]);

  const loadHistory = useCallback(() => {
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('journal_')) {
        const date = key.replace('journal_', '');
        entries.push({ date, ...JSON.parse(localStorage.getItem(key)) });
      }
    }
    setHistory(entries.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, []);

  const loadSettings = useCallback(() => {
    const savedSettings = localStorage.getItem('journal_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    loadEntry();
    loadHistory();
    loadSettings();
  }, [loadEntry, loadHistory, loadSettings]);

  const handleSave = (date, currentEntry) => {
    if (Object.values(currentEntry).every(field => field.trim() === '')) {
      toast({ title: "Your journal is empty!", description: "Write something to save your reflection.", variant: "destructive" });
      return;
    }
    localStorage.setItem(getLocalStorageKey(date), JSON.stringify(currentEntry));
    toast({ title: "Reflection Saved! ✨", description: "Your thoughts are safe with you." });
    loadHistory();
    if(isModalOpen) setIsModalOpen(false);
  };
  
  const handleEdit = (entryToEdit) => {
    setEditingEntry(entryToEdit);
    setIsModalOpen(true);
  };
  
  const handleSettingsChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('journal_settings', JSON.stringify(newSettings));
    toast({ title: "Settings Saved!", description: `Reminders are now ${value ? 'ON' : 'OFF'}.`});
  };

  const exportJournal = (period) => {
    let entriesToExport = [];
    const endDate = new Date();
    if (period === 'week') {
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      entriesToExport = history.filter(e => new Date(e.date) >= startDate && new Date(e.date) <= endDate);
    } else {
      entriesToExport = history; // export all for now
    }

    if(entriesToExport.length === 0) {
        toast({ title: "Nothing to export!", variant: "destructive" });
        return;
    }

    const content = entriesToExport.map(e => (
        `## Reflection for ${formatDate(e.date)}\n\n` +
        `**What did I learn today?**\n${e.learn}\n\n` +
        `**What did I achieve today?**\n${e.achieve}\n\n` +
        `**What didn't go well?**\n${e.notWell}\n\n` +
        `**What will I improve tomorrow?**\n${e.improve}\n\n` +
        `---\n`
    )).join('');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selfbloom_journal_export.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Journal Exported!", description: "Check your downloads folder." });
  };
  
  const getFilteredHistory = (filter) => {
      const now = new Date();
      if (filter === 'week') {
          const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          return history.filter(e => new Date(e.date) >= lastWeek);
      }
      if (filter === 'month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return history.filter(e => new Date(e.date) >= lastMonth);
      }
      return history;
  };

  const [historyFilter, setHistoryFilter] = useState('all');

  const renderTextareaWithMic = (id, label, value) => (
    <div className="relative">
        <Label htmlFor={id}>{label}</Label>
        <Textarea id={id} value={value} onChange={e => setEntry({...entry, [id]: e.target.value})} rows={4} placeholder="Type or speak your thoughts..."/>
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`absolute bottom-2 right-2 h-7 w-7 ${isListening && activeMic === id ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}
            onClick={() => handleMicClick(id)}
        >
            {isListening && activeMic === id ? <MicOff size={16} /> : <Mic size={16} />}
        </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-4xl font-bold text-glow mb-2">Daily Journal</h1>
          <p className="text-lg opacity-75">Reflect on your day, track your growth.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView(view === 'today' ? 'history' : 'today')}>
                {view === 'today' ? <History className="mr-2 h-4 w-4" /> : <Book className="mr-2 h-4 w-4" />}
                {view === 'today' ? 'View History' : 'Today\'s Entry'}
            </Button>
            <Button variant="outline" onClick={() => setView('settings')}><Settings className="mr-2 h-4 w-4" /> Settings</Button>
        </div>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {view === 'today' && (
          <motion.div key="today" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
            <div className="glass-card p-8">
              <h2 className="font-display text-2xl font-bold text-glow mb-6 flex items-center">
                <Calendar className="mr-3" /> Today's Reflection — {formatDate(today)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderTextareaWithMic('learn', 'What did I learn today?', entry.learn)}
                {renderTextareaWithMic('achieve', 'What did I achieve today?', entry.achieve)}
                {renderTextareaWithMic('notWell', "What didn't go well?", entry.notWell)}
                {renderTextareaWithMic('improve', 'What will I improve tomorrow?', entry.improve)}
              </div>
              <div className="mt-8 flex justify-end">
                <Button variant="glow" onClick={() => handleSave(today, entry)}>Save Entry</Button>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
            <div className="glass-card p-8">
                <h2 className="font-display text-2xl font-bold text-glow mb-6">Journal History</h2>
                <Tabs defaultValue="all" onValueChange={setHistoryFilter} className="w-full mb-4">
                    <TabsList>
                        <TabsTrigger value="all">All Time</TabsTrigger>
                        <TabsTrigger value="week">Past 7 Days</TabsTrigger>
                        <TabsTrigger value="month">Past Month</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {getFilteredHistory(historyFilter).map(histEntry => (
                        <div key={histEntry.date} className="bg-background/50 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold">{formatDate(histEntry.date)}</p>
                                <p className="text-sm text-muted-foreground mt-1 truncate max-w-md">"{histEntry.learn.substring(0, 100)}..."</p>
                            </div>
                            <Button variant="outline" onClick={() => handleEdit(histEntry)}>View Full Entry</Button>
                        </div>
                    ))}
                    {getFilteredHistory(historyFilter).length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No entries found for this period.</p>
                    )}
                </div>
            </div>
          </motion.div>
        )}
        
        {view === 'settings' && (
             <motion.div key="settings" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                <div className="glass-card p-8">
                    <h2 className="font-display text-2xl font-bold text-glow mb-6">Journal Settings</h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                            <div className="flex items-center">
                                <Bell className="mr-3 text-primary" />
                                <div>
                                    <p className="font-semibold">Enable Daily Reminders</p>
                                    <p className="text-sm text-muted-foreground">Get a notification to write in your journal.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <input type="time" value={settings.reminderTime} onChange={e => handleSettingsChange('reminderTime', e.target.value)} className="bg-input border border-border rounded-md p-2 text-sm" disabled={!settings.reminders} />
                                <Switch checked={settings.reminders} onCheckedChange={(val) => handleSettingsChange('reminders', val)} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                            <div className="flex items-center">
                                <Download className="mr-3 text-primary" />
                                <div>
                                    <p className="font-semibold">Export Journal</p>
                                    <p className="text-sm text-muted-foreground">Download your reflections as a Markdown file.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => exportJournal('week')}>Export Last 7 Days</Button>
                                <Button variant="secondary" onClick={() => exportJournal('all')}>Export All</Button>
                            </div>
                        </div>
                    </div>
                </div>
             </motion.div>
        )}

      </AnimatePresence>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass-card">
            <DialogHeader>
                <DialogTitle>Editing Reflection for {editingEntry && formatDate(editingEntry.date)}</DialogTitle>
                <DialogDescription>Your thoughts, revisited.</DialogDescription>
            </DialogHeader>
            {editingEntry && (
                 <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    <div>
                      <Label htmlFor="modal-learn">What did I learn today?</Label>
                      <Textarea id="modal-learn" value={editingEntry.learn} onChange={e => setEditingEntry({...editingEntry, learn: e.target.value})} rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="modal-achieve">What did I achieve today?</Label>
                      <Textarea id="modal-achieve" value={editingEntry.achieve} onChange={e => setEditingEntry({...editingEntry, achieve: e.target.value})} rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="modal-notWell">What didn't go well?</Label>
                      <Textarea id="modal-notWell" value={editingEntry.notWell} onChange={e => setEditingEntry({...editingEntry, notWell: e.target.value})} rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="modal-improve">What will I improve tomorrow?</Label>
                      <Textarea id="modal-improve" value={editingEntry.improve} onChange={e => setEditingEntry({...editingEntry, improve: e.target.value})} rows={3} />
                    </div>
              </div>
            )}
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="glow" onClick={() => handleSave(editingEntry.date, editingEntry)}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default JournalPage;