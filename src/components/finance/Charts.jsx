import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { currencies, CHART_COLORS } from '@/lib/finance';

const Charts = ({ transactions, currency }) => {
    const currencySymbol = currencies.find(c => c.value === currency)?.label.split(' ')[0] || '$';

    const expenseData = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
        const existing = acc.find(i => i.name === t.category);
        if (existing) existing.value += parseFloat(t.amount);
        else acc.push({ name: t.category, value: parseFloat(t.amount) });
        return acc;
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-4 md:p-6">
              <h3 className="font-display text-lg font-bold text-glow mb-4">Expense Breakdown</h3>
              {expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => `${currencySymbol}${value.toFixed(2)}`} contentStyle={{ backgroundColor: 'rgba(23, 23, 25, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
                    </PieChart>
                </ResponsiveContainer>
              ) : <p className='text-center text-muted-foreground py-16'>No expense data to display.</p>}
          </div>
          <div className="glass-card p-4 md:p-6">
              <h3 className="font-display text-lg font-bold text-glow mb-4">Recent Transactions</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto smooth-scrollbar pr-2">
                  {transactions.slice(0, 10).map(t => (
                      <div key={t.id} className="flex justify-between items-center bg-background/50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                              {t.type === 'income' ? <div className="text-green-500">▲</div> : <div className="text-red-500">▼</div>}
                              <div>
                                  <p className="text-sm md:text-base">{t.description}</p>
                                  <p className="text-xs text-muted-foreground">{t.category} - {new Date(t.transaction_date).toLocaleDateString()}</p>
                              </div>
                          </div>
                          <p className={`font-bold text-sm md:text-base ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{currencySymbol}{parseFloat(t.amount).toFixed(2)}</p>
                      </div>
                  ))}
                  {transactions.length === 0 && <p className='text-center text-muted-foreground py-16'>No transactions yet.</p>}
              </div>
          </div>
      </div>
    );
};

export default Charts;