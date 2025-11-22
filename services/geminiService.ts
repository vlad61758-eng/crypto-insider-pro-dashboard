
import { GoogleGenAI, Type } from "@google/genai";
import { CoinData, MarketSentiment, GeneratedPost, CoinDetails, ChatMessage, WalletAnalysis, InvestmentPlan, Language } from "../types";

// Helper to strip markdown code blocks if present
const cleanJson = (text: string): string => {
  if (!text) return "";
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const getLangInstruction = (lang: Language) => {
  return lang === 'ru' ? "Answer in Russian language." : "Answer in English language.";
};

/**
 * Fetches real-time crypto prices using Google Search Grounding.
 */
export const fetchMarketOverview = async (): Promise<CoinData[]> => {
  const apiKey = process.env.API_KEY || localStorage.getItem('GEMINI_API_KEY');
  if (!apiKey) throw new Error("API Key missing");
  
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Find the current real-time price (in USD) and 24h percentage change for:
    Bitcoin (BTC), Ethereum (ETH), Solana (SOL), Binance Coin (BNB), and Ripple (XRP).
    
    Return the data strictly in this JSON format (no markdown code blocks, just raw JSON):
    [
      {
        "symbol": "BTC",
        "name": "Bitcoin",
        "price": "$64,230",
        "change24h": "+2.4%",
        "trend": "up"
      }
    ]
    
    Rules:
    - "trend" must be "up", "down", or "neutral" based on the sign of the change.
    - Use the googleSearch tool to get the absolute latest data.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const cleanedText = cleanJson(text);
    return JSON.parse(cleanedText) as CoinData[];
  } catch (error) {
    console.error("Error fetching market data:", error);
    return [];
  }
};

/**
 * Search for specific coin details and history for charting
 */
export const searchCoinDetails = async (query: string, lang: Language): Promise<CoinDetails | null> => {
  const apiKey = process.env.API_KEY || localStorage.getItem('GEMINI_API_KEY');
  if (!apiKey) throw new Error("API Key missing");
  
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";

  const prompt = `
    Find detailed information about the cryptocurrency "${query}".
    1. Current Price (USD).
    2. 24h Change (%).
    3. Market Cap.
    4. Short description (1 sentence). ${getLangInstruction(lang)}
    5. Price history for the LAST 7 DAYS (closing price each day).
    
    Use Google Search to find real data.
    
    Return strictly in this JSON format:
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "price": "$65,000",
      "change24h": "+2%",
      "trend": "up",
      "marketCap": "$1.2T",
      "description": "Bitcoin is the first decentralized cryptocurrency...",
      "history": [
        {"date": "Day 1", "price": 60000},
        {"date": "Day 2", "price": 61000},
        ... (7 days total)
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) return null;
    const cleanedText = cleanJson(text);
    return JSON.parse(cleanedText) as CoinDetails;
  } catch (error) {
    console.error("Error searching coin:", error);
    return null;
  }
};

/**
 * Analyzes a crypto wallet address using Google Search to find its history/explorer data.
 */
export const analyzeWalletAddress = async (address: string, lang: Language): Promise<WalletAnalysis | null> => {
  const apiKey = process.env.API_KEY || localStorage.getItem('GEMINI_API_KEY');
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";

  const prompt = `
    Conduct a forensic analysis of this cryptocurrency wallet address: "${address}".
    Use Google Search to find this address on block explorers (Etherscan, BscScan, Solscan, etc.).
    
    Determine:
    1. Which network is it likely on?
    2. Estimate current balance if visible in search snippets (or state "Unknown").
    3. Is it an active wallet?
    4. Are there any known tags (e.g., "Binance Hot Wallet", "Hacker", "Vitalik Buterin", "Inactive")?
    
    ${getLangInstruction(lang)}
    
    Return strictly in this JSON format:
    {
      "address": "${address}",
      "network": "Ethereum (ERC20)",
      "balance": "$4,230.50 / 1.2 ETH",
      "activityLevel": "High",
      "riskScore": 20,
      "tags": ["Whale", "DeFi User"],
      "aiSummary": "This wallet has been active recently interacting with Uniswap..."
    }
    
    If no info is found, return a generic analysis based on the address format structure.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) return null;
    const cleanedText = cleanJson(text);
    return JSON.parse(cleanedText) as WalletAnalysis;
  } catch (error) {
    console.error("Wallet analysis failed:", error);
    return {
        address,
        network: "Unknown Network",
        balance: "Data Unavailable",
        activityLevel: "Low",
        riskScore: 50,
        tags: ["Unidentified"],
        aiSummary: lang === 'ru' 
          ? "Не удалось получить публичные данные. Возможно, это новый кошелек." 
          : "Could not retrieve public data. Might be a fresh wallet."
    };
  }
}

/**
 * Generates an intelligent investment plan based on budget and real-time market data.
 */
export const generateInvestmentPlan = async (budget: number, lang: Language): Promise<InvestmentPlan | null> => {
  const apiKey = process.env.API_KEY || localStorage.getItem('GEMINI_API_KEY');
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";

  const prompt = `
    You are a senior crypto portfolio manager. The user has a budget of $${budget}.
    Analyze the CURRENT market conditions using Google Search (look for "best crypto to buy now", "whale accumulation coins", "market sentiment").
    
    Create a diversified portfolio allocation plan for this budget.
    1. Mix: Include a safe layer (BTC/ETH), a growth layer (Top Altcoins like SOL, BNB), and maybe a small risk layer if market sentiment allows.
    2. Calculate the exact USD amount for each coin based on the ${budget}.
    3. Provide a specific reason for each choice based on CURRENT news/tech.
    4. Assign a hex color for each coin for a chart.
    
    ${getLangInstruction(lang)}
    
    Return strictly in this JSON format:
    {
      "totalBudget": ${budget},
      "strategySummary": "Given the current bullish sentiment...",
      "allocations": [
        {
          "coin": "Bitcoin (BTC)",
          "amount": 500,
          "percentage": 50,
          "reason": "Safe haven asset, strong support at 60k.",
          "riskLevel": "Low",
          "color": "#F7931A"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) return null;
    const cleanedText = cleanJson(text);
    return JSON.parse(cleanedText) as InvestmentPlan;
  } catch (error) {
    console.error("Investment plan generation failed:", error);
    return null;
  }
};

/**
 * Analyzes market sentiment and news.
 */
export const fetchMarketSentiment = async (lang: Language): Promise<MarketSentiment> => {
    const apiKey = process.env.API_KEY || localStorage.getItem('GEMINI_API_KEY');
    if (!apiKey) throw new Error("API Key missing");
    
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash";
    
    const prompt = `
      Analyze the current crypto market sentiment based on today's news.
      1. Provide a "Fear & Greed" score from 0 (Extreme Fear) to 100 (Extreme Greed).
      2. Write a 2-sentence summary about the market state. ${getLangInstruction(lang)}
      3. List 3 top trending news headlines with their source.
      
      Use Google Search to find the latest news.
      
      Return the result strictly in this JSON format:
      {
        "score": 75,
        "summary": "The market is growing...",
        "topNews": [
          { "title": "...", "url": "...", "source": "..." }
        ]
      }
    `;
  
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      
      const text = response.text;
      if (!text) throw new Error("No response text");
      
      const cleanedText = cleanJson(text);
      return JSON.parse(cleanedText) as MarketSentiment;
    } catch (error) {
      console.error("Error fetching sentiment:", error);
      return {
        score: 50,
        summary: lang === 'ru' ? "Нет данных" : "No data",
        topNews: []
      };
    }
  };

/**
 * Generates a stylized trading chart image.
 */
export const generateChartImage = async (topic: string): Promise<string | undefined> => {
  const apiKey = process.env.API_KEY || localStorage.getItem('GEMINI_API_KEY');
  if (!apiKey) return undefined;

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-image"; 

  const prompt = `
    A professional, high-tech cryptocurrency trading chart for "${topic}".
    Dark theme, neon green and red candles, technical indicators lines (RSI, MACD).
    The chart should look like a professional TradingView screenshot.
    No text overlay, just the chart interface.
    Aspect ratio 16:9.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Image generation failed:", error);
    return undefined;
  }
}

/**
 * Generates a Telegram post based on a topic.
 */
export const generateTelegramPost = async (
  topic: string, 
  tone: string, 
  includeImage: boolean,
  lang: Language,
  contextData?: string
): Promise<GeneratedPost> => {
  const apiKey = process.env.API_KEY || localStorage.getItem('GEMINI_API_KEY');
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";
  
  let prompt = `
    Write a HIGHLY ENGAGING Telegram post about: "${topic}".
    Tone: ${tone}.
    Language: ${lang === 'ru' ? 'Russian' : 'English'}.
    
    Structure requirements:
    1. Headline: Use ALL CAPS for key words and emojis. Make it 'clickbaity' but truthful.
    2. Body: Short sentences, bullet points.
    3. Key Data: If relevant, use bold text for prices (e.g., **$65,000**).
    4. Call to Action: Encourage users to react (🔥) or subscribe.
  `;

  if (contextData) {
    prompt += `\n\nUse this REAL-TIME MARKET DATA as the basis for the post:\n${contextData}`;
  } else {
    prompt += `\n\nUse Google Search (via 'tools') to find the latest info on this topic to make it accurate.`;
  }

  prompt += `\n\nReturn JSON with 'content' (string) and 'hashtags' (array of strings).`;

  try {
    // 1. Generate Text
    const textResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: contextData ? [] : [{ googleSearch: {} }], // Use search only if no context provided
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                content: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        }
      },
    });

    const textJson = JSON.parse(textResponse.text || "{}") as GeneratedPost;

    // 2. Generate Image (if requested)
    if (includeImage) {
      const imageUrl = await generateChartImage(topic);
      if (imageUrl) {
        textJson.imageUrl = imageUrl;
      }
    }

    return textJson;
  } catch (error) {
    console.error("Error generating post:", error);
    throw error;
  }
};

/**
 * Interactive Chat with Investment Advisor
 */
export const getInvestmentAdvice = async (history: ChatMessage[], newMessage: string, lang: Language): Promise<string> => {
  const apiKey = process.env.API_KEY || localStorage.getItem('GEMINI_API_KEY');
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `
        You are an elite Crypto Investment Advisor and On-Chain Analyst.
        Your goal is to give specific, data-driven advice.
        ${getLangInstruction(lang)}
        
        Key behaviors:
        1. WHALE ANALYSIS: Always try to find info about "whale accumulation", "large wallet inflows", or "exchange outflows" using Google Search.
        2. SPECIFICITY: Don't just say "DYOR". Say "Solana looks good because X, Y, Z, buy zone: $130-140".
        3. TIMEFRAMES: Specify if the trade is Short-term (Scalp), Mid-term (Swing), or Long-term (HODL).
        4. RISKS: Always mention the risk level (Low, Medium, High).
        5. Use bold text for Coin Names and Prices.
        
        Format the output nicely with bullet points.
      `,
      tools: [{ googleSearch: {} }]
    }
  });
  
  try {
    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "N/A";
  } catch (e) {
    console.error("Chat error", e);
    return lang === 'ru' ? "Ошибка соединения." : "Connection error.";
  }
}
