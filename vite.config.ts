import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_BASE_URL || 'https://00a6-102-89-23-36.ngrok-free.app';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/auth': {
          target,
          changeOrigin: true,
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        },
        '/hymns': {
          target,
          changeOrigin: true,
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        },
        '/users': {
          target,
          changeOrigin: true,
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        },
        '/manuals': {
          target,
          changeOrigin: true,
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        },
        '/admin': {
          target,
          changeOrigin: true,
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        },
      },
    },
  };
});
