import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileUp, Download } from 'lucide-react';

const PlannerImportExport = ({ onImport, onExport }) => {
  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onImport}>
              <FileUp className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="p-2 text-sm max-w-xs text-left">
              <p className="font-bold mb-2">Import from CSV</p>
              <p className="mb-2">Import a CSV file with headers:</p>
              <code className="text-xs bg-muted p-1 rounded">activity, category, start_time, end_time, reminder_enabled, color, details</code>
              <ul className="list-disc list-inside mt-2 text-xs space-y-1">
                <li><code className="text-xs bg-muted p-1 rounded">start_time</code> and <code className="text-xs bg-muted p-1 rounded">end_time</code> should be in HH:MM format.</li>
                <li><code className="text-xs bg-muted p-1 rounded">reminder_enabled</code> should be 'true' or 'false'.</li>
                <li><code className="text-xs bg-muted p-1 rounded">color</code> should be a valid Tailwind border color class e.g., 'border-l-rose-500'.</li>
                <li><code className="text-xs bg-muted p-1 rounded">details</code> is optional text.</li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export to CSV</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default PlannerImportExport;