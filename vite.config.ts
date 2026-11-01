import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHYFmxVNwq3Lf5whBYFgFp_y5yAPZ8cEknfS7i9hDxZdXUwlL-9wYUVWzj6m89ZGsn/exec';
const API_SECRET = 'POCKET_FINANCE_SECRET_2026';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'Pocket Finance',
        short_name: 'PocketFinance',
        description: 'Aplikasi Keuangan Pribadi Terintegrasi Google Sheets',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
    // Local dev API proxy middleware
    {
      name: 'api-proxy-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/')) return next();

          const url = new URL(req.url, 'http://localhost');
          const path = url.pathname.replace('/api/', '');

          try {
            if (req.method === 'GET') {
              let targetUrl = `${APPS_SCRIPT_URL}?key=${encodeURIComponent(API_SECRET)}`;
              if (path === 'metadata' || path === 'dashboard') {
                targetUrl += '&action=metadata';
              } else if (path === 'recent') {
                const limit = url.searchParams.get('limit') || '10';
                targetUrl += `&action=recent&limit=${limit}`;
              } else if (path === 'history') {
                const limit = url.searchParams.get('limit') || '50';
                targetUrl += `&action=history&limit=${limit}`;
              }

              const response = await fetch(targetUrl, { redirect: 'follow' });
              const json = await response.json();
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(json));
              return;
            }

            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const payload = JSON.parse(body || '{}');
                  payload.key = API_SECRET;

                  const response = await fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    redirect: 'follow',
                  });
                  const json = await response.json();
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(json));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: err.message }));
                }
              });
              return;
            }
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: error.message }));
            return;
          }

          next();
        });
      },
    },
  ],
});
