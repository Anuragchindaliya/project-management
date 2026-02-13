import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    plugins: [
      react(), 
      // Only use Basic SSL in development for mobile testing
      isDev ? basicSsl() : null
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/shared': path.resolve(__dirname, './src/shared'),
        '@/entities': path.resolve(__dirname, './src/entities'),
        '@/features': path.resolve(__dirname, './src/features'),
        '@/widgets': path.resolve(__dirname, './src/widgets'),
        '@/pages': path.resolve(__dirname, './src/pages'),
        '@/app': path.resolve(__dirname, './src/app'),
      },
    },
    server: {
      host: isDev, // Only expose to network in development
      // https: true, // Removed to fix type error; basicSsl plugin handles this or use {}
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/socket.io': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            ws: true,
        },
      },
    },
  };
});
