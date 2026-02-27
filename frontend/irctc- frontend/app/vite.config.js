import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // avoid fallback to a random port
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      '/send-otp': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/verify-otp-and-register': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/contact': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/register': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
