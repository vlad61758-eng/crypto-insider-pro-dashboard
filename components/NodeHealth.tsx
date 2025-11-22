
import React, { useEffect, useState } from 'react';
import { Wifi, Activity, Server } from 'lucide-react';
import { NodeStatus, Language } from '../types';
import { translations } from '../translations';

const INITIAL_NODES: NodeStatus[] = [
    { name: 'Bitcoin Core (Mainnet)', latency: 45, status: 'Operational', blockHeight: 834501 },
    { name: 'Ethereum Geth (RPC)', latency: 120, status: 'Congested', blockHeight: 19405022 },
    { name: 'Solana (Beta Mainnet)', latency: 24, status: 'Operational', blockHeight: 245001005 },
    { name: 'Binance Smart Chain', latency: 32, status: 'Operational', blockHeight: 36882110 },
];

interface NodeHealthProps {
    lang: Language;
}

export const NodeHealth: React.FC<NodeHealthProps> = ({ lang }) => {
    const [nodes, setNodes] = useState<NodeStatus[]>(INITIAL_NODES);
    const t = translations[lang];

    // Simulate real-time fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setNodes(prev => prev.map(node => {
                // Randomize latency slightly
                const jitter = Math.floor(Math.random() * 20) - 10;
                let newLatency = Math.max(5, node.latency + jitter);
                
                // Simulate block height growth
                const newBlock = Math.random() > 0.7 ? node.blockHeight + 1 : node.blockHeight;

                return { ...node, latency: newLatency, blockHeight: newBlock };
            }));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-crypto-card border border-slate-700 p-4 rounded-xl shadow-lg">
            <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Server size={14} /> {t.nodeStatus}
            </h3>
            <div className="space-y-3">
                {nodes.map((node) => (
                    <div key={node.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'Operational' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-slate-300 font-medium">{node.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 font-mono">
                            <span className="hidden sm:inline">#{node.blockHeight}</span>
                            <span className={`flex items-center gap-1 ${node.latency < 100 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                <Wifi size={10} /> {node.latency}ms
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
