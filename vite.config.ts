import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5001';

  return {
    plugins: [react()],
    server: {
      port: 5176,
      // Proxy /api requests to backend server during development
      proxy: {
        '/api': {
          target: backendUrl, // Defaults to http://localhost:5001
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(backendUrl)
    }
  };
});
