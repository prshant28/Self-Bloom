import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Copy, FileUp, Download } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Papa from 'papaparse';
import { supabase } from '@/lib/customSupabaseClient';
import PlannerDayTabs from '@/components/planner/PlannerDayTabs';
import PlannerEventList from '@/components/planner/PlannerEventList';
import PlannerEventModal from '@/components/planner/PlannerEventModal';
import PlannerImportExport from '@/components/planner/PlannerImportExport';
import { plannerTemplates } from '@/components/planner/plannerTemplates';
import { useLocation, useNavigate } from 'react-router-dom';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Planner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [targetDay, setTargetDay] = useState(null);
  const fileInputRef = useRef(null);

  const fetchEvents = useCallback(async (day = selectedDay) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .eq('user_id', user.id)
      .eq('day_of_week', day)
      .order('start_time');
    
    if (error) {
      toast({ title: "Error fetching schedule", description: error.message, variant: "destructive" });
    } else {
      setEvents(data);
    }
  }, [user, toast, selectedDay]);

  const handleApplyTemplate = useCallback(async (templateKey) => {
    const template = plannerTemplates[templateKey];
    if (!template) return;

    const newEvents = template.events.map(event => ({
      ...event,
      day_of_week: selectedDay,
      user_id: user.id
    }));
    
    const { error } = await supabase.from('schedule').insert(newEvents);
    if(error){
      toast({ title: "Error applying template", description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `🚀 Template "${template.name}" applied!` });
      fetchEvents();
    }
  }, [user, toast, selectedDay, fetchEvents]);

  useEffect(() => {
    fetchEvents();
    if (location.state?.templateToApply) {
      handleApplyTemplate(location.state.templateToApply);
      // Clear state to prevent re-applying on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [fetchEvents, selectedDay, location.state, handleApplyTemplate, navigate, location.pathname]);
  
  const handleSaveEvent = async (eventData) => {
    const payload = {
      ...eventData,
      user_id: user.id,
      day_of_week: selectedDay,
    };

    let error;
    if (editingEvent) {
      ({ error } = await supabase.from('schedule').update(payload).eq('id', editingEvent.id));
    } else {
      ({ error } = await supabase.from('schedule').insert(payload));
    }

    if (error) {
      toast({ title: 'Error saving event', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `✅ Event ${editingEvent ? 'Updated' : 'Added'}!` });
      fetchEvents();
      setIsModalOpen(false);
      setEditingEvent(null);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const { error } = await supabase.from('schedule').delete().eq('id', eventId);
    if (error) {
      toast({ title: 'Error deleting event', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '🗑️ Event Deleted' });
      fetchEvents();
    }
  };

  const handleDuplicateDay = async () => {
    if (targetDay === null || targetDay === selectedDay) {
        toast({ title: "Invalid Target Day", description: "Please select a different day to copy to.", variant: "destructive" });
        return;
    }

    const eventsToCopy = events.map(({ id, created_at, ...rest }) => ({
        ...rest,
        day_of_week: targetDay
    }));

    if (eventsToCopy.length === 0) {
        toast({ title: "Nothing to copy", description: "This day has no events.", variant: 'destructive' });
        return;
    }

    await supabase.from('schedule').delete().eq('user_id', user.id).eq('day_of_week', targetDay);
    const { error } = await supabase.from('schedule').insert(eventsToCopy);

    if (error) {
        toast({ title: "Error duplicating day", description: error.message, variant: "destructive" });
    } else {
        toast({ title: `✅ Copied to ${daysOfWeek[targetDay]}!`, description: `${daysOfWeek[selectedDay]}'s schedule has been duplicated.` });
        setIsDuplicateModalOpen(false);
        setTargetDay(null);
    }
  };
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const requiredFields = ['activity', 'category', 'start_time', 'end_time'];
        const csvData = results.data;
        const isValid = csvData.every(row => requiredFields.every(field => field in row));

        if (!isValid) {
          toast({ title: 'Invalid CSV format', description: 'Ensure headers are: activity, category, start_time, end_time', variant: 'destructive' });
          return;
        }

        const eventsToInsert = csvData.map(row => ({
          user_id: user.id,
          activity: row.activity,
          category: row.category,
          start_time: row.start_time,
          end_time: row.end_time,
          day_of_week: selectedDay,
          reminder_enabled: row.reminder_enabled === 'true' || false,
          color: row.color || null,
          details: row.details || null,
        }));
        
        const { error } = await supabase.from('schedule').insert(eventsToInsert);
        if (error) {
            toast({ title: "Error importing from CSV", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "✅ Imported successfully!" });
            fetchEvents();
        }
      },
      error: (err) => {
        toast({ title: "CSV Parsing Error", description: err.message, variant: "destructive" });
      }
    });
    event.target.value = null; // Reset file input
  };
  
  const exportSchedule = (format = 'csv') => {
      if (events.length === 0) {
          toast({title: "Nothing to export!", variant: 'destructive'});
          return;
      }
      if (format === 'csv') {
          const csv = Papa.unparse(events.map(({id, user_id, created_at, ...rest}) => rest));
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `${daysOfWeek[selectedDay]}_schedule.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  }

  const openAddModal = () => { setEditingEvent(null); setIsModalOpen(true); };
  const openEditModal = (event) => { setEditingEvent(event); setIsModalOpen(true); };

  return (
    <>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-display text-4xl font-bold text-glow mb-2">Weekly Planner</h1>
          <p className="text-lg opacity-75">Craft your perfect week, day by day.</p>
        </motion.div>

        <PlannerDayTabs selectedDay={selectedDay} setSelectedDay={setSelectedDay} />

        <div className="glass-card p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-glow">{`${daysOfWeek[selectedDay]}'s Schedule`}</h2>
            <div className='flex flex-wrap gap-2 items-center'>
              <PlannerImportExport
                onExport={() => exportSchedule('csv')}
                onImport={() => fileInputRef.current.click()}
              />
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
              <Button variant="outline" onClick={() => setIsDuplicateModalOpen(true)}><Copy className="mr-2 h-4 w-4" /> Duplicate</Button>
              <Button onClick={openAddModal}><Plus className="mr-2 h-4 w-4" /> Add Event</Button>
            </div>
          </div>
          <PlannerEventList
            events={events}
            onEdit={openEditModal}
            onDelete={handleDeleteEvent}
            onApplyTemplate={handleApplyTemplate}
          />
        </div>
      </div>

      <PlannerEventModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        editingEvent={editingEvent}
        onSave={handleSaveEvent}
        day={daysOfWeek[selectedDay]}
      />
      
      <Dialog open={isDuplicateModalOpen} onOpenChange={setIsDuplicateModalOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Duplicate Schedule</DialogTitle><DialogDescription>Copy all events from {daysOfWeek[selectedDay]} to another day. This will overwrite the target day's schedule.</DialogDescription></DialogHeader>
            <div className="py-4"><Label htmlFor="target_day">Copy to:</Label><Select onValueChange={(val) => setTargetDay(Number(val))}><SelectTrigger><SelectValue placeholder="Select a day..." /></SelectTrigger><SelectContent>{daysOfWeek.map((day, index) => index !== selectedDay && (<SelectItem key={index} value={index}>{day}</SelectItem>))}</SelectContent></Select></div>
            <DialogFooter><Button onClick={handleDuplicateDay} disabled={targetDay === null}>Duplicate Schedule</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Planner;