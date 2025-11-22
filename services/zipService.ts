
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Generates a ZIP file of the project for the user to download.
 * This allows them to deploy the app or sell the code.
 */
export const exportProjectToZip = async () => {
  const zip = new JSZip();

  // 1. Add Configuration Files
  zip.file("package.json", `{
  "name": "crypto-insider-pro",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.344.0",
    "recharts": "^2.12.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "@google/genai": "^0.1.2",
    "jszip": "^3.10.1",
    "file-saver": "^2.0.5",
    "date-fns": "^3.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1"
  }
}`);

  zip.file("tsconfig.json", `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`);

  zip.file("vite.config.ts", `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`);

  zip.file("tailwind.config.js", `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crypto: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#3b82f6',
          up: '#10b981',
          down: '#ef4444'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}`);

  // 2. Add Readme (Crucial for GitHub)
  zip.file("README.md", `# CryptoInsider Pro 🚀

Professional AI-Powered Dashboard for Crypto Traders and Telegram Channel Owners.

![Crypto Dashboard](https://source.unsplash.com/random/800x400/?crypto,dashboard)

## Features

- **📊 Real-Time Market Data**: Live price tracking and trend analysis.
- **🧠 AI Investment Advisor**: Powered by Google Gemini 2.5 Flash.
- **🐋 Whale Scanner**: Simulates on-chain analysis of large wallet movements.
- **📝 Telegram Post Generator**: Auto-generates viral posts with hashtags and AI charts.
- **🌡️ Sentiment Analysis**: Fear & Greed index based on live news.

## Tech Stack

- React 18 + TypeScript
- Vite
- TailwindCSS
- Google GenAI SDK
- Recharts

## Setup & Installation

1.  **Clone the repo**
    \`\`\`bash
    git clone https://github.com/your-username/crypto-insider-pro.git
    \`\`\`

2.  **Install dependencies**
    \`\`\`bash
    npm install
    \`\`\`

3.  **Run development server**
    \`\`\`bash
    npm run dev
    \`\`\`

4.  **Add API Key**
    Get your Gemini API Key from [Google AI Studio](https://aistudio.google.com/) and enter it in the app UI.

## License

MIT
`);

  // 3. Add Source Files
  // Note: In a browser environment, we can't easily read all files from disk. 
  // We try to fetch them if they are served, or create a basic structure.
  // This ensures the downloaded zip is not empty.
  
  const src = zip.folder("src");
  
  try {
     // Try to fetch main entry points if available on the dev server
     const indexRes = await fetch('/index.html');
     if(indexRes.ok) zip.file("index.html", await indexRes.text());

     // Note: We can't scrape the full TSX source accurately in all preview environments due to bundling.
     // However, we provided the full configuration above.
     // Users can copy the 'src' folder contents from their editor manually if needed.
     src?.file("App.tsx", "// Please copy the App.tsx content from your editor here.");
     src?.file("index.tsx", "// Please copy the index.tsx content from your editor here.");
     
  } catch (e) {
     console.warn("Could not fetch source files dynamically.");
  }

  // Generate and Download
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "crypto-insider-pro.zip");
};
