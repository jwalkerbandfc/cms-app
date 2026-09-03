import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'public/index.html'),
        auth: path.resolve(__dirname, 'src/pages/auth.html'),
        admin: path.resolve(__dirname, 'src/pages/admin.html'),
        view: path.resolve(__dirname, 'src/pages/view.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'sortablejs']
  }
});
