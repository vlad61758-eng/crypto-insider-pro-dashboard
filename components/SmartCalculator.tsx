
import React, { useState } from 'react';
import { Calculator, PieChart as PieIcon, CheckCircle, DollarSign, Loader2, TrendingUp, BookOpen, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { generateInvestmentPlan } from '../services/geminiService';
import { InvestmentPlan, Language } from '../types';
import { clsx } from 'clsx';
import { translations } from '../translations';

interface SmartCalculatorProps {
    lang: Language;
}

export const SmartCalculator: React.FC<SmartCalculatorProps> = ({ lang }) => {
  const [budget, setBudget] = useState<string>('1000');
  const [plan, setPlan] = useState<InvestmentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  const handleCalculate = async () => {
    const amount = parseFloat(budget);
    if (isNaN(amount) || amount <= 0) return;

    setLoading(true);
    setPlan(null);
    try {
      const result = await generateInvestmentPlan(amount, lang);
      setPlan(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-crypto-card border border-slate-700 rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
         <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Calculator size={16} className="text-blue-400" /> {t.smartCalc}
         </h3>
      </div>

      <div className="p-4">
        {/* Input Section */}
        <div className="mb-4">
            <label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold">{t.calcBudget}</label>
            <div className="flex gap-2 h-10">
                <div className="relative flex-1">
                    <DollarSign className="absolute left-2 top-2.5 text-slate-500" size={14} />
                    <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full h-full bg-slate-900 border border-slate-700 rounded text-white font-bold text-sm pl-7 pr-2 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>
                <button
                    onClick={handleCalculate}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-4 rounded transition-all flex items-center gap-2 text-sm"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <PieIcon size={16} />}
                    {loading ? '' : t.calculate}
                </button>
            </div>
        </div>

        {/* Results Section */}
        {plan ? (
            <div className="animate-fade-in">
                {/* Split View: Chart Left, Summary Right */}
                <div className="flex flex-row items-center gap-3 mb-3 bg-slate-900/30 p-2 rounded border border-slate-800/50">
                    {/* Mini Chart */}
                    <div className="h-20 w-20 flex-shrink-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                            data={plan.allocations}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={38}
                            paddingAngle={2}
                            dataKey="amount"
                            nameKey="coin"
                            stroke="none"
                            >
                            {plan.allocations.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => `$${value}`}
                                contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9', fontSize: '10px'}}
                            />
                        </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <span className="text-[10px] font-bold text-slate-500">${plan.totalBudget}</span>
                        </div>
                    </div>

                    {/* Compact Summary */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-emerald-400 text-[10px] font-bold uppercase mb-0.5 flex items-center gap-1">
                            <TrendingUp size={10}/> {t.strategy}
                        </h4>
                        <p className="text-xs text-slate-300 leading-snug line-clamp-3 italic">
                            "{plan.strategySummary}"
                        </p>
                    </div>
                </div>

                {/* Scrollable List with fixed height */}
                <div className="space-y-2 overflow-y-auto max-h-[140px] pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                    {plan.allocations.map((item, idx) => (
                        <div key={idx} className="bg-slate-900/50 border border-slate-800 p-2 rounded hover:border-slate-600 transition-colors flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                                    <span className="font-bold text-white text-xs">{item.coin}</span>
                                </div>
                                <span className={clsx(
                                    "text-[9px] px-1 rounded border mt-0.5 inline-block",
                                    item.riskLevel === 'Low' ? "bg-emerald-900/30 text-emerald-400 border-emerald-500/30" :
                                    item.riskLevel === 'Medium' ? "bg-yellow-900/30 text-yellow-400 border-yellow-500/30" :
                                    "bg-rose-900/30 text-rose-400 border-rose-500/30"
                                )}>
                                    {item.riskLevel}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-emerald-400 text-xs">${item.amount}</div>
                                <div className="text-slate-500 text-[10px]">{item.percentage}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            /* Empty State Content - Condensed */
            <div className="animate-fade-in space-y-3">
               <div className="bg-slate-900/50 rounded p-3 border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                     <BookOpen size={14} className="text-blue-400"/>
                     {lang === 'ru' ? 'Правила Инвестора' : 'Investor Rules'}
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                     <li className="flex gap-2 items-start">
                        <span className="text-blue-500">•</span>
                        {lang === 'ru' ? 'Не кладите все яйца в одну корзину.' : 'Don\'t put all eggs in one basket.'}
                     </li>
                     <li className="flex gap-2 items-start">
                        <span className="text-blue-500">•</span>
                        {lang === 'ru' ? 'Покупайте частями (DCA).' : 'Buy in parts (DCA).'}
                     </li>
                  </ul>
               </div>

               <div className="bg-slate-900/50 rounded p-3 border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <ShieldAlert size={14} className="text-yellow-400"/> Types
                    </h4>
                  </div>
                  
                  <div className="space-y-2">
                     <div className="flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-medium">Safe</span>
                        <div className="w-24 bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{width: '80%'}}></div>
                        </div>
                     </div>
                     <div className="flex items-center justify-between text-[10px]">
                        <span className="text-rose-400 font-medium">Degen</span>
                        <div className="w-24 bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-rose-500 h-full" style={{width: '90%'}}></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
        )}
      </div>
    </div>
  );
};
