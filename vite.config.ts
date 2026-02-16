
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vite handles environment variables through import.meta.env, 
    // but the system requirement specifies process.env.API_KEY.
    // This mapping ensures the app can access the key injected by the platform.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.VITE_GEMINI_API_KEY)
  }
});
