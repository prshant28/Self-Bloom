import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreVertical, Trash2, Edit, PlusCircle, Sun, Briefcase, BookOpen, Building, PenSquare, Moon } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const RoutineChecklist = () => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState({});
  const [expandedSection, setExpandedSection] = useState('morning');
  const [isAdding, setIsAdding] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user.id);
    if (error) {
      toast({ title: "Error fetching routines", description: error.message, variant: "destructive" });
    } else {
      const groupedRoutines = data.reduce((acc, routine) => {
        if (!acc[routine.category]) {
          acc[routine.category] = [];
        }
        acc[routine.category].push(routine);
        return acc;
      }, {});
      setRoutines(groupedRoutines);
    }
  };

  const handleAddTask = async (category) => {
    if (newTask.trim() === '') return;
    const { data, error } = await supabase
      .from('routines')
      .insert({ user_id: user.id, category, task: newTask, completed: false })
      .select()
      .single();
    if (error) {
      toast({ title: "Error adding task", description: error.message, variant: "destructive" });
    } else {
      setRoutines(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), data]
      }));
      setNewTask('');
      setIsAdding(null);
      toast({ title: "✅ Task Added!", description: `New task added to ${category}.` });
    }
  };

  const handleEditTask = async () => {
    if (!isEditing || isEditing.task.trim() === '') return;
    const { id, task } = isEditing;
    const { error } = await supabase
      .from('routines')
      .update({ task })
      .eq('id', id);
    if (error) {
      toast({ title: "Error updating task", description: error.message, variant: "destructive" });
    } else {
      fetchRoutines();
      setIsEditing(null);
      toast({ title: "✅ Task Updated!", description: "Your task has been successfully updated." });
    }
  };

  const confirmDeleteTask = (id) => {
    setTaskToDelete(id);
    setIsAlertOpen(true);
  };
  
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', taskToDelete);
    if (error) {
      toast({ title: "Error deleting task", description: error.message, variant: "destructive" });
    } else {
      fetchRoutines();
      setTaskToDelete(null);
      setIsAlertOpen(false);
      toast({ title: "🗑️ Task Deleted!", description: "The task has been removed." });
    }
  };

  const toggleTask = async (category, taskId) => {
    const routineCategory = routines[category] || [];
    const task = routineCategory.find(t => t.id === taskId);
    if (!task) return;

    const newCompletedState = !task.completed;
    const { error } = await supabase
      .from('routines')
      .update({ completed: newCompletedState })
      .eq('id', taskId);
    
    if (error) {
      toast({ title: "Error updating task", description: error.message, variant: "destructive" });
    } else {
      fetchRoutines(); // Re-fetch to update UI
      if(newCompletedState) {
        toast({ title: "🎉 Task Completed!", description: `+10 XP earned! Keep up the great work!` });
      }
    }
  };

  const getProgressPercentage = (category) => {
    const routineCategory = routines[category] || [];
    if (routineCategory.length === 0) return 0;
    const completed = routineCategory.filter(task => task.completed).length;
    return (completed / routineCategory.length) * 100;
  };

  const categories = [
    { key: 'morning', label: 'Morning Routine', icon: Sun },
    { key: 'business', label: 'Business Hours', icon: Briefcase },
    { key: 'study', label: 'Study Blocks', icon: BookOpen },
    { key: 'library', label: 'Library Sessions', icon: Building },
    { key: 'content', label: 'Content Time', icon: PenSquare },
    { key: 'evening', label: 'Evening Routine', icon: Moon }
  ];

  return (
    <>
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <i className="fas fa-tasks mr-3 text-primary"></i>
          Automate Repetitive Tasks
        </h2>

        <div className="space-y-4">
          {categories.map(({ key, label, icon: Icon }) => {
            const progress = getProgressPercentage(key);
            const isExpanded = expandedSection === key;
            
            return (
              <div key={key} className="glass-card p-4 transition-all duration-300">
                <header
                  onClick={() => setExpandedSection(isExpanded ? null : key)}
                  className="w-full flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
                      <Icon className="text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-white">{label}</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-input rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
                      </div>
                    </div>
                  </div>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                    <i className="fas fa-chevron-down text-gray-500"></i>
                  </motion.div>
                </header>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3">
                        {routines[key]?.map((task) => (
                           isEditing && isEditing.id === task.id ? (
                            <motion.div key={task.id} className="flex items-center space-x-2">
                              <Input
                                type="text"
                                value={isEditing.task}
                                onChange={(e) => setIsEditing({ ...isEditing, task: e.target.value })}
                                className="flex-grow"
                                onKeyPress={(e) => e.key === 'Enter' && handleEditTask()}
                              />
                              <Button onClick={handleEditTask}>Save</Button>
                              <Button variant="ghost" onClick={() => setIsEditing(null)}>Cancel</Button>
                            </motion.div>
                           ) : (
                            <motion.div
                              key={task.id}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => toggleTask(key, task.id)}
                                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                    task.completed 
                                      ? 'bg-primary border-primary' 
                                      : 'border-muted-foreground hover:border-primary'
                                  }`}
                                >
                                  {task.completed && (
                                    <i className="fas fa-check text-white text-xs"></i>
                                  )}
                                </button>
                                <span className={`text-gray-300 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                  {task.task}
                                </span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setIsEditing({ id: task.id, task: task.task })}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => confirmDeleteTask(task.id)} className="text-red-500">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </motion.div>
                          )
                        ))}
                         {isAdding === key ? (
                          <motion.div className="flex items-center space-x-2">
                             <Input
                               type="text"
                               placeholder="Add a new task..."
                               value={newTask}
                               onChange={(e) => setNewTask(e.target.value)}
                               className="flex-grow"
                               onKeyPress={(e) => e.key === 'Enter' && handleAddTask(key)}
                             />
                             <Button onClick={() => handleAddTask(key)}>Add</Button>
                             <Button variant="ghost" onClick={() => setIsAdding(null)}>Cancel</Button>
                          </motion.div>
                        ) : (
                          <Button variant="ghost" onClick={() => setIsAdding(key)} className="w-full justify-start text-primary">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task from your routine.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RoutineChecklist;