import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, FolderPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CategoryManager from '@/components/CategoryManager';

const currencies = [
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'JPY', label: '¥ JPY' },
  { value: 'INR', label: '₹ INR' },
];

const FinanceSettingsModal = ({ isOpen, setIsOpen, preferredCurrency, setPreferredCurrency, transactions, onCategoriesUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [categoryManagerType, setCategoryManagerType] = useState('expense');

  const existingCategories = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (!acc[t.type]) acc[t.type] = [];
      if (t.category && !acc[t.type].includes(t.category)) {
        acc[t.type].push(t.category);
      }
      return acc;
    }, { income: [], expense: [] });
  }, [transactions]);

  const handleCurrencyChange = async (newCurrency) => {
    setPreferredCurrency(newCurrency);
    const { error } = await supabase.from('user_profiles').update({ preferred_currency: newCurrency }).eq('id', user.id);
    if (error) {
        toast({ title: 'Error updating currency', variant: 'destructive' });
    } else {
        toast({ title: 'Currency updated!' });
    }
  };

  const openCategoryManager = (type) => {
    setCategoryManagerType(type);
    setIsCategoryManagerOpen(true);
  };

  const handleCategoriesUpdate = async (updatedCategories, action, item) => {
    if (action === 'delete') {
        const { error } = await supabase
            .from('transactions')
            .update({ category: null })
            .eq('user_id', user.id)
            .eq('category', item);
        if (error) {
            toast({ title: 'Error un-categorizing transactions', description: error.message, variant: 'destructive' });
        }
    }
    onCategoriesUpdate();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Finance Settings</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>Preferred Currency</Label>
              <Select value={preferredCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label>Manage Categories</Label>
               <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={() => openCategoryManager('expense')}><FolderPlus className="mr-2 h-4 w-4" /> Expense</Button>
                <Button variant="outline" onClick={() => openCategoryManager('income')}><FolderPlus className="mr-2 h-4 w-4" /> Income</Button>
              </div>
            </div>
            <div>
              <Label>Export Data</Label>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsExportModalOpen(true)}><Download className="mr-2 h-4 w-4" /> Export Report</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ExportModal 
        isOpen={isExportModalOpen} 
        setIsOpen={setIsExportModalOpen} 
        transactions={transactions} 
        preferredCurrency={preferredCurrency}
        categories={[...new Set([...(existingCategories.income || []), ...(existingCategories.expense || [])])]}
      />

      <CategoryManager
        isOpen={isCategoryManagerOpen}
        setIsOpen={setIsCategoryManagerOpen}
        title={`Manage ${categoryManagerType.charAt(0).toUpperCase() + categoryManagerType.slice(1)} Categories`}
        description={`Add or remove categories for your ${categoryManagerType} transactions.`}
        existingItems={existingCategories[categoryManagerType] || []}
        onUpdate={handleCategoriesUpdate}
        itemTypeLabel="category"
      />
    </>
  );
};

const ExportModal = ({ isOpen, setIsOpen, transactions, preferredCurrency, categories }) => {
    const { toast } = useToast();
    const [exportFilters, setExportFilters] = useState({
        dateFrom: '',
        dateTo: '',
        category: 'all',
    });

    const handleExport = (format) => {
        let dataToExport = [...transactions];
        if (exportFilters.dateFrom) {
          dataToExport = dataToExport.filter(t => new Date(t.transaction_date) >= new Date(exportFilters.dateFrom));
        }
        if (exportFilters.dateTo) {
          dataToExport = dataToExport.filter(t => new Date(t.transaction_date) <= new Date(exportFilters.dateTo));
        }
        if (exportFilters.category !== 'all') {
          dataToExport = dataToExport.filter(t => t.category === exportFilters.category);
        }
    
        if (dataToExport.length === 0) {
          toast({ title: "No data to export for the selected filters.", variant: "destructive" });
          return;
        }
    
        const filename = `finance_report_${new Date().toISOString().split('T')[0]}`;
        
        if (format === 'csv') {
          const csv = Papa.unparse(dataToExport.map(({id, user_id, ...rest}) => rest));
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `${filename}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (format === 'pdf') {
          const doc = new jsPDF();
          doc.text("Financial Report", 10, 10);
          doc.autoTable({
            head: [['Date', 'Type', 'Description', 'Category', 'Amount']],
            body: dataToExport.map(t => [t.transaction_date, t.type, t.description, t.category || 'N/A', `${preferredCurrency} ${t.amount}`]),
          });
          doc.save(`${filename}.pdf`);
        } else if (format === 'html') {
          const tableHtml = `
            <html>
              <head><title>Financial Report</title><style>table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}</style></head>
              <body>
                <h1>Financial Report</h1>
                <table border="1">
                  <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
                  <tbody>
                    ${dataToExport.map(t => `<tr><td>${t.transaction_date}</td><td>${t.type}</td><td>${t.description}</td><td>${t.category || 'N/A'}</td><td>${preferredCurrency} ${t.amount}</td></tr>`).join('')}
                  </tbody>
                </table>
              </body>
            </html>`;
          const blob = new Blob([tableHtml], { type: 'text/html' });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `${filename}.html`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Export Financial Report</DialogTitle>
                <DialogDescription>Select filters for your report.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="date-from">From</Label>
                    <Input id="date-from" type="date" value={exportFilters.dateFrom} onChange={(e) => setExportFilters(f => ({...f, dateFrom: e.target.value}))} />
                </div>
                <div>
                    <Label htmlFor="date-to">To</Label>
                    <Input id="date-to" type="date" value={exportFilters.dateTo} onChange={(e) => setExportFilters(f => ({...f, dateTo: e.target.value}))} />
                </div>
                </div>
                <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select value={exportFilters.category} onValueChange={(v) => setExportFilters(f => ({...f, category: v}))}>
                    <SelectTrigger id="category-filter"><SelectValue /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => handleExport('pdf')}>PDF</Button>
                <Button variant="outline" onClick={() => handleExport('csv')}>CSV</Button>
                <Button variant="outline" onClick={() => handleExport('html')}>HTML</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default FinanceSettingsModal;