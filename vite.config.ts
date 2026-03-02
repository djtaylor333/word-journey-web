
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProd = command === 'build' || mode === 'production';
  return {
    base: isProd ? '/word-journey-web/' : '/',
    plugins: [react()],
  };
});
