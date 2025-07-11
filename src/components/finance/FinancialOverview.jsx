import React from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { currencies } from '@/lib/finance';

const FinancialOverview = ({ totalIncome, totalExpense, currency }) => {
    const currencySymbol = currencies.find(c => c.value === currency)?.label.split(' ')[0] || '$';

    return (
        <section>
          <h2 className="font-display text-xl md:text-2xl font-bold text-glow mb-4">📊 Financial Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="glass-card p-4 md:p-6 flex items-center justify-between"><div className="flex items-center gap-3"><ArrowUpCircle className="text-green-400" size={32}/><p className="text-sm md:text-base">Total Income</p></div><p className="text-xl md:text-2xl font-bold text-glow">{currencySymbol}{totalIncome.toFixed(2)}</p></div>
            <div className="glass-card p-4 md:p-6 flex items-center justify-between"><div className="flex items-center gap-3"><ArrowDownCircle className="text-red-400" size={32}/><p className="text-sm md:text-base">Total Expenses</p></div><p className="text-xl md:text-2xl font-bold text-glow">{currencySymbol}{totalExpense.toFixed(2)}</p></div>
            <div className="glass-card p-4 md:p-6 flex items-center justify-between"><div className="flex items-center gap-3"><p className="text-sm md:text-base">Balance</p></div><p className="text-xl md:text-2xl font-bold text-glow">{currencySymbol}{(totalIncome - totalExpense).toFixed(2)}</p></div>
          </div>
      </section>
    )
};

export default FinancialOverview;