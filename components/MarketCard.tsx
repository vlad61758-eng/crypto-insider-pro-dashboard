import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CoinData } from '../types';
import { clsx } from 'clsx';

interface MarketCardProps {
  data: CoinData;
}

export const MarketCard: React.FC<MarketCardProps> = ({ data }) => {
  const isUp = data.trend === 'up';
  const isDown = data.trend === 'down';

  return (
    <div className="bg-crypto-card border border-slate-700 p-4 rounded-xl shadow-lg hover:border-crypto-accent transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-bold text-white">{data.symbol}</h3>
          <p className="text-xs text-slate-400">{data.name}</p>
        </div>
        <div className={clsx(
          "p-2 rounded-full bg-opacity-20",
          isUp ? "bg-emerald-500 text-emerald-400" : isDown ? "bg-rose-500 text-rose-400" : "bg-slate-500 text-slate-400"
        )}>
          {isUp ? <TrendingUp size={20} /> : isDown ? <TrendingDown size={20} /> : <Minus size={20} />}
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-white">{data.price}</span>
      </div>
      <div className={clsx(
        "text-sm font-medium mt-1 flex items-center",
        isUp ? "text-emerald-400" : isDown ? "text-rose-400" : "text-slate-400"
      )}>
        {data.change24h} (24h)
      </div>
    </div>
  );
};
