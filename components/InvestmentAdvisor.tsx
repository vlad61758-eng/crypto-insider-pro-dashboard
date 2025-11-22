
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, TrendingUp, AlertTriangle, Gem } from 'lucide-react';
import { getInvestmentAdvice } from '../services/geminiService';
import { ChatMessage, Language } from '../types';
import { clsx } from 'clsx';
import { translations } from '../translations';

interface InvestmentAdvisorProps {
  lang: Language;
}

export const InvestmentAdvisor: React.FC<InvestmentAdvisorProps> = ({ lang }) => {
  const t = translations[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      text: t.chatWelcome, 
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset welcome message when language changes
  useEffect(() => {
     setMessages(prev => {
         if (prev.length === 1 && prev[0].role === 'model') {
             return [{ role: 'model', text: t.chatWelcome, timestamp: Date.now() }];
         }
         return prev;
     })
  }, [lang, t.chatWelcome]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const prompt = text || input;
    if (!prompt.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: prompt, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await getInvestmentAdvice(messages, prompt, lang);
      const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { 
        label: lang === 'ru' ? 'Прогноз BTC' : 'BTC Forecast', 
        prompt: lang === 'ru' ? 'Дай прогноз по Bitcoin на ближайшую неделю на основе текущего рынка.' : 'Give me a Bitcoin forecast for this week based on current market.',
        icon: <TrendingUp size={14} className="text-emerald-400" />
    },
    { 
        label: lang === 'ru' ? 'Поиск Гемов' : 'Find Gems', 
        prompt: lang === 'ru' ? 'Найди недооцененные альткоины с высоким потенциалом.' : 'Find undervalued altcoins with high potential.',
        icon: <Gem size={14} className="text-blue-400" />
    },
    { 
        label: lang === 'ru' ? 'Риски Рынка' : 'Market Risks', 
        prompt: lang === 'ru' ? 'Какие главные риски на крипторынке сегодня?' : 'What are the main risks in the crypto market today?',
        icon: <AlertTriangle size={14} className="text-rose-400" />
    }
  ];

  return (
    <div className="bg-crypto-card border border-slate-700 rounded-xl shadow-lg flex flex-col h-[450px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-3 bg-slate-900/50 rounded-t-xl">
        <div className="p-1.5 bg-indigo-500/20 rounded-lg">
          <Bot className="text-indigo-400" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            {t.investmentAdvisor} <Sparkles size={12} className="text-yellow-400" />
          </h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">On-Chain AI Analysis</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((msg, idx) => (
          <div key={idx} className={clsx("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
            {msg.role === 'model' && (
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={12} className="text-white" />
              </div>
            )}
            <div className={clsx(
              "max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
              msg.role === 'user' 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
            )}>
              {msg.text}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                <User size={12} className="text-slate-300" />
              </div>
            )}
          </div>
        ))}
        {loading && (
           <div className="flex gap-3 justify-start animate-pulse">
             <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bot size={12} className="text-white" />
             </div>
             <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2 text-slate-400 text-xs">
                <Loader2 size={14} className="animate-spin" /> {t.calculating}
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Quick Actions */}
      <div className="p-3 border-t border-slate-700 bg-slate-900/30 rounded-b-xl space-y-2">
        {/* Quick Actions Chips */}
        {messages.length < 3 && !loading && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {quickActions.map((action, i) => (
                    <button
                        key={i}
                        onClick={() => handleSend(action.prompt)}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
                    >
                        {action.icon} {action.label}
                    </button>
                ))}
            </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chatPlaceholder}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
