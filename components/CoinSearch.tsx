
import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { searchCoinDetails } from '../services/geminiService';
import { CoinDetails, Language } from '../types';
import { clsx } from 'clsx';
import { translations } from '../translations';

interface CoinSearchProps {
  lang: Language;
}

export const CoinSearch: React.FC<CoinSearchProps> = ({ lang }) => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<CoinDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = translations[lang];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const result = await searchCoinDetails(query, lang);
      if (result) {
        setData(result);
      } else {
        setError(t.errorSearch);
      }
    } catch (err) {
      setError(t.errorSearch);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-crypto-card border border-slate-700 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Search size={24} className="text-purple-400" /> 
        {lang === 'ru' ? 'Анализ монеты' : 'Coin Analysis'}
      </h3>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
        />
        <button 
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {loading ? t.searching : t.searchBtn}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg mb-4">
          {error}
        </div>
      )}

      {data && (
        <div className="animate-fade-in">
          {/* Header Info */}
          <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-white">{data.name}</h2>
                <span className="px-2 py-1 bg-slate-800 rounded text-sm text-slate-400">{data.symbol}</span>
              </div>
              <p className="text-slate-400 mt-1 text-sm max-w-md">{data.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{data.price}</div>
              <div className={clsx(
                "flex items-center justify-end gap-1 font-medium",
                data.trend === 'up' ? "text-emerald-400" : "text-rose-400"
              )}>
                {data.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {data.change24h}
              </div>
              {data.marketCap && (
                <div className="flex items-center justify-end gap-1.5 text-slate-400 text-sm mt-2">
                    <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                        <DollarSign size={14} className="text-emerald-500" />
                        <span className="font-medium text-slate-300">MCap: {data.marketCap}</span>
                    </div>
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 bg-slate-900/50 rounded-xl p-4 border border-slate-800">
             <h4 className="text-xs text-slate-500 mb-2 uppercase font-semibold tracking-wider">7 Day History</h4>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data.history}>
                 <defs>
                   <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor={data.trend === 'up' ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                     <stop offset="95%" stopColor={data.trend === 'up' ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                 <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    tick={{fontSize: 10}} 
                    tickLine={false}
                    axisLine={false}
                 />
                 <YAxis 
                    stroke="#64748b" 
                    tick={{fontSize: 10}} 
                    domain={['auto', 'auto']} 
                    tickFormatter={(val) => `$${val}`}
                    width={60}
                    tickLine={false}
                    axisLine={false}
                 />
                 <Tooltip 
                    contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9'}}
                    itemStyle={{color: '#fff'}}
                 />
                 <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={data.trend === 'up' ? "#10b981" : "#ef4444"} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    strokeWidth={2}
                 />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
