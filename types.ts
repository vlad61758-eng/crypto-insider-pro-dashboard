
export type Language = 'en' | 'ru';

export interface CoinData {
  symbol: string;
  name: string;
  price: string;
  change24h: string;
  trend: 'up' | 'down' | 'neutral';
  marketCap?: string;
}

export interface CoinDetails extends CoinData {
  description: string;
  history: { date: string; price: number }[]; // For the chart
}

export interface MarketSentiment {
  score: number; // 0 to 100 (Fear to Greed)
  summary: string;
  topNews: NewsItem[];
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
}

export interface GeneratedPost {
  content: string;
  hashtags: string[];
  imageUrl?: string; // Base64 image
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AllocationItem {
  coin: string;
  amount: number;
  percentage: number;
  reason: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  color: string;
}

export interface InvestmentPlan {
  totalBudget: number;
  allocations: AllocationItem[];
  strategySummary: string;
}

export interface WalletAnalysis {
  address: string;
  network: string;
  balance: string;
  activityLevel: 'High' | 'Medium' | 'Low';
  riskScore: number; // 0-100
  tags: string[]; // e.g. "Exchange", "Whale", "Fresh Wallet"
  aiSummary: string;
}

export interface NodeStatus {
  name: string;
  latency: number;
  status: 'Operational' | 'Congested' | 'Down';
  blockHeight: number;
}

export interface PortfolioItem {
  asset: string;
  amount: number;
  valueUsd: number;
  color: string;
}

// Enum for loading states
export enum Status {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
