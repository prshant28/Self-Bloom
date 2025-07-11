import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Plus, Trash2, Edit, Save } from 'lucide-react';

const TodoList = ({ onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (error) {
      toast({ title: 'Error fetching todos', description: error.message, variant: 'destructive' });
    } else {
      setTodos(data);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTask.trim() === '') return;
    const { data, error } = await supabase
      .from('todos')
      .insert({ user_id: user.id, task: newTask })
      .select()
      .single();
    if (error) {
      toast({ title: 'Error adding task', description: error.message, variant: 'destructive' });
    } else {
      setTodos([...todos, data]);
      setNewTask('');
      toast({ title: '✅ Task Added!' });
    }
  };

  const handleToggleComplete = async (id, completed) => {
    if (!user) return;
    const { error } = await supabase
      .from('todos')
      .update({ completed: !completed, completed_at: !completed ? new Date().toISOString() : null })
      .eq('id', id);
    if (error) {
      toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
    } else {
      setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !completed } : todo));
      if (!completed) {
        toast({ title: '🎉 Task Completed!' });
        if (onUpdate) onUpdate();
      }
    }
  };

  const handleDeleteTask = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting task', description: error.message, variant: 'destructive' });
    } else {
      setTodos(todos.filter(todo => todo.id !== id));
      toast({ title: '🗑️ Task Deleted' });
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task.id);
    setEditingText(task.task);
  };

  const handleSaveTask = async (id) => {
    if (editingText.trim() === '') return;
    const { error } = await supabase
      .from('todos')
      .update({ task: editingText })
      .eq('id', id);
    if (error) {
      toast({ title: 'Error saving task', description: error.message, variant: 'destructive' });
    } else {
      setTodos(todos.map(todo => todo.id === id ? { ...todo, task: editingText } : todo));
      setEditingTask(null);
      setEditingText('');
      toast({ title: '✅ Task Saved!' });
    }
  };

  return (
    <motion.div className="glass-card p-6 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="font-display text-xl font-bold text-glow">To-Do List</h2>
      <form onSubmit={handleAddTask} className="flex space-x-2">
        <Input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="bg-background"
        />
        <Button type="submit" size="icon"><Plus /></Button>
      </form>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        <AnimatePresence>
          {todos.map(todo => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center space-x-2 p-2 rounded-lg bg-background/50"
            >
              <Checkbox
                id={`todo-${todo.id}`}
                checked={todo.completed}
                onCheckedChange={() => handleToggleComplete(todo.id, todo.completed)}
              />
              {editingTask === todo.id ? (
                <Input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="flex-grow h-8 bg-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTask(todo.id)}
                />
              ) : (
                <label
                  htmlFor={`todo-${todo.id}`}
                  className={`flex-grow text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {todo.task}
                </label>
              )}
              {editingTask === todo.id ? (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSaveTask(todo.id)}><Save className="h-4 w-4" /></Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTask(todo)}><Edit className="h-4 w-4" /></Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTask(todo.id)}><Trash2 className="h-4 w-4" /></Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TodoList;