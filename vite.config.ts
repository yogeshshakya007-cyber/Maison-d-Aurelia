import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // Vercel और सामान्य डिप्लॉयमेंट के लिए डिफ़ॉल्ट रूप से '/' रहेगा।
    // GitHub Pages पर डिप्लॉय करते समय केवल DEPLOY_ENV=gh-pages एनवायरनमेंट वेरिएबल पास करना होगा।
    base: process.env.DEPLOY_ENV === 'gh-pages' ? '/Maison-d-Aurelia/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
