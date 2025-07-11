import React, { useEffect, useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import LinkGrid from '@/components/LinkGrid';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

const defaultLinks = [
  // Productivity
  { title: 'ChatGPT', url: 'https://chat.openai.com/', category: 'Productivity' },
  { title: 'Notion', url: 'https://www.notion.so/', category: 'Productivity' },
  { title: 'Google Drive', url: 'https://drive.google.com/', category: 'Productivity' },
  { title: 'Trello', url: 'https://trello.com/', category: 'Productivity' },
  { title: 'Asana', url: 'https://app.asana.com/', category: 'Productivity' },
  { title: 'Todoist', url: 'https://todoist.com/', category: 'Productivity' },
  { title: 'Evernote', url: 'https://www.evernote.com/', category: 'Productivity' },
  { title: 'Slack', url: 'https://slack.com/', category: 'Productivity' },
  { title: 'Figma', url: 'https://www.figma.com/', category: 'Design' },
  { title: 'Canva', url: 'https://www.canva.com/', category: 'Design' },
  // Social
  { title: 'Twitter / X', url: 'https://twitter.com/', category: 'Social' },
  { title: 'LinkedIn', url: 'https://www.linkedin.com/', category: 'Social' },
  { title: 'Instagram', url: 'https://www.instagram.com/', category: 'Social' },
  { title: 'Facebook', url: 'https://www.facebook.com/', category: 'Social' },
  { title: 'Reddit', url: 'https://www.reddit.com/', category: 'Social' },
  { title: 'Pinterest', url: 'https://www.pinterest.com/', category: 'Social' },
  { title: 'TikTok', url: 'https://www.tiktok.com/', category: 'Social' },
  // Development
  { title: 'GitHub', url: 'https://github.com/', category: 'Development' },
  { title: 'Stack Overflow', url: 'https://stackoverflow.com/', category: 'Development' },
  { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/', category: 'Development' },
  { title: 'Vercel', url: 'https://vercel.com/', category: 'Development' },
  { title: 'Netlify', url: 'https://www.netlify.com/', category: 'Development' },
  { title: 'CodePen', url: 'https://codepen.io/', category: 'Development' },
  { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org/', category: 'Learning' },
  // Learning
  { title: 'YouTube', url: 'https://www.youtube.com/', category: 'Learning' },
  { title: 'Coursera', url: 'https://www.coursera.org/', category: 'Learning' },
  { title: 'Udemy', url: 'https://www.udemy.com/', category: 'Learning' },
  { title: 'Khan Academy', url: 'https://www.khanacademy.org/', category: 'Learning' },
  { title: 'Duolingo', url: 'https://www.duolingo.com/', category: 'Learning' },
  // Design
  { title: 'Dribbble', url: 'https://dribbble.com/', category: 'Design' },
  { title: 'Behance', url: 'https://www.behance.net/', category: 'Design' },
  { title: 'Adobe Color', url: 'https://color.adobe.com/', category: 'Design' },
  { title: 'Unsplash', url: 'https://unsplash.com/', category: 'Design' },
  { title: 'Pexels', url: 'https://www.pexels.com/', category: 'Design' },
  { title: 'Coolors', url: 'https://coolors.co/', category: 'Design' },
  // News & Reading
  { title: 'Medium', url: 'https://medium.com/', category: 'News & Reading' },
  { title: 'TechCrunch', url: 'https://techcrunch.com/', category: 'News & Reading' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com/', category: 'News & Reading' },
  { title: 'The Verge', url: 'https://www.theverge.com/', category: 'News & Reading' },
  { title: 'Pocket', url: 'https://getpocket.com/', category: 'News & Reading' },
  // Tools
  { title: 'Google Calendar', url: 'https://calendar.google.com/', category: 'Tools' },
  { title: 'Gmail', url: 'https://mail.google.com/', category: 'Tools' },
  { title: 'Google Maps', url: 'https://maps.google.com/', category: 'Tools' },
  { title: 'WolframAlpha', url: 'https://www.wolframalpha.com/', category: 'Tools' },
  { title: 'Typeform', url: 'https://www.typeform.com/', category: 'Tools' },
  { title: 'Calendly', url: 'https://calendly.com/', category: 'Tools' },
  // Entertainment
  { title: 'Spotify', url: 'https://open.spotify.com/', category: 'Entertainment' },
  { title: 'Netflix', url: 'https://www.netflix.com/', category: 'Entertainment' },
  { title: 'Twitch', url: 'https://www.twitch.tv/', category: 'Entertainment' },
];

const QuickLinksPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const addDefaultLinks = useCallback(async () => {
    if (!user) return;

    const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('has_default_links')
        .eq('id', user.id)
        .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching user profile for default links", profileError);
        return;
    }

    if(profileData?.has_default_links) {
        return;
    }

    const { count, error: countError } = await supabase
      .from('quick_links')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      toast({ title: 'Error checking for existing links', description: countError.message, variant: 'destructive' });
      return;
    }
    
    if(count > 0) {
        await supabase.from('user_profiles').update({ has_default_links: true }).eq('id', user.id);
        return;
    }

    const linksToInsert = defaultLinks.map(link => ({ ...link, user_id: user.id }));
    const { error: insertError } = await supabase.from('quick_links').insert(linksToInsert);

    if (insertError) {
      toast({ title: 'Error adding default links', description: insertError.message, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome!', description: 'Added some default quick links to get you started.' });
      const { error: updateError } = await supabase.from('user_profiles').update({ has_default_links: true }).eq('id', user.id);
      if (updateError) {
        console.error("Failed to mark user as having default links", updateError);
      }
    }
  }, [user, toast]);

  useEffect(() => {
    if(user) {
      addDefaultLinks();
    }
  }, [user, addDefaultLinks]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImport(file);
    }
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = (file) => {
    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const requiredFields = ['Title', 'URL', 'Category'];
        const headers = results.meta.fields;
        if (!requiredFields.every(field => headers.includes(field))) {
          toast({ title: 'Invalid CSV Format', description: `CSV must contain columns: ${requiredFields.join(', ')}`, variant: 'destructive' });
          setIsImporting(false);
          return;
        }

        const linksToInsert = results.data.map(row => ({
          title: row.Title,
          url: row.URL,
          category: row.Category,
          user_id: user.id,
        }));

        if (linksToInsert.length > 0) {
          const { error } = await supabase.from('quick_links').insert(linksToInsert);
          if (error) {
            toast({ title: 'Import Failed', description: error.message, variant: 'destructive' });
          } else {
            toast({ title: '✅ Import Successful', description: `${linksToInsert.length} links have been added.` });
            // Realtime will update the grid, no need to manually refetch
          }
        } else {
          toast({ title: 'No links to import', description: 'The selected CSV file is empty or invalid.', variant: 'destructive' });
        }
        setIsImporting(false);
      },
      error: (error) => {
        toast({ title: 'CSV Parsing Error', description: error.message, variant: 'destructive' });
        setIsImporting(false);
      }
    });
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Smart QuickLinks</h1>
        <p className="text-lg text-gray-400">Your personal launcher for daily-use links. Add, edit, and organize your favorite websites.</p>
      </motion.div>
      <LinkGrid isDashboardCard={false} />
      <motion.div 
        className="glass-card p-6 mt-8"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-glow mb-4">Bulk Import Links</h2>
            <p className="text-muted-foreground mb-4">Quickly add multiple links by uploading a CSV file. The file must contain "Title", "URL", and "Category" columns.</p>
            <Button onClick={() => fileInputRef.current.click()} disabled={isImporting}>
              {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Import via CSV
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".csv" className="hidden" />
          </div>
          <div className="bg-background/50 p-4 rounded-lg text-sm">
            <h3 className="font-bold mb-2">Example CSV Format:</h3>
            <pre className="text-muted-foreground"><code>
              Title,URL,Category<br/>
              ChatGPT,https://chat.openai.com,AI Tools<br/>
              YouTube,https://youtube.com,Media
            </code></pre>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuickLinksPage;