import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutTemplate, PlusCircle, Eye, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { plannerTemplates } from '@/components/planner/plannerTemplates';
import { goalTemplates } from '@/pages/templates/goalTemplates';
import { knowledgeHubTemplates } from '@/pages/templates/knowledgeHubTemplates';

const templates = [
  // Planner Templates
  { id: 'planner-1', category: 'Planner', title: 'Study Focus', description: 'A schedule designed for deep work and learning sessions.', data: { type: 'planner', key: 'study-focus' }, preview: plannerTemplates['study-focus'] },
  { id: 'planner-2', category: 'Planner', title: 'Balanced Day', description: 'Integrates work, personal projects, and relaxation.', data: { type: 'planner', key: 'balanced-day' }, preview: plannerTemplates['balanced-day'] },
  { id: 'planner-3', category: 'Planner', title: 'Content Creator', description: 'A workflow for brainstorming, creating, and editing content.', data: { type: 'planner', key: 'content-creator' }, preview: plannerTemplates['content-creator'] },
  { id: 'planner-4', category: 'Planner', title: 'Fitness Foundation', description: 'A plan focused on workouts, meal prep, and active recovery.', data: { type: 'planner', key: 'fitness-foundation' }, preview: plannerTemplates['fitness-foundation'] },
  
  // Goal Templates
  { id: 'goal-1', category: 'Goals', title: 'Learn a New Skill', description: 'A 3-month plan to acquire a new skill with milestones.', data: { type: 'goal', key: 'learn-skill' }, preview: goalTemplates['learn-skill'] },
  { id: 'goal-2', category: 'Goals', title: 'Launch a Side Project', description: 'Structured goals for taking a project from idea to launch.', data: { type: 'goal', key: 'launch-project' }, preview: goalTemplates['launch-project'] },
  
  // Vision Board Templates
  { id: 'vision-1', category: 'Vision Board', title: 'Minimalist Dream', description: 'A clean, modern vision board layout with space for key images and affirmations.', data: { type: 'vision', key: 'minimalist-dream' }, preview: { html: "<div style='padding: 1rem; text-align: center; border: 1px solid #ccc; border-radius: 8px;'><h1>Minimalist Dream</h1><p>A simple, focused life.</p></div>" } },
  
  // Knowledge Hub Templates
  { id: 'knowledge-1', category: 'Knowledge Hub', title: 'Web Development Basics', description: 'A curated list of 10 videos covering HTML, CSS, and JavaScript fundamentals.', data: { type: 'knowledge', key: 'web-dev-basics' }, preview: knowledgeHubTemplates['web-dev-basics'] },
  { id: 'knowledge-2', category: 'Knowledge Hub', title: 'Productivity Hacks', description: 'Learn from the best minds in productivity like Ali Abdaal and Thomas Frank.', data: { type: 'knowledge', key: 'productivity-hacks' }, preview: knowledgeHubTemplates['productivity-hacks'] },
];

const TemplateCard = ({ template, onPreview, onUse }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="glass-card p-6 flex flex-col justify-between"
  >
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary/20 p-2 rounded-lg">
          <LayoutTemplate className="h-6 w-6 text-primary" />
        </div>
        <span className="bg-secondary text-secondary-foreground px-2 py-1 text-xs font-bold rounded">{template.category}</span>
      </div>
      <h3 className="font-display text-xl font-bold text-glow">{template.title}</h3>
      <p className="text-muted-foreground mt-2 text-sm flex-grow">{template.description}</p>
    </div>
    <div className="flex gap-2 mt-6">
      <Button variant="outline" className="w-full" onClick={() => onPreview(template)}>
        <Eye className="mr-2 h-4 w-4" /> Preview
      </Button>
      <Button className="w-full" onClick={() => onUse(template)}>
        <Sparkles className="mr-2 h-4 w-4" /> Use Template
      </Button>
    </div>
  </motion.div>
);

const TemplatePreview = ({ template, onUse }) => {
    if (!template) return null;

    const renderPreviewContent = () => {
        switch (template.category) {
            case 'Planner':
                return (
                    <div className="space-y-2">
                        {template.preview.events.slice(0, 3).map((event, i) => (
                            <div key={i} className="bg-background/50 p-2 rounded-md text-sm">{event.start_time} - {event.activity}</div>
                        ))}
                        {template.preview.events.length > 3 && <p className="text-xs text-center">...and more</p>}
                    </div>
                );
            case 'Goals':
                 return (
                    <div className="space-y-2">
                        {template.preview.goals.map((goal, i) => (
                            <div key={i} className="bg-background/50 p-2 rounded-md text-sm"><strong>{goal.title}:</strong> {goal.description}</div>
                        ))}
                    </div>
                );
            case 'Vision Board':
                return <iframe srcDoc={template.preview.html} title="Vision Preview" className="w-full h-48 border-0 rounded-md" sandbox="" />;
            case 'Knowledge Hub':
                return (
                    <ul className="list-disc list-inside space-y-1">
                        {template.preview.items.slice(0, 4).map((item, i) => <li key={i}>{item.title}</li>)}
                        {template.preview.items.length > 4 && <p className="text-xs text-center">...and more</p>}
                    </ul>
                );
            default:
                return <p>No preview available for this template type.</p>;
        }
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle className="font-display text-2xl text-glow">{template.title}</DialogTitle>
                <DialogDescription>{template.description}</DialogDescription>
            </DialogHeader>
            <div className="py-4 my-4 border-y border-border">
                <h4 className="font-semibold mb-2">Preview:</h4>
                {renderPreviewContent()}
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => onUse(null)}>Cancel</Button>
                <Button onClick={() => onUse(template)}><Sparkles className="mr-2 h-4 w-4" /> Use Template</Button>
            </DialogFooter>
        </DialogContent>
    );
};

const TemplatesPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [previewingTemplate, setPreviewingTemplate] = useState(null);

  const handleUseTemplate = (template) => {
    if (!template) {
        setPreviewingTemplate(null);
        return;
    }
    
    toast({
      title: `Applying "${template.title}"`,
      description: "You will be redirected to the relevant page.",
    });

    const navigationMap = {
        'Planner': '/app/planner',
        'Goals': '/app/goals',
        'Vision Board': '/app/vision-board',
        'Knowledge Hub': '/app/knowledge-hub'
    };

    const path = navigationMap[template.category];

    if (path) {
        navigate(path, { state: { templateToApply: template.data.key } });
    } else {
        toast({ title: "Unknown template type", variant: "destructive" });
    }
    setPreviewingTemplate(null);
  };

  const handleCreateOwn = () => {
    toast({
      title: "🚧 Feature in development!",
      description: "Creating your own templates is coming soon. Stay tuned!",
    });
  };

  const filteredTemplates = filter === 'all' ? templates : templates.filter(t => t.category === filter);
  const categories = ['all', ...[...new Set(templates.map(t => t.category))]];

  return (
    <>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-glow mb-2">Template Library</h1>
          <p className="text-lg opacity-75">Kickstart your journey with pre-built templates for every need.</p>
        </motion.div>

        <div className="sticky top-16 z-10 py-4 bg-background/80 backdrop-blur-md -mx-4 px-4 rounded-b-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All Templates' : cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleCreateOwn}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Your Own Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={setPreviewingTemplate}
                onUse={handleUseTemplate}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <Dialog open={!!previewingTemplate} onOpenChange={() => setPreviewingTemplate(null)}>
        <TemplatePreview template={previewingTemplate} onUse={handleUseTemplate} />
      </Dialog>
    </>
  );
};

export default TemplatesPage;