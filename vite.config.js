// Vite + React config; PWA manifest and service worker are generated via vite-plugin-pwa.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

const CHUNK_SIZE_LIMIT = 153600; // 150 KiB

/** @param {string} id */
function manualChunkForNodeModule(id) {
  if (!id.includes('node_modules')) return undefined;
  if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor-react';
  if (id.includes('node_modules/scheduler')) return 'vendor-react';
  if (id.includes('node_modules/react-router')) return 'vendor-router';
  if (id.includes('node_modules/qrcode')) return 'vendor-qrcode';
  return undefined;
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      devOptions: {
        enabled: true,
        type: 'module',
      },
      includeAssets: ['icons/*.webp', 'map/*.svg', 'u-festival-sw-extras.js'],
      manifest: {
        id: '/',
        name: '❤️U Festival',
        short_name: '❤️U',
        description: '❤️U Festival progressive web app — Utrecht, 5 September 2026',
        start_url: '/',
        scope: '/',
        theme_color: '#F03228',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'nl',
        categories: ['music', 'entertainment', 'events'],
        icons: [
          {
            src: 'icons/logo-white-192.webp',
            sizes: '192x192',
            type: 'image/webp',
            purpose: 'any',
          },
          {
            src: 'icons/logo-white-512.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any',
          },
          {
            src: 'icons/logo-maskable-192.webp',
            sizes: '192x192',
            type: 'image/webp',
            purpose: 'maskable',
          },
          {
            src: 'icons/logo-maskable-512.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        importScripts: ['u-festival-sw-extras.js'],
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,woff2,woff,ttf}'],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => {
              if (url.pathname.startsWith('/api/')) return false;
              return ['style', 'script', 'image', 'font'].includes(request.destination);
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
        ],
      },
    }),
    mode === 'analyze' &&
      visualizer({
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
        open: true,
      }),
  ].filter(Boolean),
  build: {
    chunkSizeWarningLimit: Math.ceil(CHUNK_SIZE_LIMIT / 1024),
    rollupOptions: {
      output: {
        manualChunks(id) {
          return manualChunkForNodeModule(id);
        },
      },
    },
  },
}));
