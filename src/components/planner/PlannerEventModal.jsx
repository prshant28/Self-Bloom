import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, Plus } from 'lucide-react';

const eventColorOptions = [
    { value: 'border-l-rose-500', label: 'Rose' },
    { value: 'border-l-pink-500', label: 'Pink' },
    { value: 'border-l-fuchsia-500', label: 'Fuchsia' },
    { value: 'border-l-purple-500', label: 'Purple' },
    { value: 'border-l-violet-500', label: 'Violet' },
    { value: 'border-l-indigo-500', label: 'Indigo' },
    { value: 'border-l-blue-500', label: 'Blue' },
    { value: 'border-l-sky-500', label: 'Sky' },
    { value: 'border-l-cyan-500', label: 'Cyan' },
    { value: 'border-l-teal-500', label: 'Teal' },
    { value: 'border-l-emerald-500', label: 'Emerald' },
    { value: 'border-l-green-500', label: 'Green' },
    { value: 'border-l-lime-500', label: 'Lime' },
    { value: 'border-l-yellow-500', label: 'Yellow' },
    { value: 'border-l-amber-500', label: 'Amber' },
    { value: 'border-l-orange-500', label: 'Orange' },
    { value: 'border-l-red-500', label: 'Red' },
];

const PlannerEventModal = ({ isOpen, setIsOpen, editingEvent, onSave, day }) => {
  const [formData, setFormData] = useState({
    activity: '',
    category: '',
    start_time: '',
    end_time: '',
    reminder_enabled: false,
    color: '',
    details: ''
  });

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        activity: editingEvent.activity || '',
        category: editingEvent.category || '',
        start_time: editingEvent.start_time || '',
        end_time: editingEvent.end_time || '',
        reminder_enabled: editingEvent.reminder_enabled || false,
        color: editingEvent.color || '',
        details: editingEvent.details || ''
      });
    } else {
      setFormData({
        activity: '', category: '', start_time: '', end_time: '',
        reminder_enabled: false, color: '', details: ''
      });
    }
  }, [editingEvent, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked) => {
    setFormData(prev => ({ ...prev, reminder_enabled: checked }));
  };

  const handleColorChange = (value) => {
    setFormData(prev => ({ ...prev, color: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          <DialogDescription>{editingEvent ? `Update details for your event on ${day}.` : `Fill in details for your new event on ${day}.`}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activity" className="text-right">Activity</Label>
            <Input id="activity" name="activity" value={formData.activity} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Input id="category" name="category" value={formData.category} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start_time" className="text-right">Start Time</Label>
            <Input id="start_time" name="start_time" type="time" value={formData.start_time} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end_time" className="text-right">End Time</Label>
            <Input id="end_time" name="end_time" type="time" value={formData.end_time} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="details" className="text-right pt-2">Details</Label>
            <Textarea id="details" name="details" value={formData.details} onChange={handleChange} className="col-span-3" placeholder="Add more details, notes, or an AI prompt..." />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">Color</Label>
            <Select onValueChange={handleColorChange} value={formData.color}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a color..." />
              </SelectTrigger>
              <SelectContent>
                {eventColorOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className='flex items-center gap-2'>
                      <div className={`w-4 h-4 rounded-full ${option.value.replace('border-l-','bg-')}`}></div>
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reminder" className="text-right">Set Reminder</Label>
            <Switch id="reminder" checked={formData.reminder_enabled} onCheckedChange={handleSwitchChange} />
          </div>
          <DialogFooter>
            <Button type="submit">
              {editingEvent ? <><Save className="mr-2 h-4 w-4" /> Save Changes</> : <><Plus className="mr-2 h-4 w-4" /> Add Event</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlannerEventModal;