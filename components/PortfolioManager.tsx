
import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, RefreshCw, Link as LinkIcon, CheckCircle, ShieldCheck } from 'lucide-react';
import { PortfolioItem } from '../types';

// Dummy data for simulation
const MOCK_PORTFOLIO: PortfolioItem[] = [
  { asset: 'USDT', amount: 4500, valueUsd: 4500, color: '#26A17B' },
  { asset: 'BTC', amount: 0.085, valueUsd: 5440, color: '#F7931A' },
  { asset: 'ETH', amount: 0.8, valueUsd: 2400, color: '#627EEA' },
  { asset: 'SOL', amount: 15, valueUsd: 2100, color: '#14F195' },
];

export const PortfolioManager: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    // Simulate API delay
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2500);
  };

  const totalValue = MOCK_PORTFOLIO.reduce((acc, item) => acc + item.valueUsd, 0);

  if (!connected) {
    return (
      <div className="bg-crypto-card border border-slate-700 p-6 rounded-xl shadow-lg h-full flex flex-col justify-center items-center text-center">
        <div className="bg-slate-800 p-4 rounded-full mb-4">
          <Wallet size={32} className="text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Підключити Біржу</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-xs">
          Підключіть Binance або Bybit для автоматичного трекінгу портфеля та аналізу активів через AI.
        </p>
        
        <div className="space-y-3 w-full max-w-xs">
          <button 
            onClick={handleConnect}
            disabled={connecting}
            className="w-full bg-[#FCD535] hover:bg-[#F0B90B] text-black font-bold py-3 rounded-lg flex items-center justify-center gap-3 transition-all"
          >
            {connecting ? <RefreshCw className="animate-spin" /> : <LinkIcon size={18} />}
            {connecting ? 'Підключення...' : 'Підключити Binance'}
          </button>
          
          <button 
            onClick={handleConnect}
            disabled={connecting}
            className="w-full bg-[#17181e] hover:bg-[#2b2f36] border border-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-3 transition-all"
          >
             {connecting ? <RefreshCw className="animate-spin" /> : <LinkIcon size={18} />}
             {connecting ? 'Підключення...' : 'Підключити Bybit'}
          </button>
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={12} className="text-emerald-500" /> Read-only API keys supported
        </div>
      </div>
    );
  }

  return (
    <div className="bg-crypto-card border border-slate-700 p-6 rounded-xl shadow-lg h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Wallet className="text-blue-400" size={20} /> Мій Портфель
        </h3>
        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20 flex items-center gap-1">
          <CheckCircle size={12} /> Connected
        </span>
      </div>

      <div className="flex items-end gap-2 mb-6">
        <span className="text-3xl font-bold text-white">${totalValue.toLocaleString()}</span>
        <span className="text-sm text-emerald-400 mb-1 font-medium">+12.5% (24h)</span>
      </div>

      <div className="h-48 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={MOCK_PORTFOLIO}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="valueUsd"
            >
              {MOCK_PORTFOLIO.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
               formatter={(value: number) => `$${value.toLocaleString()}`}
               contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9'}}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <span className="text-xs text-slate-400 font-mono">ASSETS</span>
        </div>
      </div>

      <div className="space-y-3 mt-4 overflow-y-auto max-h-40 scrollbar-thin scrollbar-thumb-slate-700 pr-2">
        {MOCK_PORTFOLIO.map((item) => (
          <div key={item.asset} className="flex justify-between items-center p-2 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-medium text-slate-200">{item.asset}</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-white font-medium">${item.valueUsd.toLocaleString()}</div>
              <div className="text-xs text-slate-500">{item.amount} {item.asset}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
