import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'DeepFrame Media — Dashboard',
        short_name: 'DeepFrame',
        description: 'Panel de mensajería WhatsApp — DeepFrame Media',
        theme_color: '#111b21',
        background_color: '#111b21',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
