import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Download, Upload, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
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

const tablesToExport = [
  'schedule',
  'todos',
  'goals',
  'media_content',
  'user_metrics',
  'vision_boards',
  'user_profiles',
  'quick_links'
];

const DataPortability = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    if (!user) {
      toast({ title: 'You must be logged in to export data.', variant: 'destructive' });
      return;
    }
    setIsExporting(true);
    toast({ title: '🚀 Starting Export...', description: 'Gathering your data. This may take a moment.' });

    try {
      const exportData = {};
      for (const table of tablesToExport) {
        let query = supabase.from(table).select('*');
        // user_profiles table has 'id' as the user identifier, not 'user_id'
        if (table === 'user_profiles') {
          query = query.eq('id', user.id);
        } else {
          query = query.eq('user_id', user.id);
        }
        
        const { data, error } = await query;

        if (error) throw new Error(`Error exporting ${table}: ${error.message}`);
        exportData[table] = data;
      }

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `selfbloom_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: '✅ Export Complete!', description: 'Your data has been downloaded.' });
    } catch (error) {
      toast({ title: 'Export Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImport(file);
    }
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = async (file) => {
    if (!user) {
      toast({ title: 'You must be logged in to import data.', variant: 'destructive' });
      return;
    }
    setIsImporting(true);
    toast({ title: '🚀 Starting Import...', description: 'Please do not close this window.' });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        for (const table of tablesToExport) {
          if (importData[table] && Array.isArray(importData[table])) {
            // Delete existing data for the user in this table
            if (table !== 'user_profiles') {
                await supabase.from(table).delete().eq('user_id', user.id);
            }

            if (importData[table].length > 0) {
                const dataToInsert = importData[table].map(row => {
                  const { id, created_at, updated_at, ...rest } = row;
                  const newRow = { ...rest };
                  if (table !== 'user_profiles') {
                    newRow.user_id = user.id;
                  }
                  return newRow;
                });

                if (table === 'user_profiles') {
                    const { id, ...profileData } = dataToInsert.find(p => p.id === user.id) || {};
                    if (Object.keys(profileData).length > 0) {
                        await supabase.from('user_profiles').update(profileData).eq('id', user.id);
                    }
                } else {
                    const { error } = await supabase.from(table).insert(dataToInsert);
                    if (error) throw new Error(`Error importing to ${table}: ${error.message}`);
                }
            }
          }
        }
        toast({ title: '✅ Import Complete!', description: 'Your data has been restored. The app will now reload.' });
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        toast({ title: 'Import Failed', description: error.message, variant: 'destructive' });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    if (!user) return;
    setResetting(true);
    toast({ title: '🗑️ Resetting your data...', description: 'This might take a moment.'});
    
    const tablesToDeleteFrom = tablesToExport.filter(t => t !== 'user_profiles');
    try {
        for (const table of tablesToDeleteFrom) {
            const { error } = await supabase.from(table).delete().eq('user_id', user.id);
            if (error) throw new Error(`Failed to clear ${table}: ${error.message}`);
        }
        // Also reset weekly focus in user_profiles
        await supabase.from('user_profiles').update({ weekly_focus: [] }).eq('id', user.id);

        toast({ title: '✅ Data Reset Successfully!', description: 'Your account has been cleared.'});
    } catch (error) {
        toast({ title: 'Error Resetting Data', description: error.message, variant: 'destructive' });
    } finally {
        setResetting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-4xl font-bold text-glow mb-2">Data Portability</h1>
        <p className="text-lg opacity-75">Manage your personal data by exporting or importing it.</p>
      </motion.div>

      <motion.div className="glass-card p-8 space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div>
          <h2 className="text-2xl font-bold flex items-center"><Download className="mr-3 text-primary"/> Export Your Data</h2>
          <p className="text-muted-foreground mt-2">Download a complete backup of all your data in a single JSON file. Keep it safe as a personal backup.</p>
          <Button className="mt-4" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export Data
          </Button>
        </div>
        
        <div className="border-t border-border my-8"></div>

        <div>
          <h2 className="text-2xl font-bold flex items-center"><Upload className="mr-3 text-primary"/> Import Your Data</h2>
          <p className="text-muted-foreground mt-2">Restore your data from a previously exported JSON file.</p>
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/50 text-destructive-foreground flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-1 text-destructive"/>
            <div>
              <h3 className="font-bold">Warning</h3>
              <p className="text-sm">Importing data will <span className="font-bold">overwrite all existing data</span> in your current account. This action cannot be undone.</p>
            </div>
          </div>
          <Button className="mt-4" onClick={() => fileInputRef.current.click()} disabled={isImporting}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Import Data
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="application/json" className="hidden" />
        </div>

        <div className="border-t border-border my-8"></div>

        <div>
          <h2 className="text-2xl font-bold flex items-center"><Trash2 className="mr-3 text-destructive"/> Reset Account Data</h2>
          <p className="text-muted-foreground mt-2">Permanently delete all your transactional data like schedules, to-dos, and goals. Your profile information will be kept.</p>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="mt-4" disabled={resetting}>
                      {resetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                      Reset All Data
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center"><AlertTriangle className="mr-2 text-destructive"/>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all your schedules, to-dos, goals, and other personal data from our servers.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetData}>Yes, reset my data</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        </div>
      </motion.div>
    </div>
  );
};

export default DataPortability;