import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      input: {
        main: './public/index.html',
        auth: './src/pages/auth.html',
        admin: './src/pages/admin.html',
        view: './src/pages/view.html'
      }
    }
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
