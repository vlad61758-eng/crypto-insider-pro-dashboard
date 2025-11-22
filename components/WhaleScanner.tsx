
import React, { useState, useEffect } from 'react';
import { Terminal, Lock, ShieldAlert } from 'lucide-react';
import { analyzeWalletAddress } from '../services/geminiService';
import { WalletAnalysis, Language } from '../types';
import { clsx } from 'clsx';
import { translations } from '../translations';

interface WhaleScannerProps {
    lang: Language;
}

export const WhaleScanner: React.FC<WhaleScannerProps> = ({ lang }) => {
  const [address, setAddress] = useState('');
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<WalletAnalysis | null>(null);
  const t = translations[lang];

  // Initial background "noise" logs to make it look alive
  useEffect(() => {
     setLogs([
         "> System initialized...",
         "> Connected to ETH Mainnet Node [RPC-1]",
         "> Listening to Mempool...",
         "> Monitoring large transactions > 100 ETH"
     ]);
  }, []);

  const addLog = (text: string) => {
    setLogs(prev => {
        const newLogs = [...prev, `> ${text}`];
        if (newLogs.length > 10) return newLogs.slice(newLogs.length - 10);
        return newLogs;
    });
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setScanning(true);
    setResult(null);
    setLogs(prev => [`> Initiating scan for: ${address.substring(0, 8)}...`, ...prev]);
    setLogs([`> Target acquired: ${address}`]);

    // Simulate technical connection sequence
    setTimeout(() => addLog(`Resolving ENS signature...`), 400);
    setTimeout(() => addLog(`Parsing transaction history (Layer 1)...`), 1000);
    setTimeout(() => addLog(`Cross-referencing CEX hot wallets...`), 1800);
    
    try {
      const data = await analyzeWalletAddress(address, lang);
      
      setTimeout(() => {
        setResult(data);
        setScanning(false);
        addLog(`Analysis complete. Report generated.`);
      }, 2500);
      
    } catch (err) {
      addLog(`ERROR: Connection terminated.`);
      setScanning(false);
    }
  };

  return (
    <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.1)] font-mono h-full flex flex-col min-h-[320px]">
      <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
          <Terminal size={16} />
          {t.walletAnalysis}
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {t.liveConnection}
        </div>
      </div>

      <form onSubmit={handleScan} className="mb-3">
        <div className="flex gap-0 border border-emerald-500/30 rounded bg-black overflow-hidden">
          <div className="bg-slate-900 px-2 py-2 text-slate-400 border-r border-emerald-500/30 flex items-center">
             <Lock size={12} />
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="flex-1 bg-black px-2 py-1.5 text-emerald-400 placeholder-slate-700 outline-none text-xs"
            spellCheck={false}
          />
          <button 
            type="submit"
            disabled={scanning}
            className="bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 px-3 py-1.5 text-xs font-bold border-l border-emerald-500/30 transition-colors uppercase"
          >
            {scanning ? t.scanning : t.scan}
          </button>
        </div>
      </form>

      {/* Terminal Output Area */}
      <div className="flex-1 bg-black rounded border border-slate-800 p-3 overflow-y-auto text-[10px] font-mono flex flex-col">
        <div className="flex-1">
            {logs.map((log, idx) => (
            <div key={idx} className="text-emerald-600/80 mb-0.5">{log}</div>
            ))}
        </div>
        
        {result && (
          <div className="mt-2 animate-fade-in border-t border-emerald-500/20 pt-2">
             <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                    <span className="text-slate-500 block">NET:</span>
                    <span className="text-white">{result.network}</span>
                </div>
                <div>
                    <span className="text-slate-500 block">BAL:</span>
                    <span className="text-white">{result.balance}</span>
                </div>
                <div>
                    <span className="text-slate-500 block">RISK:</span>
                    <span className={clsx(
                        "font-bold",
                        result.riskScore < 30 ? "text-emerald-400" : result.riskScore < 70 ? "text-yellow-400" : "text-rose-500"
                    )}>{result.riskScore}/100</span>
                </div>
                <div>
                    <span className="text-slate-500 block">ACT:</span>
                    <span className="text-white">{result.activityLevel}</span>
                </div>
             </div>
             
             <div className="mb-2">
                <div className="flex flex-wrap gap-1">
                    {result.tags.map((tag, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] uppercase rounded">
                            {tag}
                        </span>
                    ))}
                </div>
             </div>

             <div className="bg-emerald-900/10 p-1.5 rounded border border-emerald-500/10">
                <p className="text-emerald-300/80 leading-relaxed">
                    {result.aiSummary}
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
