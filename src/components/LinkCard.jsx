import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreVertical, Edit, Trash2, ExternalLink } from 'lucide-react';

const LinkCard = ({ link, onEdit, onDelete }) => {
  const openLink = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const getFaviconUrl = (url) => {
    try {
      const urlObject = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=64`;
    } catch (e) {
      return 'https://via.placeholder.com/64'; // Fallback
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
        <Tooltip>
            <TooltipTrigger asChild>
                <motion.div
                  className="glass-card p-4 flex items-center justify-between gap-3 group"
                  whileHover={{ y: -5, scale: 1.03 }}
                  layout
                >
                  <div className="flex items-center gap-4 overflow-hidden cursor-pointer" onClick={openLink}>
                    <img
                      src={link.icon_url || getFaviconUrl(link.url)}
                      alt={`${link.title} icon`}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/64"; }}
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-bold truncate text-foreground">{link.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 group-hover:opacity-100">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={openLink}>
                          <ExternalLink className="mr-2 h-4 w-4" /> Open Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(link)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(link.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="bg-background/80 backdrop-blur-sm border-primary/20 text-foreground">
                <div className="text-left p-1 max-w-xs">
                    <p className="font-bold text-base">{link.title}</p>
                    <p className="text-muted-foreground text-xs break-all">{link.url}</p>
                    {link.category && <p className="text-xs mt-1"><span className="font-semibold text-primary">Category:</span> {link.category}</p>}
                </div>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
};

export default LinkCard;