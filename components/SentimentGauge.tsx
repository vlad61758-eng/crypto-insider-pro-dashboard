import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Language, NewsItem } from '../types';
import { translations } from '../translations';
import { ExternalLink, TrendingUp, Newspaper, Info, Loader2 } from 'lucide-react';

interface SentimentGaugeProps {
  score: number;
  summary: string;
  topNews: NewsItem[];
  lang: Language;
}

export const SentimentGauge: React.FC<SentimentGaugeProps> = ({ score, summary, topNews, lang }) => {
  const t = translations[lang];
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  let color = '#94a3b8'; // neutral
  let label = t.neutral;
  
  if (score < 25) { color = '#ef4444'; label = t.extremeFear; }
  else if (score < 45) { color = '#f97316'; label = t.fear; }
  else if (score > 75) { color = '#10b981'; label = t.extremeGreed; }
  else if (score > 55) { color = '#84cc16'; label = t.greed; }

  return (
    <div className="bg-crypto-card border border-slate-700 rounded-xl shadow-lg flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
         <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <TrendingUp size={16} className="text-blue-400" /> {t.marketNews}
         </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Top Section: Side-by-Side Layout to save height but keep text readable */}
        <div className="flex flex-row items-center gap-4 bg-slate-900/30 p-3 rounded-lg border border-slate-800/50">
            {/* Chart Left */}
            <div className="relative w-20 h-20 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                    >
                    <Cell key="cell-0" fill={color} />
                    <Cell key="cell-1" fill="#334155" />
                    </Pie>
                    <Tooltip />
                </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                   <span className="text-lg font-bold text-white">{score}</span>
                </div>
            </div>
            
            {/* Text Right - Normal readable size */}
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                   <p className="text-sm font-bold" style={{ color }}>{label}</p>
                   <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-800 rounded">AI Score</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                    {summary}
                </p>
            </div>
        </div>

        {/* Bottom Section: News List */}
        <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                <Newspaper size={12} /> {t.topHeadlines}
            </h4>
            <div className="space-y-2">
                {topNews.slice(0, 2).map((news, idx) => (
                    <a 
                        key={idx} 
                        href={news.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="block group bg-slate-900/50 p-3 rounded border border-slate-800 hover:border-blue-500/30 transition-colors"
                    >
                        <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-medium text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-2">
                                {news.title}
                            </span>
                            <ExternalLink size={12} className="text-slate-600 group-hover:text-blue-400 mt-0.5 flex-shrink-0" />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] text-slate-500">{news.source}</span>
                        </div>
                    </a>
                ))}
                {topNews.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-500 italic flex flex-col items-center gap-2">
                         <Loader2 className="animate-spin text-slate-600" size={16} />
                         Waiting for data stream...
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};