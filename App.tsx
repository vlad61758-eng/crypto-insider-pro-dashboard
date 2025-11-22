
import React, { useEffect, useState } from 'react';
import { LayoutDashboard, RefreshCcw, Activity, Globe, Key, Lock, Shield, AlertCircle, Languages } from 'lucide-react';
import { MarketCard } from './components/MarketCard';
import { SentimentGauge } from './components/SentimentGauge';
import { TelegramGenerator } from './components/TelegramGenerator';
import { CoinSearch } from './components/CoinSearch';
import { InvestmentAdvisor } from './components/InvestmentAdvisor';
import { SmartCalculator } from './components/SmartCalculator';
import { WhaleScanner } from './components/WhaleScanner';
import { NodeHealth } from './components/NodeHealth';
import { fetchMarketOverview, fetchMarketSentiment } from './services/geminiService';
import { CoinData, MarketSentiment, Language } from './types';
import { translations } from './translations';

const App: React.FC = () => {
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
  const [loading, setLoading] = useState(false);
  const [isKeySet, setIsKeySet] = useState(false);
  const [manualKey, setManualKey] = useState('');
  const [lang, setLang] = useState<Language>('en');

  const t = translations[lang];

  // Check if API Key is selected on mount or in local storage
  useEffect(() => {
    const checkKey = async () => {
      // 1. Check Google IDX / AI Studio Env
      const aistudio = (window as any).aistudio;
      if (aistudio && await aistudio.hasSelectedApiKey()) {
        setIsKeySet(true);
        fetchData(lang);
        return;
      }

      // 2. Check Manual Key (Netlify/Deployment support)
      const localKey = localStorage.getItem('GEMINI_API_KEY');
      if (localKey) {
        setIsKeySet(true);
        fetchData(lang);
      }
    };
    checkKey();
  }, []);

  const handleConnect = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        await aistudio.openSelectKey();
        setIsKeySet(true);
        fetchData(lang);
      } else {
        alert("Environment does not support auto-connect. Enter key manually.");
      }
    } catch (error) {
      console.error("Key selection failed", error);
    }
  };

  const handleManualKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualKey.trim().length > 10) {
        localStorage.setItem('GEMINI_API_KEY', manualKey.trim());
        setIsKeySet(true);
        fetchData(lang);
    } else {
        alert(t.errorKey);
    }
  };

  const fetchData = async (currentLang: Language) => {
    setLoading(true);
    try {
      // Execute in parallel
      const [coins, sent] = await Promise.all([
        fetchMarketOverview(),
        fetchMarketSentiment(currentLang)
      ]);
      setMarketData(coins);
      setSentiment(sent);
    } catch (error) {
      console.error("Init failed", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ru' : 'en';
    setLang(newLang);
    // Refresh sentiment in new language
    if (isKeySet) {
        setLoading(true);
        fetchMarketSentiment(newLang).then(sent => {
            setSentiment(sent);
            setLoading(false);
        });
    }
  };

  // Auth Screen (If no key is selected)
  if (!isKeySet) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center p-4 relative">
        <button 
          onClick={toggleLanguage}
          className="absolute top-4 right-4 flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-full border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          <Languages size={16} />
          <span className="uppercase font-bold text-xs">{lang}</span>
        </button>

        <div className="max-w-md w-full bg-crypto-card border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-blue-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t.authTitle}</h1>
          <p className="text-slate-400 mb-8">
            {t.authDesc}
          </p>
          
          {/* Auto Connect Button (IDX) */}
          <button 
            onClick={handleConnect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] mb-4"
          >
            <Key size={20} />
            {t.autoConnect}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase">{t.authManual}</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          {/* Manual Input (Netlify Support) */}
          <form onSubmit={handleManualKeySubmit} className="mt-4">
             <input 
                type="password" 
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                placeholder="Gemini API Key..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none mb-3 text-center"
             />
             <button 
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
             >
                {t.manualKey}
             </button>
          </form>

          <p className="mt-6 text-xs text-slate-500">
            {t.authNoKey} <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-400 underline hover:text-blue-300">{t.authGet}</a>.
          </p>
        </div>
      </div>
    );
  }

  // Main Dashboard (If key is present)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2">
              <Shield className="text-emerald-500" size={24} />
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent hidden sm:inline">
                {t.appTitle}
              </span>
              <span className="text-lg font-bold text-white sm:hidden">CIP</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-700"
                title="Switch Language"
              >
                <Languages size={14} />
                <span className="uppercase">{lang}</span>
              </button>

              <button 
                onClick={() => fetchData(lang)}
                disabled={loading}
                className="p-1.5 hover:bg-slate-800 rounded-full transition-colors"
                title={t.refresh}
              >
                <RefreshCcw size={18} className={loading ? "animate-spin text-blue-400" : "text-slate-400"} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          
          {/* Left Column: Market Data, Charts, Scanner (Span 8) */}
          <div className="lg:col-span-8 space-y-3">
            
            {/* Node Status Row */}
            <NodeHealth lang={lang} />

            {/* Ticker Row */}
            <section>
                <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Globe size={16} className="text-emerald-400"/> {t.liveMarket}
                </h2>
                {loading && marketData.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-pulse">
                        {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-slate-800 rounded-xl"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {marketData.map((coin) => (
                            <MarketCard key={coin.symbol} data={coin} />
                        ))}
                    </div>
                )}
            </section>

            {/* Whale Scanner & Search */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <CoinSearch lang={lang} />
                     <WhaleScanner lang={lang} />
                </div>
            </section>

            {/* AI Investment Chat Advisor */}
            <section>
               <InvestmentAdvisor lang={lang} />
            </section>
          </div>

          {/* Right Column: Tools & Portfolio (Span 4) */}
          <div className="lg:col-span-4 space-y-3">
             
             {/* Smart Calculator - Now with auto height */}
             <section>
                <SmartCalculator lang={lang} />
             </section>

             {/* Telegram Generator */}
             <TelegramGenerator marketData={marketData} sentiment={sentiment} lang={lang} />

             {/* Compact Sentiment & News Gauge */}
             <section>
                {sentiment ? (
                    <SentimentGauge 
                        score={sentiment.score} 
                        summary={sentiment.summary} 
                        topNews={sentiment.topNews}
                        lang={lang} 
                    />
                ) : (
                    <div className="h-24 bg-crypto-card border border-slate-700 rounded-xl flex items-center justify-center text-slate-500 text-xs">
                       {loading ? t.calculating : t.neutral}
                    </div>
                )}
             </section>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
