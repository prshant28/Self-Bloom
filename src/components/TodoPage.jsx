import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Plus, Trash2, Edit, Save, Target, FileUp, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Papa from 'papaparse';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TodoItem = ({ todo, onToggle, onDelete, onEdit, onSave, onAddSubtask, editingTask, editingText, setEditingText, goals }) => {
  const [subtaskText, setSubtaskText] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(true);

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (subtaskText.trim()) {
      onAddSubtask(todo.id, subtaskText);
      setSubtaskText('');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-card p-4 rounded-lg"
    >
      <div className="flex items-center space-x-4">
        <Checkbox
          id={`todo-page-${todo.id}`}
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id, todo.completed)}
        />
        <div className="flex-grow">
          {editingTask === todo.id ? (
            <Input
              type="text"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="h-8 bg-input"
              onKeyDown={(e) => e.key === 'Enter' && onSave(todo.id)}
            />
          ) : (
            <label
              htmlFor={`todo-page-${todo.id}`}
              className={`text-base ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
            >
              {todo.task}
            </label>
          )}
          {todo.goals && (
            <div className="flex items-center text-xs text-primary mt-1">
              <Target className="h-3 w-3 mr-1" />
              <span>{todo.goals.title}</span>
            </div>
          )}
        </div>
        {editingTask === todo.id ? (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSave(todo.id)}><Save className="h-4 w-4" /></Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(todo.id, todo.task)}><Edit className="h-4 w-4" /></Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(todo.id)}><Trash2 className="h-4 w-4" /></Button>
        {todo.subtasks && todo.subtasks.length > 0 && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSubtasks(!showSubtasks)}>
            {showSubtasks ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <AnimatePresence>
        {showSubtasks && todo.subtasks && todo.subtasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-10 mt-2 space-y-2"
          >
            {todo.subtasks.map(subtask => (
              <TodoItem
                key={subtask.id}
                todo={subtask}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onSave={onSave}
                onAddSubtask={onAddSubtask}
                editingTask={editingTask}
                editingText={editingText}
                setEditingText={setEditingText}
                goals={goals}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {!todo.parent_id && (
        <form onSubmit={handleAddSubtask} className="pl-10 mt-2 flex items-center gap-2">
          <Input
            type="text"
            placeholder="Add a sub-task..."
            value={subtaskText}
            onChange={(e) => setSubtaskText(e.target.value)}
            className="h-8 bg-input flex-grow"
          />
          <Button type="submit" size="icon" variant="ghost" className="h-8 w-8"><Plus className="h-4 w-4" /></Button>
        </form>
      )}
    </motion.div>
  );
};

const TodoPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingText, setEditingText] = useState('');
  const fileInputRef = useRef(null);

  const fetchTodosAndGoals = useCallback(async () => {
    if (!user) return;
    const { data: todoData, error: todoError } = await supabase.from('todos').select('*, goals(title)').eq('user_id', user.id).order('created_at', { ascending: true });
    const { data: goalData, error: goalError } = await supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'in_progress');

    if (todoError) toast({ title: 'Error fetching todos', description: todoError.message, variant: 'destructive' });
    else {
      const todoMap = new Map(todoData.map(t => [t.id, { ...t, subtasks: [] }]));
      const rootTodos = [];
      for (const todo of todoData) {
        if (todo.parent_id && todoMap.has(todo.parent_id)) {
          todoMap.get(todo.parent_id).subtasks.push(todoMap.get(todo.id));
        } else {
          rootTodos.push(todoMap.get(todo.id));
        }
      }
      setTodos(rootTodos);
    }

    if (goalError) toast({ title: 'Error fetching goals', description: goalError.message, variant: 'destructive' });
    else setGoals(goalData);
  }, [user, toast]);

  useEffect(() => {
    fetchTodosAndGoals();
  }, [fetchTodosAndGoals]);

  const handleAddTask = async (e, parentId = null) => {
    e.preventDefault();
    const taskText = parentId ? e.target.elements[0].value : newTask;
    if (taskText.trim() === '') return;

    const { error } = await supabase
      .from('todos')
      .insert({ user_id: user.id, task: taskText, goal_id: selectedGoal, parent_id: parentId });
      
    if (error) {
      toast({ title: 'Error adding task', description: error.message, variant: 'destructive' });
    } else {
      fetchTodosAndGoals();
      if (!parentId) {
        setNewTask('');
        setSelectedGoal(null);
      }
      toast({ title: `✅ ${parentId ? 'Sub-task' : 'Task'} Added!` });
    }
  };

  const handleToggleComplete = async (id, completed) => {
    const { error } = await supabase.from('todos').update({ completed: !completed, completed_at: !completed ? new Date().toISOString() : null }).eq('id', id);
    if (error) {
      toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
    } else {
      fetchTodosAndGoals();
      if (!completed) {
        toast({ title: '🎉 Task Completed!' });
      }
    }
  };

  const handleDeleteTask = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting task', description: error.message, variant: 'destructive' });
    } else {
      fetchTodosAndGoals();
      toast({ title: '🗑️ Task Deleted' });
    }
  };

  const handleSaveTask = async (id) => {
    if (editingText.trim() === '') return;
    const { error } = await supabase.from('todos').update({ task: editingText }).eq('id', id);
    if (error) {
      toast({ title: 'Error saving task', description: error.message, variant: 'destructive' });
    } else {
      fetchTodosAndGoals();
      setEditingTask(null);
      setEditingText('');
      toast({ title: '✅ Task Saved!' });
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const requiredFields = ['task'];
        const csvData = results.data;
        const isValid = csvData.every(row => requiredFields.every(field => field in row));

        if (!isValid) {
          toast({ title: 'Invalid CSV format', description: 'Ensure your CSV has a "task" header.', variant: 'destructive' });
          return;
        }

        const tasksToInsert = csvData.map(row => ({
          user_id: user.id,
          task: row.task,
          completed: row.completed === 'true' || false,
        }));
        
        const { error } = await supabase.from('todos').insert(tasksToInsert);
        if (error) {
            toast({ title: "Error importing tasks", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "✅ Tasks imported successfully!" });
            fetchTodosAndGoals();
        }
      },
      error: (err) => {
        toast({ title: "CSV Parsing Error", description: err.message, variant: "destructive" });
      }
    });
    event.target.value = null; // Reset file input
  };

  const today = new Date().toISOString().split('T')[0];
  const dailyFocusTasks = todos.filter(todo => !todo.completed && todo.created_at.startsWith(today));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="font-display text-4xl font-bold text-glow mb-2">To-Do List</h1>
            <p className="text-lg opacity-75">Organize your tasks and link them to your goals.</p>
        </div>
        <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon"><Info className="h-5 w-5 text-muted-foreground"/></Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import a CSV with a 'task' header. Optional: 'completed' (true/false).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" onClick={() => fileInputRef.current.click()}><FileUp className="mr-2 h-4 w-4" /> Import CSV</Button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
        </div>
      </motion.div>

      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="md:col-span-2 bg-background"
          />
          <div className="flex gap-2">
            <Select onValueChange={setSelectedGoal} value={selectedGoal || ''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Link to a goal (optional)" />
              </SelectTrigger>
              <SelectContent>
                {goals.map(goal => (
                  <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" size="icon"><Plus /></Button>
          </div>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <h2 className="font-display text-2xl font-bold text-glow">All Tasks</h2>
          <AnimatePresence>
            {todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleComplete}
                onDelete={handleDeleteTask}
                onEdit={(id, text) => { setEditingTask(id); setEditingText(text); }}
                onSave={handleSaveTask}
                onAddSubtask={(parentId, taskText) => handleAddTask({ preventDefault: () => {}, target: { elements: [{ value: taskText }] } }, parentId)}
                editingTask={editingTask}
                editingText={editingText}
                setEditingText={setEditingText}
                goals={goals}
              />
            ))}
          </AnimatePresence>
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-glow">Daily Focus</h2>
          <div className="glass-card p-4 space-y-2">
            {dailyFocusTasks.length > 0 ? dailyFocusTasks.map(todo => (
              <div key={`focus-${todo.id}`} className="flex items-center gap-2 text-sm">
                <Checkbox id={`focus-check-${todo.id}`} checked={todo.completed} onCheckedChange={() => handleToggleComplete(todo.id, todo.completed)} />
                <label htmlFor={`focus-check-${todo.id}`} className={`${todo.completed ? 'line-through text-muted-foreground' : ''}`}>{todo.task}</label>
              </div>
            )) : <p className="text-sm text-muted-foreground text-center py-4">No tasks added today. Add some to see them here!</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;