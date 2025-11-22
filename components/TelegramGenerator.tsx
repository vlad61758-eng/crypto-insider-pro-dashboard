
import React, { useState } from 'react';
import { Send, Copy, RefreshCw, Loader2, Image as ImageIcon, Download, Zap } from 'lucide-react';
import { generateTelegramPost } from '../services/geminiService';
import { GeneratedPost, CoinData, MarketSentiment, Language } from '../types';
import { translations } from '../translations';

interface TelegramGeneratorProps {
  marketData: CoinData[];
  sentiment: MarketSentiment | null;
  lang: Language;
}

export const TelegramGenerator: React.FC<TelegramGeneratorProps> = ({ marketData, sentiment, lang }) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional'); // professional, hype, urgent
  const [includeImage, setIncludeImage] = useState(false);
  const [generated, setGenerated] = useState<GeneratedPost | null>(null);
  const [loading, setLoading] = useState(false);

  const t = translations[lang];

  const handleGenerate = async (customTopic?: string, customContext?: string) => {
    const topicToUse = customTopic || topic;
    if (!topicToUse) return;

    setLoading(true);
    setGenerated(null);
    try {
      const result = await generateTelegramPost(topicToUse, tone, includeImage, lang, customContext);
      setGenerated(result);
      if (customTopic) setTopic(customTopic);
    } catch (e) {
      alert("Failed to generate post. Check API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerate = () => {
    if (marketData.length === 0) {
        alert(lang === 'ru' ? "Сначала загрузите данные рынка." : "Load market data first.");
        return;
    }

    const topCoin = marketData[0]; // usually BTC
    const context = `
      Market Data: ${JSON.stringify(marketData)}
      Sentiment: ${sentiment ? JSON.stringify(sentiment) : "Neutral"}
    `;
    
    const prompt = lang === 'ru' 
        ? `Ежедневный обзор рынка. BTC: ${topCoin.price}, Тренд: ${sentiment?.score || 50}/100.`
        : `Daily market overview. BTC: ${topCoin.price}, Trend: ${sentiment?.score || 50}/100.`;
    
    handleGenerate(prompt, context);
  };

  const copyToClipboard = () => {
    if (!generated) return;
    const fullText = `${generated.content}\n\n${generated.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    alert(lang === 'ru' ? "Текст скопирован!" : "Text copied!");
  };

  const downloadImage = () => {
    if (!generated?.imageUrl) return;
    const link = document.createElement('a');
    link.href = generated.imageUrl;
    link.download = 'crypto-chart.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-crypto-card border border-slate-700 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Send size={24} className="text-blue-400" /> 
        {t.teleGenerator}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">{t.topicPlaceholder.split(' ')[0]}</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t.topicPlaceholder}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex gap-4">
            <div className="flex-1">
            <label className="block text-sm font-medium text-slate-400 mb-1">{t.tone}</label>
            <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
                <option value="professional">{t.toneProf}</option>
                <option value="hype">{t.toneHype}</option>
                <option value="bearish">{t.toneBear}</option>
                <option value="educational">{t.toneEdu}</option>
            </select>
            </div>
        </div>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIncludeImage(!includeImage)}>
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeImage ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`}>
                {includeImage && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
            </div>
            <label className="text-sm text-slate-300 cursor-pointer select-none flex items-center gap-2">
                <ImageIcon size={16} /> {t.genChart}
            </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button
                onClick={() => handleGenerate()}
                disabled={loading || !topic}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
                {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
                {loading ? t.generating : t.createPost}
            </button>

            <button
                onClick={handleAutoGenerate}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all border border-emerald-500/20"
            >
                <Zap size={18} className={loading ? "animate-pulse" : ""} />
                {t.autoReport}
            </button>
        </div>
      </div>

      {generated && (
        <div className="mt-6 bg-slate-900 rounded-lg p-4 border border-slate-700 animate-fade-in space-y-4">
            {/* Image Preview */}
            {generated.imageUrl && (
                <div className="relative group">
                    <img 
                        src={generated.imageUrl} 
                        alt="AI Generated Chart" 
                        className="w-full rounded-lg border border-slate-800"
                    />
                    <button 
                        onClick={downloadImage}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title={t.downloadImg}
                    >
                        <Download size={16} />
                    </button>
                </div>
            )}

          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm">
            {generated.content}
          </div>
          <div className="flex flex-wrap gap-2">
            {generated.hashtags.map((tag, i) => (
              <span key={i} className="text-blue-400 text-xs bg-blue-900/30 px-2 py-1 rounded">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
          <button
            onClick={copyToClipboard}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Copy size={16} /> {t.copyText}
          </button>
        </div>
      )}
    </div>
  );
};
